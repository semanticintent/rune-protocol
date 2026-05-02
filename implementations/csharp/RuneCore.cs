// Rune Protocol — C# Core
// The four runes as first-class types.
// This file is the complete domain model. No UI dependency, no framework dependency.

namespace Rune;

// ─────────────────────────────────────────────
// The four rune types — exactly four, no more
// ─────────────────────────────────────────────

public enum RuneType
{
    Read,    // @  one-way, state → display
    Sync,    // ~  two-way, input ↔ state
    Act,     // !  explicit trigger, user → behavior
    Intent   // ?  annotation, no runtime effect
}

public record RuneBinding(
    RuneType Type,
    string   Identifier,
    string?  Annotation = null,   // only populated for Intent runes
    string[] Args       = default  // only populated for Act runes with `with` arguments
)
{
    public static readonly string[] EmptyArgs = [];
    public string[] Args { get; init; } = Args ?? EmptyArgs;
}

// ─────────────────────────────────────────────
// Error codes — stable, spec-defined
// ─────────────────────────────────────────────

public enum RuneError
{
    RNE001_UnknownRune,           // character not in @ ~ ! ?
    RNE002_UnresolvedIdentifier,  // state or action not declared
    RNE003_SyncToComputed,        // ~ binding to read-only computed value
    RNE004_ConflictingRunes,      // @ and ~ on the same element
    RNE005_WrongArgumentCount,    // ! binding passed wrong number of args
    RNE006_ReadOnInputElement,    // @ on an input element (use ~)
    RNE007_SyncOnDisplayElement   // ~ on a display element (use @)
}

public class RuneException(RuneError code, string message)
    : Exception($"[{code}] {message}")
{
    public RuneError Code { get; } = code;
}

// ─────────────────────────────────────────────
// Parser — sigil → RuneBinding
// ─────────────────────────────────────────────

public static class RuneParser
{
    // Parse a single attribute name into a RuneBinding.
    // Returns null if the attribute is not a rune.
    public static RuneBinding? Parse(string attribute)
    {
        if (string.IsNullOrEmpty(attribute)) return null;

        return attribute[0] switch
        {
            '@' => new RuneBinding(RuneType.Read,   ResolveIdentifier(attribute[1..])),
            '~' => new RuneBinding(RuneType.Sync,   ResolveIdentifier(attribute[1..])),
            '!' => ParseActBinding(attribute[1..]),
            '?' => new RuneBinding(RuneType.Intent, "", Annotation: attribute[1..].Trim('"')),
            _   => null
        };
    }

    // Parse all rune attributes from a dictionary of element attributes.
    // Validates composition rules and reports errors.
    public static IReadOnlyList<RuneBinding> ParseAll(
        IReadOnlyDictionary<string, string> attributes)
    {
        var bindings = new List<RuneBinding>();

        foreach (var (key, _) in attributes)
        {
            var binding = Parse(key);
            if (binding is null) continue;
            bindings.Add(binding);
        }

        ValidateComposition(bindings);
        return bindings;
    }

    private static string ResolveIdentifier(string raw) =>
        raw.Trim();

    private static RuneBinding ParseActBinding(string raw)
    {
        // "action-name with arg1 arg2 arg3"
        var parts = raw.Split(" with ", 2, StringSplitOptions.TrimEntries);
        var name = parts[0];
        var args = parts.Length > 1
            ? parts[1].Split([' ', ','], StringSplitOptions.RemoveEmptyEntries)
            : RuneBinding.EmptyArgs;

        return new RuneBinding(RuneType.Act, name, Args: args);
    }

    private static void ValidateComposition(IReadOnlyList<RuneBinding> bindings)
    {
        bool hasRead = bindings.Any(b => b.Type == RuneType.Read);
        bool hasSync = bindings.Any(b => b.Type == RuneType.Sync);

        if (hasRead && hasSync)
            throw new RuneException(
                RuneError.RNE004_ConflictingRunes,
                "An element cannot have both @ (read) and ~ (sync) bindings.");

        if (bindings.Count(b => b.Type == RuneType.Sync) > 1)
            throw new RuneException(
                RuneError.RNE004_ConflictingRunes,
                "An element cannot have more than one ~ (sync) binding.");
    }
}

