// src/components/MissionControl/MissionControlModal.tsx
import { type ReactElement } from 'react'
import { Activity, X, Trash2, CheckCircle, AlertTriangle, Info, AlertCircle, GitBranch, CheckSquare, MessagesSquare, Cpu, Terminal } from 'lucide-react'
import { useMissionControlStore, type EventCategory, type EventSeverity } from '@/store/mission-control-store'
import { Button } from '@/components/ui/button'

const SEVERITY_ICON: Record<EventSeverity, ReactElement> = {
  info: <Info className="h-3.5 w-3.5 text-blue-400" />,
  success: <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />,
  warning: <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />,
  error: <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
}

const CATEGORY_ICON: Record<EventCategory, ReactElement> = {
  agent: <Terminal className="h-3 w-3 text-amber-400" />,
  git: <GitBranch className="h-3 w-3 text-emerald-400" />,
  task: <CheckSquare className="h-3 w-3 text-blue-400" />,
  pit: <MessagesSquare className="h-3 w-3 text-purple-400" />,
  token: <Cpu className="h-3 w-3 text-amber-400" />,
  system: <Activity className="h-3 w-3 text-muted-foreground" />
}

const CATEGORY_PILLS: Array<{ id: EventCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All Events' },
  { id: 'agent', label: 'Agents' },
  { id: 'git', label: 'Git & Worktrees' },
  { id: 'task', label: 'Tasks' },
  { id: 'pit', label: 'Orchestra Pit' },
  { id: 'token', label: 'Tokens' }
]

export function MissionControlModal({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}): ReactElement | null {
  const events = useMissionControlStore((s) => s.events)
  const activeFilter = useMissionControlStore((s) => s.activeFilter)
  const setActiveFilter = useMissionControlStore((s) => s.setActiveFilter)
  const clearEvents = useMissionControlStore((s) => s.clearEvents)

  if (!open) return null

  const filteredEvents =
    activeFilter === 'all'
      ? events
      : events.filter((e) => e.category === activeFilter)

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-card shadow-2xl text-foreground font-sans overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Mission Control & Activity Timeline
              </h2>
              <p className="text-xs text-muted-foreground">
                Live chronological telemetry across all running agents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearEvents}
              title="Clear event history"
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/20 px-4 py-2 overflow-x-auto no-scrollbar shrink-0">
          {CATEGORY_PILLS.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setActiveFilter(pill.id)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === pill.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Event Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredEvents.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-xs text-muted-foreground">
              <Activity className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="font-semibold text-foreground">No events recorded</p>
              <p className="mt-1 text-[11px]">Activity from all active agents will stream here in real time.</p>
            </div>
          ) : (
            filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex items-start gap-3 rounded-lg border border-border/70 bg-card p-3 hover:border-primary/40 transition-colors shadow-2xs"
              >
                <div className="mt-0.5 shrink-0">{SEVERITY_ICON[evt.severity]}</div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {evt.title}
                      </span>
                      <span className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground font-mono shrink-0">
                        {CATEGORY_ICON[evt.category]}
                        <span className="capitalize">{evt.category}</span>
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-muted-foreground/70 shrink-0">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  {evt.detail && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {evt.detail}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
