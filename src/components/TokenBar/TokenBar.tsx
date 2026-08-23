/**
 * TokenBar — A compact token usage summary bar.
 * Shows per-terminal usage in the pane header area or as a floating badge.
 */
import { useTokenStore } from '@/store/token-store';
import { formatTokens, formatCost } from '@/lib/token-tracker';

interface Props {
  terminalId: string;
  compact?: boolean;
}

export function TokenBar({ terminalId, compact = false }: Props) {
  const state = useTokenStore(s => s.byTerminal[terminalId]);
  if (!state || state.usage.totalTokens === 0) return null;

  const { usage, cost } = state;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
        <span className="text-amber-500/70">{formatTokens(usage.totalTokens)}</span>
        <span className="opacity-50">·</span>
        <span className="text-amber-500/70">{formatCost(cost.totalCostUsd)}</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3 px-2 py-1 text-[11px] font-mono text-muted-foreground bg-card border-b border-border">
      <span className="text-amber-500 font-medium">Tokens</span>
      <span className="flex gap-2">
        <span title="Input tokens">↓{formatTokens(usage.inputTokens)}</span>
        <span title="Output tokens">↑{formatTokens(usage.outputTokens)}</span>
        {usage.cacheRead > 0 && <span title="Cache read" className="opacity-60">♻{formatTokens(usage.cacheRead)}</span>}
      </span>
      <span className="opacity-50">·</span>
      <span className="text-amber-400">{formatCost(cost.totalCostUsd)}</span>
    </div>
  );
}

/** Session-wide totals across all terminals */
export function SessionTokenSummary() {
  const total = useTokenStore(s => s.sessionTotal);
  const byTerminal = useTokenStore(s => s.byTerminal);
  const agentCount = Object.keys(byTerminal).length;

  if (total.totalTokens === 0) return null;

  const totalCost = Object.values(byTerminal).reduce((sum, t) => sum + t.cost.totalCostUsd, 0);

  return (
    <div className="flex items-center gap-2 px-2 py-1 text-[10px] font-mono text-muted-foreground">
      <span className="text-amber-500/80">Session</span>
      <span>{formatTokens(total.totalTokens)} tokens</span>
      <span className="opacity-40">·</span>
      <span className="text-amber-400">{formatCost(totalCost)}</span>
      {agentCount > 1 && <span className="opacity-40">({agentCount} agents)</span>}
    </div>
  );
}