// ─────────────────────────────────────────────
// State Store — named mutable values
// ─────────────────────────────────────────────

public class RuneStateStore
{
    private readonly Dictionary<string, object?> _state    = new();
    private readonly Dictionary<string, Func<object?>> _computed = new();
    private readonly List<Action<string, object?>> _subscribers  = new();

    // Declare mutable state
    public void Declare(string name, object? initial = null)
        => _state[name] = initial;

    // Declare computed (read-only, derived)
    public void DeclareComputed(string name, Func<object?> fn)
        => _computed[name] = fn;

    public bool IsComputed(string name)
        => _computed.ContainsKey(name);

    // Set mutable state — notifies subscribers
    public void Set(string name, object? value)
    {
        if (IsComputed(name))
            throw new RuneException(
                RuneError.RNE003_SyncToComputed,
                $"Cannot write to computed value '{name}'.");

        if (!_state.ContainsKey(name))
            throw new RuneException(
                RuneError.RNE002_UnresolvedIdentifier,
                $"State '{name}' is not declared.");

        _state[name] = value;
        foreach (var sub in _subscribers) sub(name, value);
    }

    // Read — checks computed first, then mutable state
    public object? Get(string name)
    {
        if (_computed.TryGetValue(name, out var fn))    return fn();
        if (_state.TryGetValue(name, out var val))       return val;

        throw new RuneException(
            RuneError.RNE002_UnresolvedIdentifier,
            $"Identifier '{name}' is not declared in state or computed.");
    }

    // Subscribe to state changes (used by @ bindings to re-render)
    public IDisposable Subscribe(Action<string, object?> onChange)
    {
        _subscribers.Add(onChange);
        return new Subscription(() => _subscribers.Remove(onChange));
    }

    private record Subscription(Action Dispose) : IDisposable
    {
        void IDisposable.Dispose() => Dispose();
    }
}

// ─────────────────────────────────────────────
// Action Registry — named behaviors
// ─────────────────────────────────────────────

public class RuneActionRegistry
{
    private readonly Dictionary<string, Func<object?[], Task>> _actions = new();

    public void Register(string name, Action action)
        => _actions[name] = _ => { action(); return Task.CompletedTask; };

    public void Register(string name, Func<Task> action)
        => _actions[name] = _ => action();

    public void Register<T>(string name, Action<T> action)
        => _actions[name] = args => { action((T)args[0]); return Task.CompletedTask; };

    public void Register<T>(string name, Func<T, Task> action)
        => _actions[name] = args => action((T)args[0]);

    public async Task Dispatch(string name, params object?[] args)
    {
        if (!_actions.TryGetValue(name, out var action))
            throw new RuneException(
                RuneError.RNE002_UnresolvedIdentifier,
                $"Action '{name}' is not registered.");

        await action(args);
    }
}

// ─────────────────────────────────────────────
// Intent Store — ? annotations, never discarded
// ─────────────────────────────────────────────

public class RuneIntentStore
{
    private readonly Dictionary<string, List<string>> _intent = new();

    public void Record(string elementPath, string annotation)
    {
        if (!_intent.TryGetValue(elementPath, out var list))
            _intent[elementPath] = list = new();

        list.Add(annotation);
    }

    // Query all intent for a specific element
    public IReadOnlyList<string> For(string elementPath)
        => _intent.TryGetValue(elementPath, out var list) ? list : [];

    // Export all intent — for AI tools, audit, documentation
    public IReadOnlyDictionary<string, IReadOnlyList<string>> All
        => _intent.ToDictionary(
            kvp => kvp.Key,
            kvp => (IReadOnlyList<string>)kvp.Value);
}
