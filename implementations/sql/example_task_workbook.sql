-- Rune Protocol — SQL Task Workbook Example
-- Direct SQL equivalent of the C# TaskWorkbook.
-- Shows all four rune types mapped to native SQL objects.

-- ─────────────────────────────────────────────
-- ~ mutable state (sync bindings)
-- Raw table columns the user edits.
-- ─────────────────────────────────────────────

CREATE TABLE tasks (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title      TEXT        NOT NULL,
    done       BOOLEAN     NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ~new-task: transient input buffer — cleared after add-task fires
CREATE TABLE task_input (
    session_id  TEXT PRIMARY KEY,
    new_task    TEXT NOT NULL DEFAULT ''
);

-- ? intent on mutable columns
COMMENT ON COLUMN task_input.new_task IS
    '~new-task ?"current input value, cleared after add-task fires"';

COMMENT ON TABLE tasks IS
    '~tasks ?"active task list — user-managed, no auto-sorting"';

-- ─────────────────────────────────────────────
-- @ computed (read bindings)
-- Views are read-only by design — cannot be the target of ~ sync.
-- ─────────────────────────────────────────────

-- @pending — tasks not yet complete
CREATE OR REPLACE VIEW pending AS
    SELECT id, title, created_at
    FROM   tasks
    WHERE  done = false
    ORDER BY created_at;

COMMENT ON VIEW pending IS '@pending ?"derived — do not write directly, use !complete-task"';

-- @task-count — summary for display
CREATE OR REPLACE VIEW task_summary AS
    SELECT
        COUNT(*)                           AS total,
        COUNT(*) FILTER (WHERE done)       AS completed,
        COUNT(*) FILTER (WHERE NOT done)   AS pending
    FROM tasks;

COMMENT ON VIEW task_summary IS '@task-summary ?"read-only aggregate — no sync target"';

-- ─────────────────────────────────────────────
-- ! actions (act bindings)
-- Functions are the only way to mutate state — no implicit side effects.
-- Every consequential operation is an explicit function call.
-- ─────────────────────────────────────────────

-- !add-task — reads new_task from input buffer, clears it
CREATE OR REPLACE FUNCTION act_add_task(p_session_id TEXT)
RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
    v_title TEXT;
    v_id    UUID;
BEGIN
    SELECT new_task INTO v_title
    FROM   task_input
    WHERE  session_id = p_session_id;

    IF v_title IS NULL OR TRIM(v_title) = '' THEN
        RETURN NULL;
    END IF;

    INSERT INTO tasks (title) VALUES (TRIM(v_title)) RETURNING id INTO v_id;

    -- Clear input buffer after successful add
    UPDATE task_input SET new_task = '' WHERE session_id = p_session_id;

    RETURN v_id;
END;
$$;

COMMENT ON FUNCTION act_add_task IS '!add-task ?"reads ~new-task, inserts into tasks, clears buffer"';

-- !complete-task
CREATE OR REPLACE FUNCTION act_complete_task(p_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
    UPDATE tasks SET done = true WHERE id = p_id AND done = false;
    RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION act_complete_task IS '!complete-task ?"idempotent — safe to call twice"';

-- !delete-task
CREATE OR REPLACE FUNCTION act_delete_task(p_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM tasks WHERE id = p_id;
    RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION act_delete_task IS '!delete-task';

-- ─────────────────────────────────────────────
-- ? intent registration
-- Register all bindings for tooling / AI introspection.
-- ─────────────────────────────────────────────

SELECT rune_register('task_input.new_task', '~', 'new-task',
    'current input value, cleared after add-task fires');

SELECT rune_register('tasks', '~', 'tasks',
    'active task list — user-managed, no auto-sorting');

SELECT rune_register('pending', '@', 'pending',
    'derived from tasks where done = false');

SELECT rune_register('task_summary', '@', 'task-summary');

SELECT rune_register('act_add_task', '!', 'add-task',
    'reads ~new-task, inserts into tasks, clears buffer');

SELECT rune_register('act_complete_task', '!', 'complete-task',
    'idempotent — safe to call twice');

SELECT rune_register('act_delete_task', '!', 'delete-task');

-- ─────────────────────────────────────────────
-- Usage
-- ─────────────────────────────────────────────

-- ~ sync: user types "Buy groceries"
-- UPDATE task_input SET new_task = 'Buy groceries' WHERE session_id = 'u1';

-- ! act: user clicks "Add Task"
-- SELECT act_add_task('u1');

-- @ read: render pending list
-- SELECT * FROM pending;

-- ! act: user clicks "Complete"
-- SELECT act_complete_task('3f2a...');

-- ? query all intent (for AI tooling or audit)
-- SELECT * FROM rune_intent_all;
