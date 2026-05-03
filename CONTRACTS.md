# Rune Contracts

## The Problem

Most cross-layer bugs are not logic errors. They are contract drift.

One layer assumes something about a value that another layer no longer
guarantees. The assumption is never written down. It lives in the developer
who wrote the code, the PR description nobody re-reads, or the wiki page
that was accurate in Q3 and wrong by Q4.

Classic forms:

- SQL allows `NULL`. C# assumes non-null. Runtime crash.
- React treats a value as editable. C# treats it as computed. Silent data corruption.
- Config sets a threshold to `0.10`. Business logic enforces `0.15`. Silent override, wrong behaviour.
- Frontend validates a field. Backend skips validation assuming frontend did it. Bypass.

These bugs share a root cause: **the contract between layers was implicit**.
It was held in someone's head, not in the system.

---

## What a Rune Contract Is

When a binding is declared with Rune across multiple layers, it carries a
contract — not by convention, but structurally.

`~risk-threshold` declared in SQL, C#, and React simultaneously is not just
consistent naming. It is a binding-level contract that every layer is held to:

- The value is **mutable** (`~`) — everywhere, not just where one developer
  happened to use a setter
- The **rationale** is co-located — `?"approved by risk committee Q1-2025"`
  travels with the binding, not with the developer who knew it
- The **mutation path** is `!` — no layer can change the value through the
  back door without violating the protocol

The contract is not a document. It is a property of the binding itself.

---

## Where Contract Enforcement Earns Its Cost

Not every binding warrants cross-layer contract enforcement. The case where
it earns its cost is when three conditions hold simultaneously:

1. **The value crosses a trust boundary** — user input → business logic → persistence
2. **The consequence of a wrong assumption is high** — financial threshold,
   clinical dosage, access permission, compliance parameter
3. **Multiple teams own different layers** — frontend, backend, and DBA
   all touching the same named concept independently

In that scenario, a Rune contract is the mechanism by which three teams,
working independently, are held to the same guarantee — without a meeting,
a wiki page, or an assumption that everyone read the same PR.

---

## The Rune Schema — Contract as Artifact

Cross-layer contract enforcement requires a single source of truth.
That artifact is a **Rune schema** — a canonical binding manifest that
every host validates against.

```json
{
  "version": "1.0",
  "bindings": {
    "risk-threshold": {
      "rune":   "~",
      "type":   "number",
      "min":    0.05,
      "max":    0.30,
      "intent": "approved by risk committee Q1-2025 — review at quarter end"
    },
    "market-price": {
      "rune":   "@",
      "type":   "number",
      "intent": "live NBBO feed — not manually entered"
    },
    "submit-order": {
      "rune": "!",
      "args": [{ "name": "orderId", "type": "string" }],
      "intent": "explicit, logged to OMS, irrevocable"
    }
  }
}
```

The schema does three things:

**1. Canonical names** — `risk-threshold` in kebab-case is the canonical form.
Hosts translate to their own conventions: SQL uses `risk_threshold`,
C# uses `RiskThreshold`, React uses `'risk-threshold'`. The schema is the
arbiter when they disagree.

**2. Wrong rune type** — if React calls `useRead('submit-order')` when the
schema declares it `!`, that is a lint error caught at build time, not a
runtime failure.

**3. Missing declaration** — if a binding is used in React but never appears
in the schema, the linter catches it before deployment:
`[RNE002] 'risk_threshold' not declared — did you mean 'risk-threshold'?`

---

## Without Schema: Convention. With Schema: Contract.

| | Without Rune Schema | With Rune Schema |
|---|---|---|
| **Naming** | Each layer decides independently | Canonical, validated at build time |
| **Type mismatch** | Runtime error | Build-time lint error |
| **Wrong rune type** | Silent misuse | `[RNE003]` before deployment |
| **Misspelling** | Silent — binds to nothing | `[RNE002]` with suggestion |
| **Rationale** | In comments, PRs, wikis | In the schema, co-located, versioned |
| **New developer** | Reads all layers to understand | Reads the schema |
| **AI** | Infers from each layer separately | Reads one declaration, understands all layers |

---

## The Bug-Fix Case

The most concrete value: when fixing a cross-layer bug, the Rune schema
tells you exactly what the contract was supposed to be.

Without a schema, debugging a cross-layer assumption requires:
- Tracing the value through every layer
- Reconstructing what each layer assumed
- Finding where the assumptions diverged
- Deciding which layer was right

With a schema, the contract is already written. The bug is the delta
between what the schema declares and what one layer implemented.
The fix is bringing that layer back into contract — not negotiating
what the contract should have been.

**The schema is the ground truth. Every layer is an implementation of it.**

---

## Contract Enforcement Across Layers

When the schema exists, each layer enforces the contract in its own idiom:

**C#**
```csharp
// Schema: risk-threshold is ~, type number, range 0.05–0.30
// Violation at build time if:
// - declared [RuneComputed] instead of [RuneState] (wrong rune type)
// - type is not decimal/double/float (type mismatch)
[RuneState]
[RuneIntent("approved by risk committee Q1-2025 — review at quarter end")]
public decimal RiskThreshold { get; set; } = 0.15m;
```

**React / TypeScript**
```tsx
// Schema: risk-threshold is ~, type number
// Violation at build time if:
// - useRead('risk-threshold') used instead of useSync (wrong rune type)
// - value assigned as string (type mismatch)
const [riskThreshold, setRiskThreshold] = useSync<number>('risk-threshold');
```

**SQL**
```sql
-- Schema: risk-threshold is ~, type number, range 0.05–0.30
-- Violation if:
-- declared as VIEW column (@ not ~)
-- type is VARCHAR (type mismatch)
-- no COMMENT ON carrying the intent
risk_threshold NUMERIC(5,4) NOT NULL DEFAULT 0.15
    CHECK (risk_threshold BETWEEN 0.05 AND 0.30)
```

Each layer speaks its own idiom. The contract is the same.

---

## Summary

Rune contracts are not a tracking feature. They are an enforcement mechanism.

The cross-domain consistency is not the goal — it is the evidence that the
contract is being kept. When `risk-threshold` is `~` in SQL, C#, and React,
with the same rationale and the same type, that consistency is proof that
all three layers are bound to the same guarantee.

The schema is what makes that guarantee explicit, versioned, and enforceable
before bugs reach production.

**Implicit contract: held in people. Rune contract: held in the protocol.**
