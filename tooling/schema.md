# Schema Reference

`rune.schema.json` is the canonical binding manifest — the artifact that turns cross-layer contracts from aspirational to enforceable.

Without the schema, Rune is a convention. With it, Rune is a contract.

The schema is hosted at [`rune.semanticintent.dev/rune.schema.json`](https://rune.semanticintent.dev/rune.schema.json) (JSON Schema draft-07).

---

## Manifest structure

```json
{
  "$schema": "https://rune.semanticintent.dev/rune.schema.json",
  "$rune": "1.1",
  "host": {
    "format": "react",
    "version": "1.0.0",
    "source": "app.tsx"
  },
  "bindings": {
    "risk-threshold": {
      "rune": "~",
      "type": "number",
      "min": 0.05,
      "max": 0.30,
      "intent": "approved by risk committee Q1-2025 — review at quarter end"
    },
    "market-price": {
      "rune": "@",
      "type": "number",
      "intent": "live NBBO feed — not manually entered"
    },
    "submit-order": {
      "rune": "!",
      "args": [{ "name": "order-id", "type": "string", "required": true }],
      "intent": "explicit, logged to OMS, irrevocable"
    },
    "screen-purpose": {
      "rune": "?",
      "intent": "trading terminal — real-money consequences, every action logged"
    }
  }
}
```

---

## Top-level fields

| Field | Required | Description |
|-------|----------|-------------|
| `$schema` | No | URI to the meta-schema — enables IDE validation |
| `$rune` | **Yes** | Protocol version — must be `"1.1"` |
| `host` | No | Metadata about the host that owns these bindings |
| `bindings` | **Yes** | Named binding declarations (see below) |

### `host`

| Field | Description |
|-------|-------------|
| `format` | Host format identifier — `"mere"`, `"react"`, `"csharp"`, `"sql"`, etc. |
| `version` | Version of the host document or application |
| `source` | Path or identifier of the source document |

---

## Binding declaration

Binding keys must be **kebab-case** (`^[a-z][a-z0-9-]*$`). This is the canonical form — hosts translate to their own conventions.

| Host | `risk-threshold` becomes |
|------|--------------------------|
| SQL | `risk_threshold` |
| C# | `RiskThreshold` |
| React | `'risk-threshold'` |

The schema is the arbiter when layers disagree on naming.

### Binding fields

| Field | Required | Description |
|-------|----------|-------------|
| `rune` | **Yes** | `"@"` read, `"~"` sync, `"!"` act, `"?"` intent |
| `type` | Recommended | Value type — `string`, `number`, `boolean`, `array`, `object` |
| `intent` | Required for `?` | The `?` annotation — rationale, constraint, governance |
| `args` | For `!` only | Parameter declarations (see below) |
| `min` | For `number` | Minimum value — RNE005 if violated |
| `max` | For `number` | Maximum value — RNE005 if violated |
| `enum` | For `string` | Allowed values — RNE005 if an unlisted value is assigned |
| `maxLength` | For `string` | Max character length — maps to `PIC X(n)` in RECALL, `VARCHAR(n)` in SQL |

### Rune types

| Rune | Name | What it governs |
|------|------|-----------------|
| `@` | read | One-way, state → display. No side effects. Not writable. |
| `~` | sync | Bidirectional. Input and state stay in sync. Mutable. |
| `!` | act | Explicit invocation. Nothing happens without a call. |
| `?` | intent | Annotation only. No runtime effect. Travels with the binding. |

### `args` (for `!` act bindings)

```json
"submit-order": {
  "rune": "!",
  "args": [
    { "name": "order-id",  "type": "string",  "required": true  },
    { "name": "quantity",  "type": "number",  "required": true  },
    { "name": "dry-run",   "type": "boolean", "required": false }
  ]
}
```

| Field | Description |
|-------|-------------|
| `name` | Parameter name |
| `type` | `string`, `number`, `boolean`, `state-ref` |
| `required` | Whether the parameter must be supplied at call sites |

`state-ref` means the argument value is a binding id — the action receives the current state value of that binding.

---

## Constraint validation (RNE005)

The schema validator raises RNE005 when:

- `min` or `max` is declared on a non-`number` binding
- `enum` is declared on a non-`string` binding
- `min` is greater than `max`
- `args` is declared on a non-`!` binding

---

## Complete example

A Mere workbook binding manifest showing all four runes with full constraint declarations:

```json
{
  "$schema": "https://rune.semanticintent.dev/rune.schema.json",
  "$rune": "1.1",
  "host": { "format": "mere", "source": "task-workbook.mp.html" },
  "bindings": {
    "tasks":           { "rune": "@", "type": "array",  "intent": "computed — do not mutate directly" },
    "new-task":        { "rune": "~", "type": "string", "maxLength": 200, "intent": "cleared after !add-task fires" },
    "task-filter":     { "rune": "~", "type": "string", "enum": ["all", "active", "completed"], "intent": "controls @tasks subset" },
    "task-count":      { "rune": "@", "type": "number", "intent": "live count of active tasks — display only" },
    "add-task":        { "rune": "!", "args": [{ "name": "title", "type": "state-ref", "required": true }], "intent": "no-op if ~new-task is empty" },
    "complete-task":   { "rune": "!", "args": [{ "name": "task-id", "type": "string", "required": true }], "intent": "irreversible" },
    "clear-completed": { "rune": "!", "intent": "destructive — no undo" },
    "workbook-purpose":{ "rune": "?", "intent": "personal task tracking — single user, no persistence beyond session" }
  }
}
```

See [`examples/task-workbook.rune.json`](https://github.com/semanticintent/rune-protocol/blob/main/examples/task-workbook.rune.json) in the repository.

---

## Tooling

Use `rune validate` from `@semanticintent/rune-cli` to validate any manifest against this schema:

```sh
rune validate my-app.rune.json
rune validate my-app.rune.json --format json   # CI-friendly
```

Use `rune extract` to generate a manifest from existing source:

```sh
rune extract src/          # scan and bootstrap
rune validate rune.json    # see what's missing
```

See [CLI reference →](/tooling/cli)
