# C# Implementation

The C# implementation maps the four runes to native language idioms — attributes for declaration, reflection for auto-registration, and a plain class as the host. No framework dependency. No runtime requirement beyond the standard library.

Three files. Each has a distinct role.

---

## RuneCore.cs — Domain Model

The complete domain model. Four types, a parser, three stores.

```csharp
// The four runes as a first-class enum
public enum RuneType
{
    Read,    // @  one-way, state → display
    Sync,    // ~  two-way, input ↔ state
    Act,     // !  explicit trigger, user → behavior
    Intent   // ?  annotation, no runtime effect
}

// A parsed binding — what comes out of the parser
public record RuneBinding(
    RuneType Type,
    string   Identifier,
    string?  Annotation = null,   // populated for ? only
    string[] Args       = default  // populated for ! with arguments
);

// Stable, spec-defined error codes
public enum RuneError
{
    RNE001_UnknownRune,
    RNE002_UnresolvedIdentifier,
    RNE003_SyncToComputed,
    RNE004_ConflictingRunes,
    RNE005_WrongArgumentCount,
    RNE006_ReadOnInputElement,
    RNE007_SyncOnDisplayElement
}
```

**Parser** — sigil → `RuneBinding`. Handles `@identifier`, `~identifier`, `!action with arg1 arg2`, `?"annotation"`. Validates composition rules: `@` and `~` cannot coexist on the same element.

**`RuneStateStore`** — mutable values + computed (read-only derived) values. `Set()` throws `RNE003` if the target is computed. `Subscribe()` returns a disposable — used by UI frameworks to trigger re-renders.

**`RuneActionRegistry`** — named async behaviors. Four `Register()` overloads covering zero-arg, single-arg, async, and sync. `Dispatch()` throws `RNE002` if the action is not registered.

**`RuneIntentStore`** — `?` annotations, never discarded. `All` exports the full intent map as a dictionary — consumed by AI tooling, audit systems, and documentation generators.

---

## RuneHost.cs — The Host

One host per document or screen. Wires the three stores together and provides the surface that UI frameworks consume.

```csharp
public class RuneHost
{
    public RuneStateStore     State   { get; } = new();
    public RuneActionRegistry Actions { get; } = new();
    public RuneIntentStore    Intent  { get; } = new();

    public object? Read(string identifier)   // @ — resolves dot-notation
    public void    Sync(string id, object? v) // ~ — write to mutable state
    public Task    Act(string name, ...)      // ! — dispatch named action
    public void    RecordIntent(...)          // ? — record annotation
}
```

**`RuneHostBuilder`** — reflection-based registration. Scans a class for `[RuneState]`, `[RuneComputed]`, `[RuneAction]`, and `[RuneIntent]` attributes and auto-registers everything. `ToKebabCase()` converts `RiskThreshold` → `risk-threshold` automatically.

```csharp
// Auto-wire an annotated class — one line
var host = RuneHostBuilder.From(new TaskWorkbook());

// What a template engine calls
host.Read("pending");               // @
host.Sync("new-task", "Buy milk");  // ~
await host.Act("add-task");         // !
var intent = host.Intent.All;       // ?
```

---

## Example.cs — Usage Patterns

Three patterns showing the protocol in action.

**Pattern 1 — Attribute-based (declarative)**

```csharp
public class TaskWorkbook
{
    [RuneState]
    [RuneIntent("active task list — user-managed, no auto-sorting")]
    public List<TaskItem> Tasks { get; set; } = [];

    [RuneState]
    [RuneIntent("current input value, cleared after add-task fires")]
    public string NewTask { get; set; } = "";

    [RuneComputed]
    public IEnumerable<TaskItem> Pending => Tasks.Where(t => !t.Done);

    [RuneAction("add-task")]
    public void AddTask()
    {
        if (string.IsNullOrWhiteSpace(NewTask)) return;
        Tasks.Add(new TaskItem(Guid.NewGuid(), NewTask, false));
        NewTask = "";
    }
}
```

**Pattern 2 — Fluent (explicit)**

```csharp
var host = new RuneHost();

host.State.DeclareComputed("market-price", () => riskService.GetMarketPrice());
host.State.Declare("risk-threshold", 0.15m);
host.RecordIntent("risk-threshold",
    "approved by risk committee Q1-2025 — review at quarter end");

host.Actions.Register("submit-order", async (object?[] args) =>
{
    var orderId = (Guid)args[0]!;
    await riskService.SubmitOrder(orderId);
});
```

**Pattern 3 — Template engine integration**

Shows how a host format processes element attributes, resolves bindings, and dispatches actions — the complete render/sync/act loop.

---

## Full Source

[`implementations/csharp/`](https://github.com/semanticintent/rune-protocol/tree/main/implementations/csharp) on GitHub.
