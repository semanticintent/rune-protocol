# Rune Adoption

How Rune spreads. What adopting Rune means. What it costs.

---

## The Zero-Cost Entry Point

The `?` rune is free to adopt.

Any document format can add `?` intent annotations without changing its parser, its runtime, or its element vocabulary. `?` has no runtime effect — it is metadata. An existing format can support `?` with a single decision: *preserve these annotations, don't strip them*.

This is how Rune spreads:

1. A format adopts `?` — zero implementation cost, immediate value
2. AI tooling that understands Rune `?` starts working on that format's documents
3. The format sees value in `@` — adds read bindings
4. `~` and `!` follow when the format is ready for full reactivity

The `?` rune is the wedge. It asks for nothing and gives back AI-readable intent.

---

## Adoption Levels

### Level 0: Intent-Only

Adopt `?` alone. Preserve intent annotations. Do not execute them.

**Cost:** Near zero. Parser change only.  
**Value:** Documents carry AI-readable intent. Tooling can extract design rationale. `?` annotations survive build and compilation.

```
# Any config file, any document, any format
field: value  ?"why this value was chosen, for humans and AI"
```

---

### Level 1: Read Bindings

Adopt `@` for one-way state display. Documents can reference named values from a state store.

**Cost:** Low. Requires a state store and a resolver.  
**Value:** Documents become data-bound. Templates eliminate copy-paste. Live values flow into display.

---

### Level 2: Sync Bindings

Adopt `~` for two-way input sync. Input elements write back to state.

**Cost:** Medium. Requires input handling and state mutation.  
**Value:** Documents become interactive. User input persists. Forms are stateful.

---

### Level 3: Action Bindings

Adopt `!` for explicit action invocation. User interaction dispatches to named handlers.

**Cost:** Medium. Requires an action registry and dispatch mechanism.  
**Value:** Documents become fully reactive. Complete Rune compliance.

---

## What Hosts Must Provide

A fully compliant Rune host provides:

| Component | Purpose |
|-----------|---------|
| **State store** | Named mutable values (`~` and `@` resolve here) |
| **Computed store** | Named derived values (read-only, `@` resolves here) |
| **Action registry** | Named handlers (`!` dispatches here) |
| **Intent store** | Preserves `?` annotations (queryable by tooling) |
| **Rune parser** | Recognises `@ ~ ! ?` in element attributes |
| **Binding resolver** | Maps identifiers to state/computed/action |
| **Error reporter** | Reports `RNE-*` error codes |

Hosts may implement these independently or embed the Rune reference runtime (see [RUNTIME.md](RUNTIME.md)).

---

## The Reference Runtime

The Rune reference runtime is a minimal, zero-dependency implementation of the Rune protocol. It is designed to be embedded, not used standalone.

```
rune-runtime.js   — ~4KB minified, zero dependencies
rune-runtime.ts   — TypeScript source
```

Hosts embed the runtime and provide:
- The state store (their own state management)
- The element vocabulary (their own element definitions)
- The action registry (their own behavior handlers)

The runtime handles:
- Sigil parsing
- Identifier resolution
- `@` binding updates when state changes
- `~` binding sync between input and state
- `!` dispatch to action registry
- `?` preservation in an addressable intent store

---

## Tooling

Rune's value multiplies with tooling. The same four runes, across all host formats, enable a shared tooling ecosystem:

### LSP (Language Server Protocol)

A Rune LSP provides — for any Rune host format:
- Autocomplete for state identifiers after `@` and `~`
- Autocomplete for action names after `!`
- Hover documentation for `?` annotations
- Error highlighting for `RNE-*` violations
- Go-to-definition for state declarations

One LSP. Every editor. Every host format.

### Rune Lint

A standalone validator that checks Rune compliance:

```bash
rune check document.mp.html
rune check config.yaml
rune check contract-template.rc
```

Reports `RNE-*` errors with line numbers.

### Rune Extract

Extracts all `?` intent annotations from a document or corpus:

```bash
rune extract --intent document.mp.html
```

Returns a structured list of intent annotations with their element context. Used by AI tools, documentation generators, and compliance auditors.

### AI Integration

Any AI tool that understands Rune can:
- Generate compliant documents from natural language
- Interpret `?` annotations as structured intent (not free-form comments)
- Validate generated documents against the spec
- Suggest `?` annotations based on element semantics

---

## The Spreading Path

Rune does not need a central authority to spread. It needs:

1. **A stable spec** — this document. Version-locked. The four runes do not change.
2. **A reference runtime** — embeddable, zero-dependency. Any format can host it.
3. **Early hosts** — Mere (UI), Recall (publishing), and one domain-specific host (trading, clinical, or legal) establish the pattern across contexts.
4. **The LSP** — once developers can get autocomplete for Rune across formats, adoption is self-reinforcing.
5. **The `?` standard** — if AI tooling converges on `?` as the intent annotation primitive, every format that wants AI integration has a reason to adopt Rune.

The `?` rune is the flywheel. It costs nothing to adopt and it creates demand for AI tools that understand it. Those tools create demand for `@`, `~`, and `!`. The protocol spreads because each rune is useful independently and all four together are complete.

---

## What Spreading Does Not Mean

Rune is not a framework. There is no "Rune runtime" that formats must depend on. There is no Rune organisation, no certification, no compliance fee.

Rune is a grammar. Formats that adopt it become interoperable at the binding layer. Tooling that understands it works across all of them. The value is in the shared semantics, not in a shared implementation.

Like Markdown, like JSON, like HTTP — the spec is the product.
