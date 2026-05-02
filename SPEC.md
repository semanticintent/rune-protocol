# Rune Specification

**Version:** 0.1.0  
**Status:** Draft

---

## 1. Overview

Rune defines four **binding runes** — sigil-prefixed identifiers that annotate document elements with reactive semantics. Rune is format-agnostic: it defines the semantics of the four runes and the rules for their composition. Host formats define the element vocabulary and provide the runtime.

---

## 2. The Four Runes

### 2.1 Read Rune — `@`

**Syntax:** `@identifier` or `@identifier.field`

**Semantics:** One-way binding from a named state value to the element. The element displays the current value of the referenced state. Changes to state update the display. User interaction with the element does not affect state.

**Iteration:** When `@identifier` references a list and is placed on a collection element, the runtime iterates the list, rendering one instance of the element per item. Within the iteration scope, `@item.field` references the current item's fields.

**Out-of-bounds:** Accessing a field that does not exist returns empty string. No error is raised.

**Valid on:** Any displayable element.

**Invalid on:** Input elements (use `~` instead).

```
<heading @title/>                  — displays state value "title"
<badge @unread-count/>             — displays state value "unread-count"
<list @tasks>                      — iterates list state "tasks"
  <item @item.title/>              — displays "title" field of current item
</list>
```

---

### 2.2 Sync Rune — `~`

**Syntax:** `~identifier`

**Semantics:** Two-way binding between a named state value and an input element. The element reads the current state value as its initial display. User input updates state immediately. State changes from other sources update the element.

**Constraint:** May only bind to mutable state. Binding `~` to a computed (derived, read-only) value is an error.

**Valid on:** Input elements only (field, toggle, tab-bar, and host-defined equivalents).

**Invalid on:** Display elements (use `@` instead).

```
<field ~email/>                    — syncs text input with "email" state
<toggle ~notifications/>           — syncs boolean toggle with "notifications" state
<tab-bar ~active-tab/>             — syncs selected tab with "active-tab" state
```

---

### 2.3 Act Rune — `!`

**Syntax:** `!action-name` or `!action-name with arg1 arg2 ...`

**Semantics:** Binds an element to a named action. The action is invoked when the element receives its primary interaction (click for buttons, submit for forms, etc.). Arguments are positional and passed to the action in declaration order.

**Arguments:** Arguments may be:
- State references: `item.id`, `user.name`
- Literal strings: `"draft"`, `"confirm"`
- Bare identifiers resolved by the host runtime

**Explicitness invariant:** Nothing happens without a `!` binding. There are no implicit actions, lifecycle hooks, or side effects triggered by `@` or `~`.

**Valid on:** Interactive elements (button, card, form, nav-item, and host-defined equivalents).

```
<button !add-task>Add</button>                          — triggers "add-task" action
<button !send with item.id "urgent">Send</button>       — passes arguments
<card !open-detail with item.id>...</card>              — tappable container
```

---

### 2.4 Intent Rune — `?`

**Syntax:** `?"quoted description"` or `?unquoted-identifier`

**Semantics:** Annotates an element with a human-readable or AI-readable description of intent. The intent rune has **no runtime effect** — it is invisible to the runtime and does not affect rendering, state, or behavior.

**Purpose:** Intent runes are read by:
- AI compositors that expand placeholder elements into full markup
- Documentation tools that extract design intent from source
- Audit tools that verify intent against implementation
- Humans reading the source who need context

**Scope:** An intent rune on a container element describes the container and its children. An intent rune on a leaf element describes that element alone.

**Persistence:** Intent runes travel with the document. They are not stripped during build or compilation. They are part of the document's permanent record.

```
<screen ?"mobile inbox, unread messages first, swipe to archive">
<card ?"show sender, subject, and preview — tap opens full message">
~risk-threshold ?"set by risk committee Q1-2025, review at quarter end"
```

---

## 3. Composition Rules

### 3.1 Multiple Runes on One Element

An element may carry more than one rune. Each rune is independent:

```
<card !open-item with item.id ?"tap to see full detail">
  <heading @item.title/>
</card>
```

Valid combinations:

