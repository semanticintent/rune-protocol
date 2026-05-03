# Changelog

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
