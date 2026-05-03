# React / TypeScript Implementation

The React implementation splits cleanly into two layers: a framework-agnostic TypeScript host, and a thin React adapter of four hooks. The host runs equally in Vue, Svelte, or Node. The React layer is the only file with a framework dependency.

---

## rune-host.ts — Framework-Agnostic Host

The same four stores as the C# implementation, in TypeScript. No React import. No framework coupling.

```typescript
export class RuneHost {
  readonly state   = new RuneStateStore();
  readonly actions = new RuneActionRegistry();
  readonly intent  = new RuneIntentStore();

  read(identifier: string): unknown          // @ — resolves dot-notation
  sync(identifier: string, value: unknown)   // ~ — write to mutable state
  act(actionName: string, ...args): Promise<void>  // ! — dispatch action
  recordIntent(path: string, annotation: string)   // ? — record annotation
  subscribe(fn: Subscriber): () => void      // for React re-renders
}
```

Build the host once, outside React — not per-render:

```typescript
function buildTaskHost(): RuneHost {
  const host = new RuneHost();

  host.state.declare('tasks', [] as TaskItem[]);
  host.state.declare('new-task', '');
  host.state.declareComputed('pending',
    () => (host.read('tasks') as TaskItem[]).filter(t => !t.done));

  host.recordIntent('new-task', 'cleared after add-task fires');

  host.actions.register('add-task', () => {
    const title = (host.read('new-task') as string).trim();
    if (!title) return;
    host.sync('tasks', [...(host.read('tasks') as TaskItem[]),
      { id: crypto.randomUUID(), title, done: false }]);
    host.sync('new-task', '');
  });

  return host;
}
```

---

## rune-react.tsx — The Four Hooks

The entire React layer. One provider, four hooks, one optional component.

```tsx
// Provider — one per screen
<RuneProvider host={host}>
  {children}
</RuneProvider>

// @ read — subscribes to state, re-renders on change
const pending = useRead<TaskItem[]>('pending');

// ~ sync — returns [value, setter] — controlled input in one call
const [newTask, setNewTask] = useSync<string>('new-task');

// ! act — returns stable dispatch function
const addTask = useAct('add-task');

// ? intent — registers annotation once on mount, renders nothing
useIntent('screen', 'mobile task list, focus on speed');

// Or as a component
<RuneIntent path="screen" annotation="mobile task list, focus on speed" />
```

`useRead` subscribes to state changes and triggers re-renders when the root key changes. `useSync` composes `useRead` with a stable setter. `useAct` returns a memoised dispatch. `useIntent` fires once on mount — no runtime effect, no re-render.

---

## example.tsx — Usage Patterns

**Pattern 1 — Hook-based (idiomatic React)**

```tsx
const taskHost = buildTaskHost();

export function TaskWorkbook() {
  return (
    <RuneProvider host={taskHost}>
      <TaskInput />
      <PendingList />
      <RuneIntent path="workbook" annotation="mobile, focus on speed" />
    </RuneProvider>
  );
}

function TaskInput() {
  const [newTask, setNewTask] = useSync<string>('new-task');  // ~
  const addTask               = useAct('add-task');            // !

  return (
    <div>
      <input value={newTask} onChange={e => setNewTask(e.target.value)} />
      <button onClick={() => addTask()}>Add</button>
    </div>
  );
}

function PendingList() {
  const pending = useRead<TaskItem[]>('pending');  // @
  return <ul>{pending.map(t => <li key={t.id}>{t.title}</li>)}</ul>;
}
```

**Pattern 2 — Fluent host for existing services**

```tsx
function buildRiskHost(riskService: RiskService): RuneHost {
  const host = new RuneHost();

  host.state.declareComputed('market-price', () => riskService.getMarketPrice());
  host.state.declare('risk-threshold', 0.15);
  host.recordIntent('risk-threshold',
    'approved by risk committee Q1-2025 — review at quarter end');

  host.actions.register('submit-order', (orderId: unknown) =>
    riskService.submitOrder(orderId as string));

  return host;
}
```

The host wraps the existing service — `riskService` never knows about Rune. The governance layer is additive.

---

## Full Source

[`implementations/react/`](https://github.com/semanticintent/rune-protocol/tree/main/implementations/react) on GitHub.
