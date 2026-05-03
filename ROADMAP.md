# Roadmap

## v1.0 — Specification ✓ (May 2026)

The protocol is defined and demonstrable.

- Four runes: `@` `~` `!` `?` — spec, philosophy, bounded completeness
- Reference implementations: C#, TypeScript / React, SQL (PostgreSQL)
- Domain examples: Mere, config, trading, Recall, clinical, legal
- Governance documentation: `AI.md`, `CONTRACTS.md`
- MIT license, public repository at `github.com/semanticintent/rune-protocol`

---

## v1.1 — Schema

**The Rune schema artifact.**

The canonical binding manifest — `rune.schema.json` — that every host
validates against. Elevates contracts from aspirational to enforceable.
Without the schema, Rune is a convention. With it, Rune is a contract.

- `rune.schema.json` format specification
- Canonical kebab-case naming with per-host translation rules
- Type declarations per binding
- Schema validation in all three reference implementations
- Error codes extended: schema violations at build time, not runtime

---

## v1.2 — Tooling

**Making Rune ambient.**

- **CLI validator** — `rune validate --schema rune.schema.json`
  Checks a codebase for RNE002 (unknown binding), RNE003 (sync to computed),
  type mismatches, misspellings with suggestions
- **Extract tool** — `rune extract`
  Reads an existing Rune-annotated codebase and generates `rune.schema.json`
  from it. Zero-friction onboarding for existing codebases.
- **LSP** — Language server protocol support
  Autocomplete binding names, inline `?` intent display, live schema
  validation in any editor

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
