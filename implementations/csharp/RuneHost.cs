// Rune Protocol — C# Host
// The host wires the four stores together and provides the surface
// that document formats or UI frameworks consume.

namespace Rune;

// ─────────────────────────────────────────────
// The Host — one per document/screen
// ─────────────────────────────────────────────

public class RuneHost
{
    public RuneStateStore    State   { get; } = new();
    public RuneActionRegistry Actions { get; } = new();
    public RuneIntentStore   Intent  { get; } = new();

    // Resolve any identifier for @ binding (read)
    public object? Read(string identifier)
        => ResolveNestedIdentifier(identifier);

    // Write for ~ binding (sync from input to state)
    public void Sync(string identifier, object? value)
        => State.Set(identifier, value);

    // Dispatch for ! binding (act)
    public Task Act(string actionName, params object?[] args)
        => Actions.Dispatch(actionName, args);

    // Record ? binding (intent — no runtime effect, preserved for tooling)
    public void RecordIntent(string elementPath, string annotation)
        => Intent.Record(elementPath, annotation);

    // Resolve dot-notation: "item.title" against a context object
    private object? ResolveNestedIdentifier(string identifier)
    {
        var parts = identifier.Split('.');

        // Simple state lookup
        if (parts.Length == 1)
            return State.Get(identifier);

        // Nested: first part is state name, rest is property path
        var root = State.Get(parts[0]);
        return parts[1..].Aggregate(root, GetProperty);
    }

    private static object? GetProperty(object? obj, string property)
    {
        if (obj is null) return null;
        var prop = obj.GetType().GetProperty(property);
        return prop?.GetValue(obj);
    }
}

// ─────────────────────────────────────────────
// Attribute for declarative state declaration
// ─────────────────────────────────────────────

// Host formats can use these attributes on C# classes
// to declare Rune bindings without XML/markup.

[AttributeUsage(AttributeTargets.Property)]
public class RuneStateAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Property)]
public class RuneComputedAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Method)]
public class RuneActionAttribute(string name) : Attribute
{
    public string Name { get; } = name;
}

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Method)]
public class RuneIntentAttribute(string annotation) : Attribute
{
    public string Annotation { get; } = annotation;
}

// ─────────────────────────────────────────────
// Host Builder — reflection-based registration
// Scans a class for Rune attributes and auto-registers
// ─────────────────────────────────────────────

public static class RuneHostBuilder
{
    public static RuneHost From<T>(T instance) where T : class
    {
        var host = new RuneHost();
        var type = typeof(T);

        // Register state and computed properties
        foreach (var prop in type.GetProperties())
        {
            var statAttr    = prop.GetCustomAttribute<RuneStateAttribute>();
            var compAttr    = prop.GetCustomAttribute<RuneComputedAttribute>();
            var intentAttr  = prop.GetCustomAttribute<RuneIntentAttribute>();

            var name = ToKebabCase(prop.Name);

            if (compAttr is not null)
            {
                host.State.DeclareComputed(name, () => prop.GetValue(instance));
            }
            else if (statAttr is not null)
            {
                host.State.Declare(name, prop.GetValue(instance));

                // Wire ~ sync back: when host.Sync(name, value) is called,
                // write back to the property
                // (In a real implementation this uses INotifyPropertyChanged
                //  or a generated proxy — simplified here for clarity)
            }

            if (intentAttr is not null)
                host.RecordIntent(name, intentAttr.Annotation);
        }

        // Register action methods
        foreach (var method in type.GetMethods())
        {
            var actionAttr = method.GetCustomAttribute<RuneActionAttribute>();
            if (actionAttr is null) continue;

            var parameters = method.GetParameters();

            if (parameters.Length == 0)
                host.Actions.Register(actionAttr.Name,
                    () => { method.Invoke(instance, null); });
            else
                host.Actions.Register(actionAttr.Name,
                    (object?[] args) => { method.Invoke(instance, args); return Task.CompletedTask; });
        }

        return host;
    }

    private static string ToKebabCase(string name)
    {
        // "NewTask" → "new-task", "UnreadCount" → "unread-count"
        return string.Concat(name.Select((c, i) =>
            i > 0 && char.IsUpper(c) ? $"-{char.ToLower(c)}" : char.ToLower(c).ToString()));
    }
}
