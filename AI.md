# Rune and AI

## Inference vs Declaration

When AI works with a codebase it has two modes: **infer** or **read**.

Inference is archaeology — reconstructing intent from artifacts. AI reads property names, guesses mutability from setter presence, searches scattered comments for rationale, probabilistically determines which methods are user-facing. The quality of that reconstruction degrades with codebase size, naming inconsistency, and comment staleness. It is always approximate.

Declaration is direct. The system states what it is. AI reads it.

Rune is a declaration protocol. Every binding announces its nature — mutable or derived, display or input, action or annotation — structurally, in the type system, co-located with the code it describes. AI doesn't reconstruct the system's intent. It reads the system's own description of itself.

---

## C# — Inference vs Declaration

### Mutable state (~)

**Without Rune — AI infers:**
```csharp
// AI works backwards:
// setter exists → probably mutable
// name suggests a threshold → probably user-configurable
// no comment → rationale unknown
// nothing prevents direct assignment from anywhere in the codebase
public decimal RiskThreshold { get; set; } = 0.15m;
```

**With Rune — AI reads:**
```csharp
// AI reads this directly — nothing to infer:
// [RuneState]  → mutable, sync target, two-way binding
// [RuneIntent] → rationale is structural, not guessed
// only registered [RuneAction] methods can change this through the host
[RuneState]
[RuneIntent("approved by risk committee Q1-2025 — review at quarter end")]
public decimal RiskThreshold { get; set; } = 0.15m;
```

---

### Computed / read-only (@)

**Without Rune — AI infers:**
```csharp
// AI infers:
// getter-only → probably derived
// filters Tasks → but can a subclass override it? can it be wrong?
// nothing structurally prevents a ~ sync binding targeting this
public IEnumerable<TaskItem> Pending => Tasks.Where(t => !t.Done);
```

**With Rune — AI reads:**
```csharp
// AI reads:
// [RuneComputed] → derived, read-only, structurally cannot be a sync target
// attempting host.Sync("pending", ...) throws RNE003 — not a convention, a guarantee
[RuneComputed]
public IEnumerable<TaskItem> Pending => Tasks.Where(t => !t.Done);
```

---

### Action (!)

**Without Rune — AI infers:**
```csharp
// AI infers:
// public method → might be user-triggered, might be internal utility
// name suggests submission → probably consequential
// no way to know if it's audited, logged, or reversible
// no way to know if this is the only path to submission
public async Task SubmitOrder(Guid orderId) { ... }
```

**With Rune — AI reads:**
```csharp
// AI reads:
// [RuneAction] → explicitly user-triggered, registered in the action surface
// [RuneIntent] → consequences are declared, not inferred
// host.Actions is the complete list — no undeclared entry points exist
[RuneAction("submit-order")]
[RuneIntent("explicit, logged to OMS, irrevocable — pre-trade risk check runs here")]
public async Task SubmitOrder(Guid orderId) { ... }
```

---

### Intent (?)

**Without Rune — AI infers:**
```csharp
// AI searches:
// comments? → "// default 100" — tells AI nothing about why
// PR history? → might not be in context
// Confluence? → not in the codebase
// the person who set this? → probably left
public int MaxConnections { get; set; } = 100;
```

**With Rune — AI reads:**
```csharp
// AI reads the rationale directly — same session, every session, always current
[RuneState]
[RuneIntent("approved range 50–200 per capacity plan — tuned for p99 latency < 20ms")]
public int MaxConnections { get; set; } = 100;
```

---

## A Complete Class — Before and After

The transformation at scale. An order entry form — first as standard C# MVVM, then with Rune.

**Without Rune:**
```csharp
public class OrderEntryViewModel : INotifyPropertyChanged
{
    public string InstrumentName  { get; private set; }
    public decimal LastPrice      { get; private set; }
    public decimal BuyingPower    { get; private set; }

    public decimal Quantity       { get; set; }
    public string  OrderType      { get; set; } = "MARKET";
    public decimal LimitPrice     { get; set; }

    public ICommand PlaceOrderCommand  { get; }
    public ICommand CancelOrderCommand { get; }

    // AI questions with no answers in the code:
    // Which properties are display-only vs user-editable?
    // What are the constraints on Quantity?
    // Why is the default order type MARKET, not LIMIT?
    // What happens when PlaceOrder executes? Is it reversible?
    // Do risk checks run on field change or on PlaceOrder?
}
```

