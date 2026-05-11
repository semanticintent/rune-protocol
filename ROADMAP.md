# Roadmap

## v1.0 — Specification ✓ (May 2026)

The protocol is defined and demonstrable.

- Four runes: `@` `~` `!` `?` — spec, philosophy, bounded completeness
- Reference implementations: C#, TypeScript / React, SQL (PostgreSQL)
- Domain examples: Mere, config, trading, Recall, clinical, legal
- Governance documentation: `AI.md`, `CONTRACTS.md`
- MIT license, public repository at `github.com/semanticintent/rune-protocol`

---

## v1.1 — Schema ✓ (May 2026)

**The Rune schema artifact.**

The canonical binding manifest — `rune.schema.json` — that every host
validates against. Elevates contracts from aspirational to enforceable.
Without the schema, Rune is a convention. With it, Rune is a contract.

- `rune.schema.json` — JSON Schema (draft-07), hosted at `rune.semanticintent.dev/rune.schema.json`
- Named binding declarations with canonical kebab-case keys — hosts translate to their own conventions
- Per-binding: type, constraints (min/max/enum/maxLength), intent annotation, arg declarations for `!`
- `examples/task-workbook.rune.json` — reference manifest showing all four runes in a Mere workbook
- Schema validation in all three reference implementations: error codes RNE002/RNE003/RNE005 enforced at build time

---

## v1.2 — Tooling ✓ (May 2026)

**Making Rune ambient.**

- **CLI validator** ✓ — `@semanticintent/rune-cli` in `cli/`
  `rune validate <manifest>` — validates `.rune.json` against `rune.schema.json`.
  Reports RNE003 (wrong rune type), RNE005 (constraint violation), RNE006 (missing intent/type),
  RNE007 (structural schema violation). Text + JSON output. Exit code 1 on errors.
- **Extract tool** ✓ — `rune extract <source>`
  Scans source files for Rune binding patterns and generates a `.rune.json` manifest.
  Supports HTML/Mere, TypeScript/React, C#, and SQL (COMMENT ON annotation convention).
  Auto-detects host format from file extension. Round-trip: extract → validate → enrich.
- **LSP** ✓ — `@semanticintent/rune-lsp` in `lsp/`
  Completion (binding names, context-aware per rune type), hover (rune type +
  type + constraints + intent annotation), diagnostics (RNE002 unknown binding,
  RNE003 wrong rune type). Supports VS Code, Neovim, any LSP-capable editor.
  Manifest auto-discovered (`rune.json` or `*.rune.json`) and hot-reloaded.

---

## v1.3 — Packages

**One-line adoption.**

- `@semanticintent/rune-protocol` on npm
  TypeScript host + React hooks, schema-validated
- `SemanticIntent.RuneProtocol` on NuGet
  C# host, attributes, `RuneHostBuilder`, schema-validated
- Both packages validate against `rune.schema.json` at build time

---

## v1.4 — Implementations

**Proving host-agnostic.**

Community and first-party implementations that prove the protocol
is genuinely independent of any host language or framework.

- Vue — composables (`useRuneRead`, `useRuneSync`, `useRuneAct`)
- Angular — decorators (`@RuneState()`, `@RuneAction()`)
- Python — dataclass-based host with `@rune_state`, `@rune_action`
- Go — struct tags (`rune:"~"`) with reflection-based host builder

Each implementation validates against the same `rune.schema.json`.
The contract is language-agnostic by design.

---

## v2.0 — Site + DOI

**Discoverable and citable.**

- **Docs site** at `rune.semanticintent.dev`
  Full protocol documentation, interactive examples, implementation guides,
  schema reference. VitePress, consistent with the Semantic Intent ecosystem.
- **Zenodo DOI**
  Academic citation alongside Ember (`10.5281/zenodo.19751387`) and
  Strata (`10.5281/zenodo.19768151`). Formalises the protocol as a
  peer-citable artifact.
- **GitHub Discussions**
  Spec questions, implementation reports, domain examples from the community.

---

## v2.x — Ecosystem Integrations

**Rune as the syntax layer across the methodology stack.**

- **EMBER** — formal documentation of Rune as the syntax layer beneath
  EMBER's semantic constructs. EMBER defines meaning; Rune governs binding behaviour.
- **Mere** — formalised as the reference Rune host at `mere.mp`.
  The origin of the protocol, now pointing to the spec it produced.
- **Recall** — `?` annotations in PROCEDURE DIVISION operations,
  Rune as the governance layer over published documents.
- **Phoenix / Strata** — `?` in SIL constructs carries the rationale
  that archaeological methodology requires. Rune as the shared annotation
  substrate across the full Semantic Intent ecosystem.

Each integration demonstrates one surface where the schema is the right
artifact. The goal across v2.x is for `rune.schema.json` to become the
natural first read for anyone trying to understand a system — not its
documentation, not its code, but its declared binding contract.

---

## Adoption Shape

Each milestone widens the adoption path without changing the protocol.
The spec stays stable. The ecosystem grows around it.

| Milestone | What it unlocks |
|---|---|
| v1.0 | Anyone can implement the protocol |
| v1.1 | Cross-layer contracts are enforceable |
| v1.2 | Rune is ambient in any editor |
| v1.3 | Adoption is one install command |
| v2.0 | Rune is discoverable and citable |
| v2.x | The Semantic Intent ecosystem shares one governance layer |
| host | The pattern becomes visible — the argument becomes concrete |

---

## The Indispensable Host

The spec is solid. The schema is real. The tooling works. What the adoption
argument still needs is a host where `rune.schema.json` is the *obviously
right place to look* to understand how a system behaves — not a demonstration,
not an example, but a production codebase where the manifest is load-bearing.

**What makes a host indispensable:**

A host becomes indispensable when removing the schema would leave something
genuinely missing — not just undocumented, but ungoverned. The contract
between layers would be invisible again. The `?` intent annotations would
exist only in people's heads. A new developer, or an AI generating code for
that system, would have to read three codebases and hope they agree instead
of reading one manifest.

The host that makes this visible is likely one where:

- **Multiple layers are genuinely in tension** — a SQL schema, a backend service,
  and a frontend that all touch the same named values. The contract between them
  is currently implicit.
- **AI is already generating code for it** — and the drift between what the AI
  produces and what the other layers expect is a real, recurring cost.
- **The intent annotations carry real governance weight** — a `risk-threshold`
  that actually has a committee approval attached, a `submit-order` that is
  actually irrevocable.

**The AI drift angle:**

As AI writes more code across more layers simultaneously, cross-layer drift
becomes *more* likely, not less. An AI generating a React component doesn't
automatically know what the SQL schema guarantees about a value it's binding
to. A `rune.schema.json` in the repository is exactly the artifact you hand
that AI — one read, every layer's contract declared, no inference required.

The schema was designed for human cross-layer enforcement. It turns out to be
equally well-suited for AI-assisted authorship, because it gives the AI the
same thing it gives a human new to the codebase: a single declaration of what
every value is, what rune governs it, what constraints apply, and why.

**The EMBER convergence:**

The next-level version of this is when Rune and EMBER are present in the
same artifact. EMBER describes what a construct *means*. Rune describes how
a value *behaves*. When both are declared — an AI reading the artifact knows
intent AND binding semantics in one pass. That is a different authoring
surface than anything that currently exists, and it derives naturally from
the ecosystem that is already being built.