| Combination | Valid | Notes |
|-------------|-------|-------|
| `@ + ?` | ✅ | Display with intent annotation |
| `~ + ?` | ✅ | Input with intent annotation |
| `! + ?` | ✅ | Action with intent annotation |
| `@ + !` | ✅ | Display value and respond to tap |
| `~ + !` | ✅ | Input that also triggers action |
| `@ + ~` | ❌ | Ambiguous: read-only conflicts with two-way |
| `~ + ~` | ❌ | Only one sync binding per element |

### 3.2 Nesting

Runes do not inherit. A `@` on a parent does not make child elements read-bound. Exception: iteration scope — within a `@list` container, `@item.field` refers to the current iteration item.

### 3.3 Identifier Resolution

All rune identifiers are resolved in the following order:
1. Iteration scope (`item.field`) — if inside an iterating container
2. Screen/local scope — parameters passed to the current screen
3. Computed values — derived state
4. Mutable state — declared state values

If an identifier cannot be resolved, the host runtime determines error behavior (error or empty string). The `?` rune identifiers are never resolved — they are stored as literal strings.

---

## 4. The Completeness Invariant

Rune's four operations are **complete**: they cover all interaction patterns in a reactive document without overlap.

| Need | Rune | Rationale |
|------|------|-----------|
| Display a value | `@` | One-way, no side effects |
| Accept and persist user input | `~` | Two-way, explicit sync |
| Respond to user action | `!` | Imperative, explicit trigger |
| Record meaning | `?` | Metadata, no runtime effect |

There is no fifth pattern. A document that uses only these four runes can express any reactive interaction. This bounded completeness is what makes Rune embeddable — adopting hosts need not extend the grammar.

---

## 5. The Intent Rune as AI Primitive

The `?` rune is the most novel aspect of the Rune protocol. It formalises a pattern that has existed informally in comments and documentation but has never been a first-class binding primitive.

**Why `?` is not a comment:**

| Property | Comment | `?` Intent Rune |
|----------|---------|-----------------|
| Structured | No | Yes — attached to a specific element |
| Addressable | No | Yes — tooling can query by element |
| Travels with document | Sometimes | Always |
| Machine-readable | Incidentally | By design |
| Survives build/minification | No | Yes (by spec) |
| Has a schema | No | Host may define one |

**The AI contract:** When an AI compositor, summariser, or generator reads a Rune document, `?` annotations are the document's contract with the AI. They express what the author intended, not what the markup does. This separation — **intent vs. implementation** — is the primitive that makes AI-assisted authoring reliable.

---

## 6. Host Requirements

A Rune host is any format or runtime that adopts the Rune protocol. Hosts must:

1. **Parse** the four runes (`@`, `~`, `!`, `?`) from element attributes
2. **Resolve** `@` and `~` bindings to a named state store
3. **Dispatch** `!` bindings to a named action registry
4. **Preserve** `?` annotations — never strip, never execute
5. **Enforce** the composition rules (§3)
6. **Report** binding errors with stable codes

Hosts may:
- Define their own element vocabulary
- Extend `?` with a structured schema
- Provide additional syntax beyond the four runes (at their own risk)
- Implement the Rune reference runtime or write their own

See [HOSTS.md](HOSTS.md) for the complete host implementation guide.

---

## 7. Error Codes

| Code | Condition |
|------|-----------|
| `RNE-001` | Unknown rune (character not in `@ ~ ! ?`) |
| `RNE-002` | Unresolved identifier (state/action not declared) |
| `RNE-003` | Sync binding to computed/read-only value |
| `RNE-004` | Conflicting runes on same element (`@ + ~`) |
| `RNE-005` | Act binding with wrong argument count |
| `RNE-006` | Read binding on input element (use `~`) |
| `RNE-007` | Sync binding on display element (use `@`) |

---

## 8. Versioning

Rune versions follow semantic versioning. The four runes and their core semantics are **stable** — they will not change in any version. Extensions (host-specific schemas, additional composition rules) are versioned by the host.

The `?` rune's runtime semantics (currently: no effect) may be extended in future versions to support structured schemas, but the invariant that `?` has no effect on rendering or state is permanent.
