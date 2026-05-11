# @semanticintent/rune-cli

CLI tooling for [Rune Protocol](https://rune.semanticintent.dev) — validate binding manifests and extract bindings from source.

```sh
npm install -g @semanticintent/rune-cli
```

**Typical workflow:**

```sh
rune extract src/          # scan source → generate rune.json
rune validate rune.json    # find missing types and intent annotations
# enrich rune.json with types, intent, constraints
rune validate rune.json    # clean run — manifest is now a contract
```

---

## rune extract

Scans source files for Rune bindings and generates a `.rune.json` manifest. Zero-friction onboarding for existing Rune-annotated codebases.

```sh
rune extract src/app.tsx               # single file, auto-detect format
rune extract src/                      # scan directory recursively
rune extract src/ --host html          # force host format
rune extract src/ --out my-app.rune.json  # custom output path
```

**Supported host formats** (auto-detected from file extension):

| Format | Extensions | Patterns detected |
|--------|------------|-------------------|
| `html` | `.html`, `.mp` | `@id`, `~id`, `!id` as attribute names; `?"annotation"` |
| `ts` | `.ts`, `.tsx`, `.js`, `.jsx` | `useRead()`, `useSync()`, `useAct()`, `useIntent()` |
| `csharp` | `.cs` | `[RuneState]`, `[RuneComputed]`, `[RuneAction]`, `[RuneIntent("...")]` |
| `sql` | `.sql` | `COMMENT ON ... IS 'rune:@ ...'` annotations |

**Output:**

```
✓ extracted 7 bindings from 3 files
  @ read: 2  ~ sync: 2  ! act: 2  ? intent: 1
  → rune.json
  Run 'rune validate rune.json' to find missing types and intent annotations.
```

The manifest is a valid starting point — types and intent annotations are missing until you enrich it. Run `rune validate` to see exactly what's needed.

---

## rune validate

Validates a `.rune.json` binding manifest against `rune.schema.json`.

```sh
rune validate my-app.rune.json
rune validate my-app.rune.json --format json
```

**Text output (default):**

```
✓ my-app.rune.json — valid
  3 warnings
  [RNE006] risk-threshold binding 'risk-threshold' has no intent annotation
           Bindings without ? intent travel without rationale. Consider adding one.
```

**JSON output (for CI pipelines and editors):**

```json
{
  "manifest": "my-app.rune.json",
  "valid": true,
  "errorCount": 0,
  "warningCount": 3,
  "diagnostics": [...]
}
```

**Exit codes:** `0` = valid (errors may still be 0, warnings present), `1` = invalid (one or more errors).

---

## Diagnostic codes

| Code | Severity | Description |
|------|----------|-------------|
| `RNE001` | error | Invalid rune type — must be `@` `~` `!` `?` |
| `RNE002` | error | Unknown binding reference |
| `RNE003` | error | Invalid rune for binding kind (e.g. args on `@`) |
| `RNE004` | error | Missing required field (e.g. `intent` on `?` binding) |
| `RNE005` | error | Constraint violation (min/max on non-number, enum on non-string, min > max) |
| `RNE006` | warning | Missing intent annotation or type declaration |
| `RNE007` | error | Manifest does not conform to `rune.schema.json` structural schema |

---

## Manifest format

See [rune.schema.json](../rune.schema.json) and [examples/task-workbook.rune.json](../examples/task-workbook.rune.json) for the full format.

Quick reference:

```json
{
  "$schema": "https://rune.semanticintent.dev/rune.schema.json",
  "$rune": "1.1",
  "host": { "format": "react", "source": "app.tsx" },
  "bindings": {
    "risk-threshold": {
      "rune": "~",
      "type": "number",
      "min": 0.05,
      "max": 0.30,
      "intent": "approved by risk committee Q1-2025"
    },
    "market-price": { "rune": "@", "type": "number", "intent": "live feed — not manually entered" },
    "submit-order":  { "rune": "!", "args": [{ "name": "order-id", "type": "string", "required": true }] }
  }
}
```

---

Part of the [Rune Protocol](https://rune.semanticintent.dev) ecosystem. MIT license.
