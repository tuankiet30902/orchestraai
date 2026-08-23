/**
 * token-store.ts — Per-terminal token usage tracking.
 * Accumulates usage snapshots from terminal output parsing.
 */
import { create } from 'zustand';
import {
  TokenUsage, CostEstimate, emptyUsage, addUsage, estimateCost,
} from '@/lib/token-tracker';

export interface TerminalTokenState {
  usage: TokenUsage;
  modelKey: string;   // best-guess model (from agent type)
  cost: CostEstimate;
  lastUpdated: number; // Date.now()
}

interface TokenState {
  byTerminal: Record<string, TerminalTokenState>;
  sessionTotal: TokenUsage;
}

interface TokenActions {
  /** Record a usage snapshot for a terminal (accumulates, not replaces). */
  recordUsage(terminalId: string, usage: TokenUsage, modelKey?: string): void;
  /** Replace (not accumulate) usage for a terminal — for snapshot-derived updates. */
  setUsage(terminalId: string, usage: TokenUsage, modelKey?: string): void;
  /** Clear a terminal's usage (pane closed). */
  clear(terminalId: string): void;
  /** Reset all usage for a new session. */
  resetSession(): void;
}

function computeTotal(byTerminal: Record<string, TerminalTokenState>): TokenUsage {
  return Object.values(byTerminal).reduce((acc, t) => addUsage(acc, t.usage), emptyUsage());
}

export const useTokenStore = create<TokenState & TokenActions>(set => ({
  byTerminal: {},
  sessionTotal: emptyUsage(),

  recordUsage(terminalId, delta, modelKey = 'default') {
    set(s => {
      const prev = s.byTerminal[terminalId];
      const usage = prev ? addUsage(prev.usage, delta) : delta;
      const cost = estimateCost(usage, modelKey);
      const byTerminal = {
        ...s.byTerminal,
        [terminalId]: { usage, modelKey, cost, lastUpdated: Date.now() },
      };
      return { byTerminal, sessionTotal: computeTotal(byTerminal) };
    });
  },

  setUsage(terminalId, usage, modelKey = 'default') {
    set(s => {
      const cost = estimateCost(usage, modelKey);
      const byTerminal = {
        ...s.byTerminal,
        [terminalId]: { usage, modelKey, cost, lastUpdated: Date.now() },
      };
      return { byTerminal, sessionTotal: computeTotal(byTerminal) };
    });
  },

  clear(terminalId) {
    set(s => {
      if (!s.byTerminal[terminalId]) return s;
      // Intentional unused binding — TS destructure-and-omit pattern
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [terminalId]: _omitted, ...rest } = s.byTerminal;
      return { byTerminal: rest, sessionTotal: computeTotal(rest) };
    });
  },

  resetSession() {
    set({ byTerminal: {}, sessionTotal: emptyUsage() });
  },
}));
