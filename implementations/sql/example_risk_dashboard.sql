-- Rune Protocol — SQL Risk Dashboard Example
-- Direct SQL equivalent of the C# RiskDashboardExample.
-- Shows why ! matters in finance: every consequential action is an explicit function call.

-- ─────────────────────────────────────────────
-- ~ mutable state — analyst-editable thresholds
-- These columns are addressable by name, auditable by row.
-- ─────────────────────────────────────────────

CREATE TABLE risk_parameters (
    desk_id         TEXT        PRIMARY KEY,
    risk_threshold  NUMERIC(5,4) NOT NULL DEFAULT 0.15,
    stop_loss       NUMERIC(5,4) NOT NULL DEFAULT 0.05,
    position_limit  NUMERIC(18,2),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      TEXT
);

COMMENT ON COLUMN risk_parameters.risk_threshold IS
    '~risk-threshold ?"approved by risk committee Q1-2025 — review at quarter end"';

COMMENT ON COLUMN risk_parameters.stop_loss IS
    '~stop-loss ?"maximum drawdown per desk policy v2.3 — change requires desk-head sign-off"';

COMMENT ON COLUMN risk_parameters.position_limit IS
    '~position-limit ?"VaR-based — see risk model v4.1 for calculation"';

COMMENT ON TABLE risk_parameters IS
    '?"all threshold changes logged to compliance_audit — REC-2024-007"';

-- Audit trail — every ~ write is logged here
CREATE TABLE risk_parameter_audit (
    id              BIGSERIAL   PRIMARY KEY,
    desk_id         TEXT        NOT NULL,
    parameter_name  TEXT        NOT NULL,
    old_value       TEXT,
    new_value       TEXT        NOT NULL,
    changed_by      TEXT        NOT NULL,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    rationale       TEXT
);

-- Trigger: automatically audit every ~ sync to risk_parameters
CREATE OR REPLACE FUNCTION risk_parameters_audit_fn()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.risk_threshold IS DISTINCT FROM OLD.risk_threshold THEN
        INSERT INTO risk_parameter_audit (desk_id, parameter_name, old_value, new_value, changed_by)
        VALUES (NEW.desk_id, 'risk_threshold', OLD.risk_threshold::TEXT, NEW.risk_threshold::TEXT, NEW.updated_by);
    END IF;
    IF NEW.stop_loss IS DISTINCT FROM OLD.stop_loss THEN
        INSERT INTO risk_parameter_audit (desk_id, parameter_name, old_value, new_value, changed_by)
        VALUES (NEW.desk_id, 'stop_loss', OLD.stop_loss::TEXT, NEW.stop_loss::TEXT, NEW.updated_by);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER risk_parameters_audit
    AFTER UPDATE ON risk_parameters
    FOR EACH ROW EXECUTE FUNCTION risk_parameters_audit_fn();

-- ─────────────────────────────────────────────
-- @ computed (read bindings)
-- Live market data is always read-only.
-- Views enforce the @ contract at the database level.
-- ─────────────────────────────────────────────

