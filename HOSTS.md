# Rune Host Implementation Guide

A **Rune host** is any format or runtime that embeds the Rune binding protocol. This guide covers what a host must implement, what it may extend, and how to declare Rune compliance.

---

## Minimum Viable Host

A host at Level 0 (intent-only) must:

1. Recognise `?` as a valid prefix on element attributes
2. Parse the annotation as a string literal
3. Store it alongside the element (do not discard)
4. Never execute it at runtime

That is the complete requirement for Level 0. A YAML parser that preserves `?"..."` comments as structured metadata is a valid Level 0 Rune host.

---

## Full Compliance Checklist

### Parser

- [ ] Recognises `@identifier` and `@identifier.field` as read bindings
- [ ] Recognises `~identifier` as sync bindings
- [ ] Recognises `!action-name` and `!action-name with args` as act bindings
- [ ] Recognises `?"..."` and `?identifier` as intent annotations
- [ ] Reports `RNE-001` for unrecognised sigil characters
- [ ] Reports `RNE-004` for conflicting runes on the same element (`@ + ~`)

### State Resolution

- [ ] Maintains a named state store (mutable values)
- [ ] Maintains a named computed store (derived, read-only values)
- [ ] Resolves `@identifier` against computed store, then state store
- [ ] Resolves `~identifier` against state store only
- [ ] Reports `RNE-002` for unresolved identifiers
- [ ] Reports `RNE-003` for `~` binding to a computed value

### Iteration

- [ ] When `@identifier` references a list on a collection element, iterates the list
- [ ] Within iteration scope, resolves `@item.field` to current item fields
- [ ] Out-of-bounds field access returns empty string (no error)

### Action Dispatch

- [ ] Maintains a named action registry
- [ ] Dispatches `!action-name` on primary element interaction
- [ ] Passes positional arguments to action handlers
- [ ] Reports `RNE-005` for wrong argument count
- [ ] Reports `RNE-002` for unregistered action names

### Intent Preservation

- [ ] Stores all `?` annotations in an addressable intent store
- [ ] Associates each annotation with its element identifier
- [ ] Exposes intent store to tooling (query interface)
- [ ] Never strips `?` annotations during build, compilation, or minification

### Error Reporting

- [ ] Reports all `RNE-*` error codes with line/position information
- [ ] Does not silently swallow binding errors

---

## Declaring Host Compliance

A Rune host declares its compliance level in its own documentation:

```
Rune compliance: Level 3 (full)
Rune compliance: Level 0 (intent-only)
Rune compliance: Level 1 (read bindings)
```

Hosts that extend Rune with additional sigils or operations must declare this explicitly and ensure extensions do not conflict with `@ ~ ! ?`.

---

## Known Hosts

| Host | Format | Level | Notes |
|------|--------|-------|-------|
| [Mere](https://mere.mp) | `.mp.html` workbooks | Level 3 | Origin host — reference implementation |
| [Recall](https://github.com/semanticintent/recall-compiler) | `.rc` publishing documents | Planned | Level 0 → Level 3 roadmap |

*To register your host, open a PR adding a row to this table.*
