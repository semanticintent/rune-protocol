// Rune Protocol — React Usage Examples
// Shows two patterns: hook-based (idiomatic React) and host-builder (declarative).

import React from 'react';
import { RuneHost } from './rune-host';
import {
  RuneIntent,
  RuneProvider,
  useAct,
  useIntent,
  useRead,
  useSync,
} from './rune-react';

// ─────────────────────────────────────────────
// Pattern 1: Hook-based (idiomatic React)
// The four hooks map directly to the four runes.
// Components are plain React — no framework knowledge required.
// ─────────────────────────────────────────────

// Build the host outside React (once per screen, not per render)
function buildTaskHost(): RuneHost {
  const host = new RuneHost();

  host.state.declare('tasks', [] as TaskItem[]);
  host.state.declare('new-task', '');

  host.state.declareComputed('pending',
    () => (host.read('tasks') as TaskItem[]).filter(t => !t.done)
  );

  host.recordIntent('tasks',    'active task list — user-managed, no auto-sorting');
  host.recordIntent('new-task', 'current input value, cleared after add-task fires');

  host.actions.register('add-task', () => {
    const title = (host.read('new-task') as string).trim();
    if (!title) return;
    const tasks = host.read('tasks') as TaskItem[];
    host.sync('tasks', [...tasks, { id: crypto.randomUUID(), title, done: false }]);
    host.sync('new-task', '');
  });

  host.actions.register('complete-task', (id: unknown) => {
    const tasks = host.read('tasks') as TaskItem[];
    host.sync('tasks', tasks.map(t => t.id === id ? { ...t, done: true } : t));
  });

  host.actions.register('delete-task', (id: unknown) => {
    host.sync('tasks', (host.read('tasks') as TaskItem[]).filter(t => t.id !== id));
  });

  return host;
}

interface TaskItem { id: string; title: string; done: boolean; }

const taskHost = buildTaskHost();

export function TaskWorkbook() {
  return (
    <RuneProvider host={taskHost}>
      <TaskInput />
      <PendingList />
      {/* ? intent as a component — no render output, pure annotation */}
      <RuneIntent path="task-workbook" annotation="mobile task list, minimal, focus on speed" />
    </RuneProvider>
  );
}

function TaskInput() {
  const [newTask, setNewTask] = useSync<string>('new-task');  // ~
  const addTask               = useAct('add-task');            // !

  return (
    <div>
      <input
        value={newTask}
        onChange={e => setNewTask(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && addTask()}
        placeholder="New task…"
      />
      <button onClick={() => addTask()}>Add</button>
    </div>
  );
}

function PendingList() {
  const pending      = useRead<TaskItem[]>('pending');    // @
  const completeTask = useAct('complete-task');           // !
  const deleteTask   = useAct('delete-task');             // !

  return (
    <ul>
      {pending.map(task => (
        <li key={task.id}>
          <span>{task.title}</span>
          <button onClick={() => completeTask(task.id)}>Done</button>
          <button onClick={() => deleteTask(task.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────
// Pattern 2: Fluent host + hooks
// Wiring existing services into Rune.
// The Risk dashboard from trading.md — React edition.
// ─────────────────────────────────────────────

interface RiskService {
  getMarketPrice():      number;
  getPositionPnl():      number;
  submitOrder(id: string): Promise<void>;
  escalateBreach(deskId: string): Promise<void>;
}

function buildRiskHost(riskService: RiskService): RuneHost {
  const host = new RuneHost();

  // @ read — live feed, display only
  host.state.declareComputed('market-price', () => riskService.getMarketPrice());
  host.state.declareComputed('position-pnl', () => riskService.getPositionPnl());

  // ~ sync — analyst-editable thresholds
  host.state.declare('risk-threshold', 0.15);
  host.state.declare('stop-loss',      0.05);

  // ? intent — travels with the document
  host.recordIntent('risk-threshold',
    'approved by risk committee Q1-2025 — review at quarter end');
  host.recordIntent('stop-loss',
    'maximum drawdown per desk policy v2.3 — change requires desk-head sign-off');

  // ! act — explicit, auditable
  host.actions.register('submit-order', (orderId: unknown) =>
    riskService.submitOrder(orderId as string));

  host.actions.register('escalate-breach', (deskId: unknown) =>
    riskService.escalateBreach(deskId as string));

  return host;
}

interface RiskDashboardProps { riskService: RiskService; orderId: string; deskId: string; }

export function RiskDashboard({ riskService, orderId, deskId }: RiskDashboardProps) {
  const riskHost = React.useMemo(() => buildRiskHost(riskService), [riskService]);

  return (
    <RuneProvider host={riskHost}>
      <RiskView orderId={orderId} deskId={deskId} />
    </RuneProvider>
  );
}

function RiskView({ orderId, deskId }: { orderId: string; deskId: string }) {
  const marketPrice   = useRead<number>('market-price');             // @
  const positionPnl   = useRead<number>('position-pnl');             // @
  const [threshold, setThreshold] = useSync<number>('risk-threshold'); // ~
  const [stopLoss,  setStopLoss]  = useSync<number>('stop-loss');      // ~
  const submitOrder     = useAct('submit-order');                     // !
  const escalateBreach  = useAct('escalate-breach');                  // !

  // ? intent — annotate this screen for AI tooling
  useIntent('risk-dashboard', 'institutional screen — notional > $1M');
  useIntent('risk-dashboard', 'all actions logged to compliance trail — REC-2024-007');

  return (
    <div>
      {/* @ read-only display */}
      <p>Market Price: {marketPrice}</p>
      <p>P&L: {positionPnl}</p>

      {/* ~ editable thresholds */}
      <label>
        Risk Threshold
        <input
          type="number"
          value={threshold}
          step="0.01"
          onChange={e => setThreshold(parseFloat(e.target.value))}
        />
      </label>
      <label>
        Stop Loss
        <input
          type="number"
          value={stopLoss}
          step="0.01"
          onChange={e => setStopLoss(parseFloat(e.target.value))}
        />
      </label>

      {/* ! explicit actions */}
      <button onClick={() => submitOrder(orderId)}>Submit Order</button>
      <button onClick={() => escalateBreach(deskId)}>Escalate Breach</button>
    </div>
  );
}
