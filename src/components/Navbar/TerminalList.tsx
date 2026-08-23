// src/components/Navbar/TerminalList.tsx
import { useState, type ReactElement } from 'react'
import { Pencil } from 'lucide-react'
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
import { AgentIcon } from '@/components/AgentIcon'
import { cn } from '@/lib/utils'

export function TerminalList(): ReactElement | null {
  const workspaces = useAppStore((s) => s.workspaces)
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId)
  const welcomeFocused = useAppStore((s) => s.welcomeFocused)
  const setFocusedLeaf = useAppStore((s) => s.setFocusedLeaf)
  const titles = useTerminalTitleStore((s) => s.titles)
  const customTitles = useTerminalTitleStore((s) => s.customTitles)
  const setCustomTitle = useTerminalTitleStore((s) => s.setCustomTitle)
  const activity = useTerminalActivityStore((s) => s.active)
  const agentStates = useAgentStateStore((s) => s.byId)

  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')

  const active = workspaces.find((w) => w.id === activeWorkspaceId)
  if (welcomeFocused || !active) return null

  const leaves = collectLeaves(active.layout)

  return (
    <div className="flex min-h-0 flex-1 flex-col border-t border-border font-sans select-none">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
          Active Panes ({leaves.length})
        </span>
      </div>
      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
        {leaves.map((leaf) => {
          const agentId = leaf.agentId ?? DEFAULT_TEMPLATE_ID
          const title = resolvePaneTitle(agentId, titles[leaf.terminalId], customTitles[leaf.terminalId])
          const focused = leaf.id === active.focusedLeafId
          const isEditing = renamingId === leaf.terminalId

          if (isEditing) {
            return (
              <li key={leaf.id} className="py-0.5">
                <input
                  type="text"
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCustomTitle(leaf.terminalId, draftName)
                      setRenamingId(null)
                    } else if (e.key === 'Escape') {
                      setRenamingId(null)
                    }
                  }}
                  onBlur={() => {
                    setCustomTitle(leaf.terminalId, draftName)
                    setRenamingId(null)
                  }}
                  className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground font-mono outline-hidden focus:ring-1 focus:ring-foreground"
                />
              </li>
            )
          }

          return (
            <li key={leaf.id}>
              <div
                onClick={() => setFocusedLeaf(leaf.id)}
                onDoubleClick={() => {
                  setDraftName(title)
                  setRenamingId(leaf.terminalId)
                }}
                title={`${title} (Double click to rename)`}
                className={cn(
                  'group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors',
                  focused
                    ? 'bg-muted/80 text-foreground font-medium shadow-2xs border border-border/80'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                )}
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <AgentIcon agentId={agentId} className="h-3.5 w-3.5 shrink-0" />
                  {activity[leaf.terminalId] === true && (
                    <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </div>

                <span className="flex-1 truncate font-mono text-[11px] leading-tight">{title}</span>

                {(() => {
                  const dot = paneDot(
                    displayState(agentStates[leaf.terminalId]),
                    activity[leaf.terminalId] === true
                  )
                  if (dot === null) return null
                  return dot === 'activity' ? <ActivityDot /> : <StateDot state={dot} />
                })()}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDraftName(title)
                    setRenamingId(leaf.terminalId)
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-foreground p-0.5 rounded text-muted-foreground transition-opacity"
                  title="Rename terminal"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
