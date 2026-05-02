-- Rune Protocol — SQL Core
-- Implements the four runes as first-class SQL objects.
-- PostgreSQL syntax; SQL Server equivalents noted in comments.
--
-- The four runes in SQL:
--   @  →  VIEW or generated/computed column (read, one-way)
--   ~  →  mutable TABLE column (sync, two-way)
--   !  →  FUNCTION or STORED PROCEDURE (act, explicit trigger)
--   ?  →  COMMENT ON or rune_intent table row (annotation, no runtime effect)

-- ─────────────────────────────────────────────
-- Rune metadata tables
-- Optional — required for Level 2+ compliance.
-- Level 0 hosts use SQL comments only.
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rune_bindings (
    id             SERIAL PRIMARY KEY,
    element_path   TEXT        NOT NULL,  -- table.column, view.column, proc name
    rune_type      CHAR(1)     NOT NULL CHECK (rune_type IN ('@', '~', '!', '?')),
    identifier     TEXT        NOT NULL,  -- the name after the sigil
    annotation     TEXT,                  -- populated for ? only
    registered_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SQL Server equivalent:
-- CREATE TABLE rune_bindings (
--     id            INT IDENTITY(1,1) PRIMARY KEY,
--     element_path  NVARCHAR(500) NOT NULL,
--     rune_type     CHAR(1)       NOT NULL CHECK (rune_type IN ('@','~','!','?')),
--     identifier    NVARCHAR(500) NOT NULL,
--     annotation    NVARCHAR(MAX),
--     registered_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
-- );

CREATE TABLE IF NOT EXISTS rune_intent (
    id             SERIAL PRIMARY KEY,
    element_path   TEXT        NOT NULL,
    annotation     TEXT        NOT NULL,
    recorded_by    TEXT,                  -- username / service principal
    recorded_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Helper: register a binding programmatically
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION rune_register(
    p_element_path  TEXT,
    p_rune_type     CHAR(1),
    p_identifier    TEXT,
    p_annotation    TEXT DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    IF p_rune_type NOT IN ('@', '~', '!', '?') THEN
        RAISE EXCEPTION '[RNE001] Unknown rune type: %. Must be @, ~, !, or ?', p_rune_type;
    END IF;

    INSERT INTO rune_bindings (element_path, rune_type, identifier, annotation)
    VALUES (p_element_path, p_rune_type, p_identifier, p_annotation)
    ON CONFLICT DO NOTHING;

    IF p_rune_type = '?' AND p_annotation IS NOT NULL THEN
        INSERT INTO rune_intent (element_path, annotation)
        VALUES (p_element_path, p_annotation);
    END IF;
END;
$$;

-- ─────────────────────────────────────────────
-- Helper: query all intent for an element
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION rune_intent_for(p_element_path TEXT)
RETURNS TABLE(annotation TEXT, recorded_at TIMESTAMPTZ)
LANGUAGE sql AS $$
    SELECT annotation, recorded_at
    FROM   rune_intent
    WHERE  element_path = p_element_path
    ORDER BY recorded_at;
$$;

-- ─────────────────────────────────────────────
-- Helper: export all intent — for AI tooling / audit
-- ─────────────────────────────────────────────

CREATE OR REPLACE VIEW rune_intent_all AS
    SELECT
        element_path,
        jsonb_agg(
            jsonb_build_object(
                'annotation',   annotation,
                'recorded_by',  recorded_by,
                'recorded_at',  recorded_at
            ) ORDER BY recorded_at
        ) AS annotations
    FROM  rune_intent
    GROUP BY element_path;

-- ─────────────────────────────────────────────
-- Helper: validate that a ~ target is not a view
-- (prevents RNE003: sync to computed)
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION rune_assert_mutable(p_identifier TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM rune_bindings
        WHERE identifier = p_identifier AND rune_type = '@'
    ) THEN
        RAISE EXCEPTION '[RNE003] Cannot sync to computed/read binding: %', p_identifier;
    END IF;
END;
$$;
