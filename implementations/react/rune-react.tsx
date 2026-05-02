// Rune Protocol — React Adapter
// Four hooks, one provider, one optional intent component.
// The host is framework-agnostic; this file is the only React dependency.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { RuneHost } from './rune-host';

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const RuneContext = createContext<RuneHost | null>(null);

function useHost(): RuneHost {
  const host = useContext(RuneContext);
  if (!host) throw new Error('useRune* hooks must be used inside <RuneProvider>');
  return host;
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

interface RuneProviderProps {
  host:     RuneHost;
  children: React.ReactNode;
}

export function RuneProvider({ host, children }: RuneProviderProps) {
  return <RuneContext.Provider value={host}>{children}</RuneContext.Provider>;
}

// ─────────────────────────────────────────────
// @ useRead — observe a state value, re-renders on change
// ─────────────────────────────────────────────

export function useRead<T = unknown>(identifier: string): T {
  const host  = useHost();
  const root  = identifier.split('.')[0];

  const [value, setValue] = useState<T>(() => host.read(identifier) as T);

  useEffect(() => {
    // Re-read when the root state key changes
    return host.subscribe((changedKey) => {
      if (changedKey === root) {
        setValue(host.read(identifier) as T);
      }
    });
  }, [host, identifier, root]);

  return value;
}

// ─────────────────────────────────────────────
// ~ useSync — two-way binding: returns [value, setter]
// Equivalent to a controlled input + onChange in one call.
// ─────────────────────────────────────────────

export function useSync<T = unknown>(identifier: string): [T, (value: T) => void] {
  const host   = useHost();
  const value  = useRead<T>(identifier);
  const setter = useCallback((v: T) => host.sync(identifier, v), [host, identifier]);
  return [value, setter];
}

// ─────────────────────────────────────────────
// ! useAct — returns a stable dispatch function
// ─────────────────────────────────────────────

export function useAct(actionName: string): (...args: unknown[]) => Promise<void> {
  const host = useHost();
  return useCallback((...args: unknown[]) => host.act(actionName, ...args), [host, actionName]);
}

// ─────────────────────────────────────────────
// ? useIntent — registers an annotation once on mount
// No runtime effect. Reads by tooling / AI via host.intent.all.
// ─────────────────────────────────────────────

export function useIntent(path: string, annotation: string): void {
  const host = useHost();
  const ref  = useRef(false);

  if (!ref.current) {
    host.recordIntent(path, annotation);
    ref.current = true;
  }
}

// ─────────────────────────────────────────────
// Optional: <RuneIntent> for JSX-native declaration
// Renders nothing — pure annotation for tooling.
// ─────────────────────────────────────────────

interface RuneIntentProps {
  path:       string;
  annotation: string;
}

export function RuneIntent({ path, annotation }: RuneIntentProps) {
  useIntent(path, annotation);
  return null;
}
