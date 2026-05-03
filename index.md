---
layout: home

hero:
  name: "Rune Protocol"
  text: "Four Sigils. Complete Grammar."
  tagline: "A reactive binding protocol — @ read · ~ sync · ! act · ? intent — that governs how values behave across any host, framework, or domain."
  actions:
    - theme: brand
      text: View Specification
      link: /SPEC
    - theme: alt
      text: Explore Examples
      link: /examples/mere
    - theme: alt
      text: GitHub
      link: https://github.com/semanticintent/rune-protocol

features:
  - icon: 🔤
    title: Bounded Complete
    details: "Exactly four runes — no more, no fewer. @ read, ~ sync, ! act, ? intent. Every reactive document operation maps to one of them. The completeness is provable: no fifth rune is possible without redundancy."

  - icon: 🏛️
    title: Governance Layer
    details: "Each rune is a governance primitive. @ establishes a read boundary. ~ makes the mutation surface explicit and enumerable. ! guarantees nothing consequential happens without explicit invocation. ? keeps rationale co-located with the binding it governs."

  - icon: 🤖
    title: AI-Native by Design
    details: "Without Rune, AI infers intent from code — probabilistically, approximately. With Rune, AI reads declared intent directly. [RuneState], [RuneIntent], useSync, useAct — the system describes itself. No archaeology required."

  - icon: 📜
    title: Cross-Layer Contracts
    details: "A binding named risk-threshold declared in SQL, C#, and React carries the same contract at every layer — mutable, named, with its rationale attached. The Rune schema is the single source of truth every host validates against."

  - icon: ⚡
    title: Zero-Cost Entry
    details: "Start with ? only — add intent annotations to any existing format with no runtime cost and no behavioral change. Every adoption level above that is opt-in. The protocol meets you where you are."

  - icon: 🌐
    title: Host-Agnostic
    details: "Rune defines semantics. Hosts provide element vocabulary and runtime. Reference implementations in C#, TypeScript/React, and SQL. The same four runes map cleanly to every language and framework."
---

## The Four Runes

```
@  read    — display a value from state         (state → display, one-way)
~  sync    — two-way binding between input and state
!  act     — explicit trigger, user → behavior
?  intent  — annotation, no runtime effect, read by humans and AI
```

No framework. No runtime dependency. Four characters, complete grammar.

## In Practice

::: code-group

```html [Mere workbook]
<field ~new-task placeholder="New task…" />
<button !add-task>Add</button>
<list @tasks><item @item.title /></list>
<screen ?"mobile task list, minimal, focus on speed">
```

```csharp [C#]
[RuneState]
[RuneIntent("approved by risk committee Q1-2025")]
public decimal RiskThreshold { get; set; } = 0.15m;

[RuneComputed]
public IEnumerable<TaskItem> Pending => Tasks.Where(t => !t.Done);

[RuneAction("submit-order")]
[RuneIntent("explicit, logged to OMS, irrevocable")]
public async Task SubmitOrder(Guid orderId) { ... }
```

```tsx [React / TypeScript]
const pending                    = useRead<TaskItem[]>('pending')   // @
const [newTask, setNewTask]      = useSync<string>('new-task')      // ~
const addTask                    = useAct('add-task')                // !
useIntent('screen', 'mobile task list, focus on speed')             // ?
```

```sql [SQL]
-- @ read-only view
CREATE VIEW pending AS SELECT * FROM tasks WHERE done = false;

-- ~ mutable column
risk_threshold NUMERIC(5,4) DEFAULT 0.15  -- ?"approved by risk committee Q1-2025"

-- ! explicit action
CREATE FUNCTION act_submit_order(p_order_id UUID) RETURNS TEXT ...
```

:::

## Part of the Semantic Intent Ecosystem

Rune is the syntax layer beneath the semantic layer. Every project in the ecosystem has its own domain vocabulary — [EMBER](https://github.com/semanticintent/ember), [Mere](https://mere.mp), [Recall](https://semanticintent.dev), [Phoenix](https://github.com/semanticintent/phoenix-runtime), [Strata](https://github.com/semanticintent/strata-runtime), [Wake](https://wake.semanticintent.dev). Each answers *what does this mean*. Rune answers *how does this value behave*. Those are different questions at different levels — and Rune answers the second one, once, for all of them.

**Mere invented it. Rune names it.**
