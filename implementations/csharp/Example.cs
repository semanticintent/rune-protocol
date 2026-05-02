// Rune Protocol — C# Usage Examples
// Shows two patterns: attribute-based (declarative) and fluent (explicit).

namespace Rune.Examples;

// ─────────────────────────────────────────────
// Pattern 1: Attribute-based (declarative)
// Define state, computed, and actions on a plain C# class.
// RuneHostBuilder reflects over it and wires everything up.
// ─────────────────────────────────────────────

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

    [RuneAction("complete-task")]
    public void CompleteTask(Guid id)
    {
        var task = Tasks.FirstOrDefault(t => t.Id == id);
        if (task is not null)
            Tasks[Tasks.IndexOf(task)] = task with { Done = true };
    }

    [RuneAction("delete-task")]
    public void DeleteTask(Guid id)
        => Tasks.RemoveAll(t => t.Id == id);
}

public record TaskItem(Guid Id, string Title, bool Done);

// Usage:
//   var workbook = new TaskWorkbook();
//   var host = RuneHostBuilder.From(workbook);
//
//   // What a template engine would call when rendering @pending
//   var pending = host.Read("pending");   // → IEnumerable<TaskItem>
//
//   // What a template engine calls when user types in ~new-task
//   host.Sync("new-task", "Buy groceries");
//
//   // What a template engine calls when user clicks !add-task
//   await host.Act("add-task");
//
//   // What a template engine calls when user clicks !complete-task with item.id
//   await host.Act("complete-task", taskId);
//
//   // What an AI tool calls to extract all intent annotations
//   var intent = host.Intent.All;


// ─────────────────────────────────────────────
// Pattern 2: Fluent (explicit)
// Wire state, computed, and actions manually.
// Useful when integrating with existing domain classes
// rather than building new ones.
// ─────────────────────────────────────────────

public static class RiskDashboardExample
{
    public static RuneHost Build(IRiskDataService riskService)
    {
        var host = new RuneHost();

        // @ read bindings — live data, display only
        host.State.DeclareComputed("market-price",
            () => riskService.GetMarketPrice());

        host.State.DeclareComputed("position-pnl",
            () => riskService.GetPositionPnl());

        // ~ sync bindings — analyst-editable thresholds
        host.State.Declare("risk-threshold", 0.15m);
        host.State.Declare("stop-loss", 0.05m);

        // ? intent — travels with the document, never discarded
        host.RecordIntent("risk-threshold",
            "approved by risk committee Q1-2025 — review at quarter end");
        host.RecordIntent("stop-loss",
            "maximum drawdown per desk policy v2.3 — change requires desk-head sign-off");

        // ! act bindings — explicit, auditable
        host.Actions.Register("submit-order", async (object?[] args) =>
        {
            var orderId = (Guid)args[0]!;
            await riskService.SubmitOrder(orderId);
            // logged to OMS automatically — Rune ! guarantees explicitness
        });

        host.Actions.Register("escalate-breach", async (object?[] args) =>
        {
            var deskId = (string)args[0]!;
            await riskService.EscalateBreach(deskId);
        });

        return host;
    }
}

public interface IRiskDataService
{
    decimal GetMarketPrice();
    decimal GetPositionPnl();
    Task SubmitOrder(Guid orderId);
    Task EscalateBreach(string deskId);
}


// ─────────────────────────────────────────────
// Pattern 3: Parsing a Rune document at runtime
// A host format (e.g. a template engine, config loader)
// parses attributes and resolves them through the host.
// ─────────────────────────────────────────────

public static class DocumentProcessor
{
    // Simulate processing an element's attributes.
    // In a real host this would be called during template rendering.
    public static async Task ProcessElement(
        string elementId,
        Dictionary<string, string> attributes,
        RuneHost host,
        object? userInput = null)
    {
        var bindings = RuneParser.ParseAll(attributes);

        foreach (var binding in bindings)
        {
            switch (binding.Type)
            {
                case RuneType.Read:
                    // Resolve and render the value
                    var value = host.Read(binding.Identifier);
                    Console.WriteLine($"[{elementId}] @{binding.Identifier} = {value}");
                    break;

                case RuneType.Sync:
                    if (userInput is not null)
                    {
                        // User typed/changed something — write back to state
                        host.Sync(binding.Identifier, userInput);
                        Console.WriteLine($"[{elementId}] ~{binding.Identifier} ← {userInput}");
                    }
                    break;

                case RuneType.Act:
                    // User triggered this element — dispatch action
                    // Args reference state values via host.Read()
                    var resolvedArgs = binding.Args
                        .Select(arg => arg.Contains('.') ? host.Read(arg) : (object?)arg)
                        .ToArray();

                    await host.Act(binding.Identifier, resolvedArgs);
                    Console.WriteLine($"[{elementId}] !{binding.Identifier}({string.Join(", ", resolvedArgs)})");
                    break;

                case RuneType.Intent:
                    // Record — no runtime effect
                    host.RecordIntent(elementId, binding.Annotation!);
                    break;
            }
        }
    }
}

// ─────────────────────────────────────────────
// Rune in Blazor (thin integration layer)
// Shows how Rune maps to Blazor's component model
// ─────────────────────────────────────────────

// In a Blazor host, you'd add a thin adapter:
//
// @inject RuneHost Host
//
// <!-- Template: field ~new-task -->
// <input value="@Host.Read("new-task")"
//        @oninput="e => Host.Sync("new-task", e.Value)" />
//
// <!-- Template: button !add-task -->
// <button @onclick="() => Host.Act("add-task")">Add</button>
//
// <!-- Template: list @pending -->
// @foreach (var item in (IEnumerable<TaskItem>)Host.Read("pending"))
// {
//     <!-- Template: heading @item.title -->
//     <h3>@item.Title</h3>
// }
//
// The Blazor layer is 3 lines per rune type.
// The protocol is the same regardless of the UI framework.
