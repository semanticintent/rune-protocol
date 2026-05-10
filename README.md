# Rune Protocol

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.20007883.svg)](https://doi.org/10.5281/zenodo.20007883)

**A four-sigil reactive binding protocol for documents.**

Rune is a minimal, embeddable protocol that gives any document format four operations: read state, sync state, trigger actions, and declare intent. Nothing more.

```
@  read      — display a value from state
~  sync      — two-way binding between input and state
!  act       — trigger a named action
?  intent    — annotate meaning for humans and AI
```

---

## The Protocol in 30 Seconds

Every interactive document needs the same four things. Rune names them once:

```html
<!-- A task input that syncs, triggers, displays, and annotates -->
<field ~new-task placeholder="New task…"/>          <!-- sync: user types → state updates -->
<button !add-task>Add</button>                      <!-- act: explicit trigger -->
<list @tasks>                                        <!-- read: display state -->
  <item @item.title/>
</list>
<screen ?"mobile task list, minimal, focus on speed"> <!-- intent: AI metadata -->
```

No framework. No runtime dependency. Four characters, complete grammar.

---

## Why Rune Exists

Every domain that has reactive data reinvents the same four operations from scratch — incompatibly:

| System | Read | Sync | Act | Intent |
|--------|------|------|-----|--------|
| React | `{val}` | `onChange` | `onClick` | — |
| Angular | `[prop]` | `[(ngModel)]` | `(event)` | — |
| Vue | `:prop` | `v-model` | `@click` | — |
| Config files | `${ENV}` | — | — | `# comment` |
| SQL | `@param` | — | — | `-- comment` |
| **Rune** | `@` | `~` | `!` | `?` |

None are interoperable. None are complete. None have the fourth operation.

`?` is what makes Rune new. It is not a comment — it is **structured intent** that travels with the binding, is addressable by tooling, and is machine-readable by AI. No existing binding protocol has this.

---

## The Four Runes

| Rune | Name | Direction | Meaning |
|------|------|-----------|---------|
| `@` | Read | State → Display | Observe a value. No side effects. |
| `~` | Sync | State ↔ Input | Bidirectional coupling. Input and state stay in sync. |
| `!` | Act | User → Behavior | Explicit invocation. Nothing happens without intent. |
| `?` | Intent | Document → Human/AI | Structured annotation. Ignored at runtime. Read by tools. |

These four are **complete**. You cannot add a fifth without it being redundant. That bounded completeness is what makes Rune embeddable — it is a protocol, not a framework.

---

## Rune is a Protocol, Not a Runtime

A framework says "use our runtime."  
A protocol says "adopt this grammar, implement your own runtime."

Rune defines the **semantics** of the four runes. Host formats define the **element vocabulary**. Each host provides its own runtime — or embeds the Rune reference runtime.

**Mere** (the workbook format for apps) is Rune's origin and reference implementation.  
Any format can be a Rune host.

---

## Host Formats

Rune has been designed to embed naturally in:

- **UI documents** — application screens, dashboards, forms
- **Configuration files** — infrastructure, environment, deployment
- **Publishing formats** — documents, reports, templates
- **Domain languages** — trading signals, clinical records, legal contracts
- **API specifications** — interactive docs with live bindings

See [HOSTS.md](HOSTS.md) for the host implementation guide.

---

## Schema

**`rune.schema.json`** is the canonical binding manifest — the artifact that makes cross-layer contracts enforceable.

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
      "intent": "approved by risk committee Q1-2025 — review at quarter end"
    },
    "market-price":  { "rune": "@", "type": "number", "intent": "live NBBO feed — not manually entered" },
    "submit-order":  { "rune": "!", "args": [{ "name": "order-id", "type": "string", "required": true }], "intent": "explicit, logged to OMS, irrevocable" }
  }
}
```

Keys are canonical kebab-case identifiers. Hosts translate to their own conventions — SQL: `risk_threshold`, C#: `RiskThreshold`, React: `'risk-threshold'`. The schema is the arbiter.

See [examples/task-workbook.rune.json](examples/task-workbook.rune.json) for a complete manifest and [CONTRACTS.md](CONTRACTS.md) for the full cross-layer enforcement model.

---

## Specification

- [SPEC.md](SPEC.md) — Formal definition of the four runes
- [PHILOSOPHY.md](PHILOSOPHY.md) — Why four, why these four, the completeness argument
- [INDUSTRY.md](INDUSTRY.md) — How Rune reflects across domains
- [ADOPTION.md](ADOPTION.md) — What spreading looks like
- [AI.md](AI.md) — AI inference vs declaration: what AI reads in a Rune-annotated system
- [CONTRACTS.md](CONTRACTS.md) — Cross-layer contract enforcement: the Rune schema as ground truth
- [ROADMAP.md](ROADMAP.md) — What's next: tooling, packages, site, ecosystem

## Examples

- [examples/mere.md](examples/mere.md) — Rune in Mere workbooks (origin)
- [examples/config.md](examples/config.md) — Rune in configuration files
- [examples/recall.md](examples/recall.md) — Rune in publishing documents
- [examples/clinical.md](examples/clinical.md) — Rune in healthcare documentation
- [examples/legal.md](examples/legal.md) — Rune in contract systems
- [examples/trading.md](examples/trading.md) — Rune in financial/trading systems

## Implementations

Reference implementations showing the protocol mapped to host language idioms.

### C#
- [implementations/csharp/RuneCore.cs](implementations/csharp/RuneCore.cs) — Domain model: `RuneType`, `RuneBinding`, `RuneParser`, all four stores
- [implementations/csharp/RuneHost.cs](implementations/csharp/RuneHost.cs) — Host wiring: `RuneHost`, attributes, reflection-based `RuneHostBuilder`
- [implementations/csharp/Example.cs](implementations/csharp/Example.cs) — Three patterns: attribute-based, fluent, template engine simulation

### SQL (PostgreSQL)
- [implementations/sql/rune_core.sql](implementations/sql/rune_core.sql) — Registry tables, helpers, `rune_intent_all` view
- [implementations/sql/example_task_workbook.sql](implementations/sql/example_task_workbook.sql) — Task list: views as `@`, columns as `~`, functions as `!`
- [implementations/sql/example_risk_dashboard.sql](implementations/sql/example_risk_dashboard.sql) — Risk dashboard: audit-logged `!`, compliance `?`, read-only `@` feeds

**The mapping is direct:**

| Rune | C# | SQL |
|------|-----|-----|
| `@` | `[RuneComputed]` property / `host.Read()` | `VIEW` or generated column |
| `~` | `[RuneState]` property / `host.Sync()` | Mutable `TABLE` column |
| `!` | `[RuneAction]` method / `host.Act()` | `FUNCTION` or `STORED PROCEDURE` |
| `?` | `[RuneIntent]` attribute / `host.RecordIntent()` | `COMMENT ON` + `rune_intent` table |

---

## Origin

Rune grew out of the sigil syntax in [Mere](https://mere.mp) — a workbook format for apps where the file is the app.

The four sigils were designed for Mere's bounded, AI-native authoring surface. They turned out to be a complete reactive grammar. This document formalises them as a standalone protocol.

**Mere invented it. Rune names it.**

---

*Part of the [Cormorant Foraging](https://cormorantforaging.dev) ecosystem.*