**With Rune:**
```csharp
public class OrderEntryViewModel
{
    // @ display only — feed-driven, structurally non-writable
    [RuneComputed]
    public string  InstrumentName => _feed.GetName(_instrumentId);

    [RuneComputed]
    public decimal LastPrice      => _feed.GetLastPrice(_instrumentId);

    [RuneComputed]
    public decimal BuyingPower    => _account.GetBuyingPower();

    // ~ user-editable fields — named, constrained, intentional
    [RuneState]
    [RuneIntent("round lot enforcement: min 100, multiples of 100")]
    public decimal Quantity  { get; set; }

    [RuneState]
    [RuneIntent("market or limit only — stop orders require separate workflow")]
    public string OrderType  { get; set; } = "MARKET";

    [RuneState]
    [RuneIntent("required when order-type = limit — validation runs in !place-order")]
    public decimal LimitPrice { get; set; }

    // ! explicit actions — the only sanctioned mutation paths
    [RuneAction("place-order")]
    [RuneIntent("pre-trade risk checks run here — not on field changes")]
    public async Task PlaceOrder() { ... }

    [RuneAction("cancel-order")]
    public async Task CancelOrder(Guid orderId) { ... }
}
```

**What AI reads from the Rune version — without inference:**
- 3 computed values (display-only, structurally non-writable)
- 3 mutable fields (named sync targets, each with governance rationale)
- 2 actions (complete action surface — nothing else can trigger behavior)
- Every constraint co-located with the field it governs
- "pre-trade risk checks run here — not on field changes" — a governance claim in the type system

---

## React / TypeScript — Inference vs Declaration

### Mutable state (~)

**Without Rune — AI infers:**
```tsx
// AI infers:
// useState → mutable, but what is the governance boundary?
// passed to input value + onChange → probably two-way
// name is local to this component — no identity outside it
// rationale: nowhere
const [riskThreshold, setRiskThreshold] = useState(0.15);

<input
  value={riskThreshold}
  onChange={e => setRiskThreshold(parseFloat(e.target.value))}
/>
```

**With Rune — AI reads:**
```tsx
// AI reads:
// useSync('risk-threshold') → named sync binding, canonical cross-stack identity
// host carries intent for 'risk-threshold' — rationale accessible via host.intent.for(...)
// mutation surface is the host — not scattered local setters
const [riskThreshold, setRiskThreshold] = useSync<number>('risk-threshold');

<input
  value={riskThreshold}
  onChange={e => setRiskThreshold(parseFloat(e.target.value))}
/>
```

---

### Read-only display (@)

**Without Rune — AI infers:**
```tsx
// AI infers:
// no setter → probably display-only, but nothing enforces it
// could be passed a setter prop and become mutable
// derived from props or external state? unclear without tracing
<span>{marketPrice}</span>
```

**With Rune — AI reads:**
```tsx
// AI reads:
// useRead('market-price') → read-only binding, structurally cannot sync
// host.state.isComputed('market-price') === true — feed-driven, not user-editable
const marketPrice = useRead<number>('market-price');

<span>{marketPrice}</span>
```

---

### Action (!)

**Without Rune — AI infers:**
```tsx
// AI infers:
// async function → probably consequential
// calls submitOrder → side effect somewhere downstream
// onClick handler → user-triggered, but is it the only entry point?
// no way to enumerate all actions in this screen
const handleSubmit = async () => {
  await riskService.submitOrder(orderId);
};

<button onClick={handleSubmit}>Submit Order</button>
```

**With Rune — AI reads:**
```tsx
// AI reads:
// useAct('submit-order') → named, registered, part of a complete action surface
// host.actions is the only path — structural guarantee, not convention
// intent: "explicit, logged to OMS, irrevocable" — carried by the host
const submitOrder = useAct('submit-order');

<button onClick={() => submitOrder(orderId)}>Submit Order</button>
```

---

### Intent (?)

**Without Rune — AI infers:**
```tsx
// AI searches:
// prop name 'timeInForce' → some finance term
// default 'DAY' → standard, but why not GTC?
// no comment, no constraint, no rationale
// AI approximates based on domain knowledge — might be wrong
<select value={timeInForce} onChange={...}>
```

**With Rune — AI reads:**
```tsx
// AI reads the rationale — no domain approximation needed
useIntent('time-in-force',
  'default DAY — GTC requires compliance pre-approval');

<select value={timeInForce} onChange={...}>
```

---

## What This Means in Practice

| | Without Rune | With Rune |
|---|---|---|
| **Is this field editable?** | Infer from setter, prop type, component usage | `[RuneState]` / `useSync` — declared |
| **Is this value derived?** | Infer from getter-only, naming | `[RuneComputed]` / `useRead` — declared |
| **What can a user trigger?** | Read all event handlers, all commands | `host.Actions` — complete, enumerable |
| **Why does this value exist?** | Search comments, PRs, wikis | `[RuneIntent]` / `useIntent` — co-located |
| **Is this safe to change?** | Trace all usages, approximate risk | `@` vs `~` — structural answer |
| **What changed this state?** | Trace all setters, all mutations | Named `!` action — one answer |

The shift is not incremental improvement in AI-assisted development. It is a change in kind — from a codebase that AI reads probabilistically to a codebase that speaks directly to any reader, human or machine, in a grammar that does not decay.
