// Rune Protocol — TypeScript Host (framework-agnostic)
// Same four stores as the C# implementation.
// React is just one consumer — this runs equally in Vue, Svelte, or Node.

export type RuneType = '@' | '~' | '!' | '?';

export interface RuneBinding {
  type:        RuneType;
  identifier:  string;
  annotation?: string;
  args?:       string[];
}

export class RuneError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(`[${code}] ${message}`);
  }
}

// ─────────────────────────────────────────────
// State store — mutable values + computed
// ─────────────────────────────────────────────

type Subscriber = (name: string, value: unknown) => void;

export class RuneStateStore {
  private state    = new Map<string, unknown>();
  private computed = new Map<string, () => unknown>();
  private subs     = new Set<Subscriber>();

  declare(name: string, initial?: unknown)           { this.state.set(name, initial); }
  declareComputed(name: string, fn: () => unknown)   { this.computed.set(name, fn); }
  isComputed(name: string)                           { return this.computed.has(name); }

  get(name: string): unknown {
    if (this.computed.has(name)) return this.computed.get(name)!();
    if (this.state.has(name))    return this.state.get(name);
    throw new RuneError('RNE002', `Identifier '${name}' is not declared.`);
  }

  set(name: string, value: unknown): void {
    if (this.isComputed(name))
      throw new RuneError('RNE003', `Cannot sync to computed value '${name}'.`);
    if (!this.state.has(name))
      throw new RuneError('RNE002', `State '${name}' is not declared.`);

    this.state.set(name, value);
    this.subs.forEach(fn => fn(name, value));
  }

  subscribe(fn: Subscriber): () => void {
    this.subs.add(fn);
    return () => this.subs.delete(fn);
  }
}

// ─────────────────────────────────────────────
// Action registry — named async behaviors
// ─────────────────────────────────────────────

type ActionFn = (...args: unknown[]) => Promise<void> | void;

export class RuneActionRegistry {
  private actions = new Map<string, ActionFn>();

  register(name: string, fn: ActionFn) { this.actions.set(name, fn); }

  async dispatch(name: string, ...args: unknown[]): Promise<void> {
    const fn = this.actions.get(name);
    if (!fn) throw new RuneError('RNE002', `Action '${name}' is not registered.`);
    await fn(...args);
  }
}

// ─────────────────────────────────────────────
// Intent store — ? annotations, never discarded
// ─────────────────────────────────────────────

export class RuneIntentStore {
  private intent = new Map<string, string[]>();

  record(path: string, annotation: string): void {
    const list = this.intent.get(path) ?? [];
    list.push(annotation);
    this.intent.set(path, list);
  }

  for(path: string): string[]   { return this.intent.get(path) ?? []; }
  get all(): Record<string, string[]> { return Object.fromEntries(this.intent); }
}

// ─────────────────────────────────────────────
// The Host — one per screen / document
// ─────────────────────────────────────────────

export class RuneHost {
  readonly state   = new RuneStateStore();
  readonly actions = new RuneActionRegistry();
  readonly intent  = new RuneIntentStore();

  // @ read — resolves dot-notation
  read(identifier: string): unknown {
    const parts = identifier.split('.');
    if (parts.length === 1) return this.state.get(identifier);

    let value = this.state.get(parts[0]);
    for (const key of parts.slice(1)) {
      if (value == null) return null;
      value = (value as Record<string, unknown>)[key];
    }
    return value;
  }

  // ~ sync — write to mutable state
  sync(identifier: string, value: unknown): void {
    this.state.set(identifier, value);
  }

  // ! act — dispatch a named action
  act(actionName: string, ...args: unknown[]): Promise<void> {
    return this.actions.dispatch(actionName, ...args);
  }

  // ? intent — record annotation
  recordIntent(path: string, annotation: string): void {
    this.intent.record(path, annotation);
  }

  // Subscribe to any state change (used by React hooks for re-renders)
  subscribe(fn: Subscriber): () => void {
    return this.state.subscribe(fn);
  }
}
