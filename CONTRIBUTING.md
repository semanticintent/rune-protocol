# Contributing to Rune Protocol

Rune Protocol is a spec-first project. The specification is the product.
Contributions fall into four categories — mirroring the four runes.

---

## Spec changes (SPEC.md)

The spec defines the four runes, composition rules, error codes, and host
requirements. Changes here require the strongest justification.

Before proposing a spec change:
- State what problem the current spec does not solve
- Show that the change cannot be expressed with the existing four runes
- Confirm it does not violate bounded completeness (no fifth rune)

Open an issue with the `spec` label before submitting a PR.

---

## New implementations (implementations/)

Reference implementations show how the protocol maps to a host language's
idioms. Each implementation should include:

- A core file: the four stores and the host (equivalent to `RuneCore`)
- A host file: framework-specific wiring (equivalent to `RuneHost`)
- An example file: at least one complete usage pattern

Implementations must not add rune types beyond `@ ~ ! ?`.
The host may add convenience — it may not extend the protocol.

Structure: `implementations/<language>/`

---

## New examples (examples/)

Examples show Rune syntax in its pure form — before any host translates it.
They should be domain-specific, show all four runes where natural, and
include `?` annotations that carry real rationale (not placeholder text).

Structure: `examples/<domain>.md`

---

## Bug reports and clarifications

If the spec is ambiguous, contradictory, or produces an error code that
doesn't match the described behaviour — open an issue with the `spec-bug`
label. Include the specific section, the ambiguity, and the expected behaviour.

---

## What this project does not accept

- A fifth rune
- Runtime dependencies in the core spec
- Framework-specific behaviour in SPEC.md
- Implementations that bypass the `!` invariant

---

*Part of the [Cormorant Foraging](https://cormorantforaging.dev) ecosystem.*
