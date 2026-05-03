# The Universal Contract

## The Schema Is Not About Variables

The first instinct when reading Rune Protocol is to think about variable bindings —
a field named `risk-threshold`, a button named `submit-order`, an input named `new-task`.
That instinct is correct as a starting point. It is too small as a destination.

The Rune schema is not a variable registry. It is a **contract declaration system**.
The named thing can be a variable, a function, a file, a module, a service, or a product.
The contract — mutable or derived, explicit or annotated — holds at every level.

---

## Any Named Thing Can Hold a Contract

| Level | Example | Rune | Contract |
|---|---|---|---|
| Variable | `risk-threshold` | `~` | mutable, analyst-editable, rationale attached |
| Function | `submit-order` | `!` | explicit, auditable, one sanctioned entry point |
| File | `patient-record.mp` | `@` | read-only artifact, feed-driven, not manually authored |
| Module | `risk-engine` | `~` | configurable, editable thresholds, enumerable surface |
| Service | `order-management` | `!` | all mutations explicit, no implicit side effects |
| Product | `trading-platform` | `?` | "all actions logged to compliance trail — REC-2024-007" |

The granularity changes. The four questions do not:

- Is this readable or mutable?
- Is this derived or declared?
- Is this a trigger or a state?
- What is the intent behind it?

Those questions apply to a field. They apply equally to a system.

---

## The Schema as Source of Truth

When the schema is centralised, something fundamental shifts.

Without a schema, each implementation declares its own contracts — independently,
incompatibly, and often inconsistently. The C# class says one thing. The React form
says another. The SQL schema says a third. The contracts are implicit, distributed,
and drift the moment the teams stop talking.

With a centralised schema, the contract is declared once. Every implementation
is a **projection** of it:

```json
{
  "bindings": {
    "risk-threshold": { "rune": "~", "type": "number",
                        "intent": "approved by risk committee Q1-2025" },
    "submit-order":   { "rune": "!", "args": ["orderId:string"],
                        "intent": "explicit, logged to OMS, irrevocable" },
    "market-price":   { "rune": "@", "type": "number",
                        "intent": "live feed — not manually entered" }
  }
}
```

C# reflects the schema as attributes. React reflects it as hooks. SQL reflects it
as views and functions. The contract is singular. The expressions are plural.

This is schema-first development — but not in the narrow sense of database schema
or JSON schema. **Rune schema is a governance schema.** It declares not just the
shape of data but the behavioral contract around every named thing in the system.

---

## The DOI Parallel

Academic knowledge systems solved this problem 500 years ago.

A DOI is a canonical identifier that makes a piece of knowledge addressable across
every platform that references it — the journal, the library, the reader's notes,
the AI that reads it in 2040. The citation is the `?` annotation that travels with
every claim. The reference list is `host.intent.all`. The contract between author
and reader — "this claim traces back to this source" — survives the platform,
the institution, and the people who built them.

The Rune schema is the same architecture applied to software systems:

| Academic | Rune Schema |
|---|---|
| DOI | canonical binding name |
| Citation | `?` annotation |
| Reference list | `schema.bindings` |
| Peer review | `!` — explicit, auditable action |
| Published (immutable) | `@` — read-only, derived |
| Under review (mutable) | `~` — editable, governed |
| Retraction | `RNE002` — contract violation |

Academia spent centuries building DOI, ORCID, Zenodo — infrastructure to ensure
that intent survives the person who held it. Rune Protocol is that same instinct
applied to the software systems that increasingly govern everything else.

---

## Compliance as a Contract Property

In compliance-heavy domains — finance, healthcare, legal, infrastructure — the
governance question is not "what does this value do?" It is "what is this system
*allowed* to do, by whom, under what rationale?"

A Rune schema at the product level answers that structurally:

```json
{
  "bindings": {
    "trading-platform": {
      "rune": "?",
      "intent": "institutional system — all actions logged to compliance trail REC-2024-007"
    },
    "order-submission": {
      "rune": "!",
      "intent": "explicit only — no implicit orders, no batch without sign-off"
    },
    "market-data": {
      "rune": "@",
      "intent": "read-only feed — never manually entered or overridden"
    },
    "risk-parameters": {
      "rune": "~",
      "intent": "editable by risk desk only — changes require committee approval"
    }
  }
}
```

This is not documentation. It is a machine-readable governance claim about the
product — queryable by auditors, readable by AI, validated by the linter, enforced
by the host. The compliance trail is not a separate system bolted on after the fact.
It is structural from the first binding declaration.

---

## The Generation Direction

The most powerful implication of a centralised schema is the direction it enables:
**schema-first generation**.

Instead of writing implementations and inferring contracts, you declare the contract
and generate the implementations. The schema becomes the source from which:

- C# attributes are generated (or validated)
- React hooks are typed and validated
- SQL views, columns, and functions are scaffolded
- API documentation is derived
- Compliance reports are produced
- AI briefings are generated

Every layer becomes a projection of one declared truth. The contract is not inferred
from the code. The code is derived from the contract.

This is what the Rune schema enables at v1.1 — and what it points toward as the
protocol matures. The `extract` tool (v1.2 roadmap) works in the other direction:
reading an existing codebase and surfacing the contracts that are already implicit
in it, making them explicit for the first time.

---

## Any Language. Any Codebase. Any Scale.

The universality of the contract follows from the universality of the four questions.
Every system — regardless of language, framework, domain, or scale — has values that
are readable or mutable, derived or declared, explicit or annotated. Those properties
exist whether or not they are named. Rune names them.

A variable-level contract and a product-level contract are the same structure at
different resolutions. The schema holds both. The linter validates both. The AI reads
both. The auditor queries both.

**The contract is not a feature of the binding. It is a property of any named thing
that has governed behavior.**

That is what makes Rune Protocol universal — not the four sigils, but the insight
that governance has the same shape at every scale.
