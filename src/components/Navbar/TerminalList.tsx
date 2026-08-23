import type { ReactElement } from 'react'
import { Terminal } from 'lucide-react'
import { collectLeaves } from '@/lib/layout-tree'
import { DEFAULT_TEMPLATE_ID } from '@/lib/templates'
import { resolvePaneTitle } from '@/lib/pane-title'
import { useAppStore } from '@/store/app-store'
import { useTerminalTitleStore } from '@/store/terminal-title-store'
import { useTerminalActivityStore } from '@/store/terminal-activity-store'
import { useAgentStateStore } from '@/store/agent-state-store'
import { displayState, paneDot } from '@/lib/agent-state/rollup'
import { ActivityDot } from '@/components/ActivityDot'
import { StateDot } from '@/components/StateDot'
import { cn } from '@/lib/utils'

/**
 * The TERMINALS section of the left rail: one row per pane of the *active*
 * workspace. Clicking a row focuses that pane — it reuses `setFocusedLeaf`,
 * which both highlights the pane and pulls keyboard focus into its xterm.
 */
export function TerminalList(): ReactElement | null {
  const workspaces = useAppStore((s) => s.workspaces)
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId)
  const welcomeFocused = useAppStore((s) => s.welcomeFocused)
  const setFocusedLeaf = useAppStore((s) => s.setFocusedLeaf)
  const titles = useTerminalTitleStore((s) => s.titles)
  const customTitles = useTerminalTitleStore((s) => s.customTitles)
  const activity = useTerminalActivityStore((s) => s.active)
  const agentStates = useAgentStateStore((s) => s.byId)

  const active = workspaces.find((w) => w.id === activeWorkspaceId)
  // Nothing to mirror while the Welcome tab is foreground or before any
  // workspace exists.
  if (welcomeFocused || !active) return null

  const leaves = collectLeaves(active.layout)

  return (
    <div className="flex min-h-0 flex-1 flex-col border-t border-border">
      <p className="shrink-0 border-b border-border bg-muted/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
        Terminals
      </p>
      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
        {leaves.map((leaf) => {
          const agentId = leaf.agentId ?? DEFAULT_TEMPLATE_ID
          const title = resolvePaneTitle(agentId, titles[leaf.terminalId], customTitles[leaf.terminalId])
          const focused = leaf.id === active.focusedLeafId
          return (
            <li key={leaf.id}>
              <div
                onClick={() => setFocusedLeaf(leaf.id)}
                title={title}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors',
                  focused
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                )}
              >
                <Terminal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate font-mono text-[11px] leading-tight">{title}</span>
                {(() => {
                  const dot = paneDot(
                    displayState(agentStates[leaf.terminalId]),
                    activity[leaf.terminalId] === true
                  )
                  if (dot === null) return null
                  return dot === 'activity' ? <ActivityDot /> : <StateDot state={dot} />
                })()}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