-- Source tables (populated by market data feed, not by the app)
CREATE TABLE market_prices (
    instrument_id  TEXT        PRIMARY KEY,
    price          NUMERIC(18,6) NOT NULL,
    refreshed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE positions (
    position_id  TEXT        PRIMARY KEY,
    desk_id      TEXT        NOT NULL,
    instrument_id TEXT       NOT NULL,
    quantity     NUMERIC(18,4) NOT NULL,
    entry_price  NUMERIC(18,6) NOT NULL,
    pnl          NUMERIC(18,2),
    delta        NUMERIC(10,6)
);

-- @market-price — live NBBO feed, read-only by view contract
CREATE OR REPLACE VIEW v_market_price AS
    SELECT instrument_id, price, refreshed_at
    FROM   market_prices;

COMMENT ON VIEW v_market_price IS
    '@market-price ?"live NBBO feed, 15ms refresh — do not write, feed-managed"';

-- @position.pnl, @position.delta — derived display values
CREATE OR REPLACE VIEW v_position AS
    SELECT
        p.position_id,
        p.desk_id,
        p.instrument_id,
        p.quantity,
        p.pnl,
        p.delta,
        m.price AS current_price
    FROM  positions p
    JOIN  market_prices m USING (instrument_id);

COMMENT ON VIEW v_position IS
    '@position ?"read-only — pnl and delta are computed by risk engine, not manually entered"';

-- ─────────────────────────────────────────────
-- ! actions — explicit, auditable, irrevocable
-- Stored functions are the only path to order submission.
-- No implicit side effects from reading or syncing thresholds.
-- ─────────────────────────────────────────────

CREATE TABLE orders (
    order_id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    desk_id      TEXT        NOT NULL,
    instrument_id TEXT       NOT NULL,
    quantity     NUMERIC(18,4) NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_by TEXT        NOT NULL,
    oms_ref      TEXT,
    status       TEXT        NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','SUBMITTED','FILLED','REJECTED','CANCELLED'))
);

-- !submit-order — explicit, logged to OMS, irrevocable
CREATE OR REPLACE FUNCTION act_submit_order(
    p_order_id   UUID,
    p_trader_id  TEXT
) RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    v_desk         TEXT;
    v_threshold    NUMERIC;
    v_oms_ref      TEXT;
BEGIN
    SELECT desk_id INTO v_desk FROM orders WHERE order_id = p_order_id;

    SELECT risk_threshold INTO v_threshold
    FROM   risk_parameters WHERE desk_id = v_desk;

    -- Pre-trade risk check (simplified)
    IF NOT EXISTS (
        SELECT 1 FROM orders WHERE order_id = p_order_id AND status = 'PENDING'
    ) THEN
        RAISE EXCEPTION '[RNE005] Order % is not in PENDING state', p_order_id;
    END IF;

    -- Submit to OMS (in real impl: call external service, capture ref)
    v_oms_ref := 'OMS-' || extract(epoch FROM now())::BIGINT;

    UPDATE orders
    SET    status = 'SUBMITTED', oms_ref = v_oms_ref
    WHERE  order_id = p_order_id;

    -- Rune ! guarantees explicitness — this insert is the audit trail
    INSERT INTO risk_parameter_audit
        (desk_id, parameter_name, old_value, new_value, changed_by, rationale)
    VALUES
        (v_desk, '!submit-order', NULL, p_order_id::TEXT, p_trader_id,
         'Order submitted to OMS: ' || v_oms_ref);

    RETURN v_oms_ref;
END;
$$;

COMMENT ON FUNCTION act_submit_order IS
    '!submit-order ?"explicit, logged to OMS, irrevocable — requires pre-trade risk check"';

-- !escalate-breach — triggers compliance notification
CREATE OR REPLACE FUNCTION act_escalate_breach(
    p_desk_id    TEXT,
    p_raised_by  TEXT
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO risk_parameter_audit
        (desk_id, parameter_name, old_value, new_value, changed_by)
    VALUES
        (p_desk_id, '!escalate-breach', NULL, 'ESCALATED', p_raised_by);

    -- In real impl: call notification service, post to compliance queue
END;
$$;

COMMENT ON FUNCTION act_escalate_breach IS
    '!escalate-breach ?"triggers compliance notification — all breaches logged to REC-2024-007"';

-- !override-limit — requires reason argument, logged with rationale
CREATE OR REPLACE FUNCTION act_override_limit(
    p_desk_id   TEXT,
    p_trader_id TEXT,
    p_reason    TEXT
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    IF TRIM(p_reason) = '' THEN
        RAISE EXCEPTION '[RNE005] !override-limit requires a non-empty reason argument';
    END IF;

    INSERT INTO risk_parameter_audit
        (desk_id, parameter_name, old_value, new_value, changed_by, rationale)
    SELECT
        desk_id, '!override-limit',
        position_limit::TEXT, 'OVERRIDE', p_trader_id, p_reason
    FROM   risk_parameters
    WHERE  desk_id = p_desk_id;
END;
$$;

COMMENT ON FUNCTION act_override_limit IS
    '!override-limit ?"requires reason argument — logged with rationale per policy v2.3"';

-- ─────────────────────────────────────────────
-- ? intent registration — never discarded
-- ─────────────────────────────────────────────

SELECT rune_register('risk_parameters.risk_threshold', '~', 'risk-threshold',
    'approved by risk committee Q1-2025 — review at quarter end');

SELECT rune_register('risk_parameters.stop_loss', '~', 'stop-loss',
    'maximum drawdown per desk policy v2.3 — change requires desk-head sign-off');

SELECT rune_register('risk_parameters.position_limit', '~', 'position-limit',
    'VaR-based — see risk model v4.1 for calculation');

SELECT rune_register('v_market_price', '@', 'market-price',
    'live NBBO feed, 15ms refresh');

SELECT rune_register('v_position', '@', 'position');

SELECT rune_register('act_submit_order', '!', 'submit-order',
    'explicit, logged to OMS, irrevocable');

SELECT rune_register('act_escalate_breach', '!', 'escalate-breach',
    'triggers compliance notification');

SELECT rune_register('act_override_limit', '!', 'override-limit',
    'requires reason argument — logged with rationale');

SELECT rune_register('risk_dashboard', '?', '',
    'institutional order screen — notional > $1M — see access control policy');

SELECT rune_register('risk_dashboard', '?', '',
    'all actions logged to compliance trail — REC-2024-007');

-- ─────────────────────────────────────────────
-- Usage
-- ─────────────────────────────────────────────

-- @ read: render live market data
-- SELECT price FROM v_market_price WHERE instrument_id = 'ES';

-- @ read: render position P&L
-- SELECT pnl, delta FROM v_position WHERE desk_id = 'DESK-A';

-- ~ sync: analyst edits threshold
-- UPDATE risk_parameters
-- SET    risk_threshold = 0.12, updated_by = 'jsmith@firm.com'
-- WHERE  desk_id = 'DESK-A';

-- ! act: trader submits order
-- SELECT act_submit_order('3f2a...', 'jsmith@firm.com');

-- ! act: compliance breach
-- SELECT act_escalate_breach('DESK-A', 'compliance@firm.com');

-- ? query all intent for AI / audit tooling
-- SELECT * FROM rune_intent_all;

-- ? query intent for a specific threshold
-- SELECT * FROM rune_intent_for('risk_parameters.risk_threshold');
