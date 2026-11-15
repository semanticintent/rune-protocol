# Changelog

## rune-cli 1.2.2 · rune-lsp 1.2.1 — 2026-11-15

- Declare the MIT licence, the repository and the homepage in both packages, and ship the LICENSE file
  (npm showed "License: none").

## rune-cli 1.2.1 — 2026-11-15

- `rune extract` on a path that doesn't exist prints one line and exits 1, instead of a stack trace.
- `rune --version` reads the package version instead of a hard-coded one.
- Declares `engines: node >=20.19`: the CLI loads an ESM-only dependency (chalk 5) from CommonJS,
  which needs Node 20.19+ or 22.12+.
- Real tests (`npm test` builds, then runs end-to-end checks against the repository's examples).

## v1.2.0 — 2026-11-15

DOI: `10.5281/zenodo.24247119` (version) · concept `10.5281/zenodo.20007882`

- 1.1: `rune.schema.json`, the canonical binding manifest.
- 1.2: `rune validate` (`@semanticintent/rune-cli`), `rune extract` (four-host scanner), `rune-lsp`
  (completion, hover, diagnostics).
- UNIVERSAL.md; PHILOSOPHY.md opens with "Contracts in the Form of Signals"; tooling section on the docs site.

---

## v1.0.2 — 2026-05-03

DOI minted: `10.5281/zenodo.20007883`  
Docs site live at [rune.semanticintent.dev](https://rune.semanticintent.dev)

---

## v1.0.0 — 2026-05-02

Initial release of Rune Protocol.

### Specification
- Four runes: `@` (read), `~` (sync), `!` (act), `?` (intent)
- Composition rules and validation
- Error codes RNE001–RNE007
- Host compliance requirements (Level 0–3)
- Bounded completeness invariant

### Reference Implementations
- **C#** — `RuneCore.cs`, `RuneHost.cs`, reflection-based `RuneHostBuilder`
- **TypeScript / React** — framework-agnostic `RuneHost`, four hooks (`useRead`, `useSync`, `useAct`, `useIntent`), `RuneProvider`
- **SQL (PostgreSQL)** — registry tables, `rune_intent_all` view, task workbook and risk dashboard examples

### Examples
- Mere workbooks
- Configuration files (YAML, .env)
- Financial / trading systems
- Publishing documents (Recall)
- Healthcare / clinical systems
- Legal / contract systems

### Documentation
- `SPEC.md` — formal definition
- `PHILOSOPHY.md` — bounded completeness, the completeness argument
- `INDUSTRY.md` — domain applications
- `ADOPTION.md` — zero-cost `?` entry point, four adoption levels
- `HOSTS.md` — host implementation guide
- `AI.md` — inference vs declaration: what AI reads in a Rune-annotated system
- `CONTRACTS.md` — cross-layer contract enforcement, the Rune schema
- `ROADMAP.md` — v1.1 through v2.x milestones
