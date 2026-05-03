# SQL Implementation (PostgreSQL)

SQL maps the four runes to native database objects. The mapping is direct and structural — not a convention, a type-system claim.

| Rune | SQL Object | Why |
|------|-----------|-----|
| `@` | `VIEW` or generated column | Read-only by database contract — cannot be the target of `INSERT`/`UPDATE` |
| `~` | Mutable `TABLE` column | Writable, named, addressable — the mutation surface |
| `!` | `FUNCTION` or `PROCEDURE` | The only sanctioned path to consequential operations |
| `?` | `COMMENT ON` + `rune_intent` table | Co-located, versioned, queryable at runtime |

---

## rune_core.sql — Registry

Optional at Level 0. Required for Level 2+ compliance.

```sql
-- Every binding in the system — one row per rune
CREATE TABLE rune_bindings (
    id             SERIAL PRIMARY KEY,
    element_path   TEXT     NOT NULL,  -- e.g. 'risk_parameters.risk_threshold'
    rune_type      CHAR(1)  NOT NULL CHECK (rune_type IN ('@', '~', '!', '?')),
    identifier     TEXT     NOT NULL,  -- canonical kebab-case name
    annotation     TEXT,               -- populated for ? only
    registered_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ? annotations — never discarded, append-only
CREATE TABLE rune_intent (
    id            SERIAL PRIMARY KEY,
    element_path  TEXT NOT NULL,
    annotation    TEXT NOT NULL,
    recorded_by   TEXT,
    recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Export all intent — for AI tooling and audit
CREATE VIEW rune_intent_all AS
    SELECT element_path,
           jsonb_agg(jsonb_build_object(
               'annotation',  annotation,
               'recorded_by', recorded_by,
               'recorded_at', recorded_at
           ) ORDER BY recorded_at) AS annotations
    FROM   rune_intent
    GROUP BY element_path;
```

Register a binding with a single call:

```sql
SELECT rune_register('risk_parameters.risk_threshold', '~', 'risk-threshold',
    'approved by risk committee Q1-2025 — review at quarter end');
```

---

## Task Workbook Example

```sql
-- ~ mutable state — user-managed
CREATE TABLE tasks (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title      TEXT NOT NULL,
    done       BOOLEAN NOT NULL DEFAULT false
);

COMMENT ON TABLE tasks IS
    '~tasks ?"active task list — user-managed, no auto-sorting"';

-- @ computed — read-only view, structural guarantee
CREATE VIEW pending AS
    SELECT id, title FROM tasks WHERE done = false;

COMMENT ON VIEW pending IS '@pending ?"derived — write via !complete-task only"';

-- ! action — the only path to mutation
CREATE FUNCTION act_add_task(p_session_id TEXT) RETURNS UUID
LANGUAGE plpgsql AS $$
DECLARE v_title TEXT; v_id UUID;
BEGIN
    SELECT new_task INTO v_title FROM task_input WHERE session_id = p_session_id;
    IF TRIM(v_title) = '' THEN RETURN NULL; END IF;
    INSERT INTO tasks (title) VALUES (TRIM(v_title)) RETURNING id INTO v_id;
    UPDATE task_input SET new_task = '' WHERE session_id = p_session_id;
    RETURN v_id;
END; $$;
```

---

## Risk Dashboard Example

```sql
-- ~ analyst-editable thresholds with ? intent
CREATE TABLE risk_parameters (
    desk_id        TEXT PRIMARY KEY,
    risk_threshold NUMERIC(5,4) NOT NULL DEFAULT 0.15,
    stop_loss      NUMERIC(5,4) NOT NULL DEFAULT 0.05
);

COMMENT ON COLUMN risk_parameters.risk_threshold IS
    '~risk-threshold ?"approved by risk committee Q1-2025 — review at quarter end"';

COMMENT ON COLUMN risk_parameters.stop_loss IS
    '~stop-loss ?"maximum drawdown per desk policy v2.3 — change requires desk-head sign-off"';

-- @ live feed — VIEW enforces the read contract
CREATE VIEW v_market_price AS
    SELECT instrument_id, price, refreshed_at FROM market_prices;

COMMENT ON VIEW v_market_price IS
    '@market-price ?"live NBBO feed — not manually entered"';

-- ! explicit action — logged, irrevocable
CREATE FUNCTION act_submit_order(p_order_id UUID, p_trader_id TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    -- Pre-trade risk check, OMS submission, audit log
    -- The ! invariant: no order reaches the OMS without passing through here
    UPDATE orders SET status = 'SUBMITTED' WHERE order_id = p_order_id;
    RETURN 'OMS-' || extract(epoch FROM now())::BIGINT;
END; $$;
```

The `VIEW` makes `@market-price` non-writable at the database level — not a naming convention, a structural constraint. `act_submit_order` is the only path to order submission — the `!` invariant holds at the SQL layer the same way it holds in C# and React.

---

## Querying Intent

```sql
-- All intent for a specific binding (for AI tooling)
SELECT * FROM rune_intent_for('risk_parameters.risk_threshold');

-- Full intent map — every binding, every annotation
SELECT * FROM rune_intent_all;
```

---

## Full Source

[`implementations/sql/`](https://github.com/semanticintent/rune-protocol/tree/main/implementations/sql) on GitHub.
