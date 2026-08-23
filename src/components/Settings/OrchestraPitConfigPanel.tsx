import type { ReactElement } from 'react'
import { MessageSquare, Zap } from 'lucide-react'
import { useSettingsConfigStore } from '@/store/settings-config-store'
import { cn } from '@/lib/utils'

interface ToggleRowProps {
  label: string
  description?: string
  checked: boolean
  onChange: (on: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps): ReactElement {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background cursor-pointer',
          checked ? 'bg-foreground' : 'bg-muted'
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  )
}

export function OrchestraPitConfigPanel(): ReactElement {
  const pit = useSettingsConfigStore((s) => s.settings.orchestraPit)
  const updatePit = useSettingsConfigStore((s) => s.updateOrchestraPit)

  return (
    <div className="space-y-8 font-sans">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Orchestra Pit Collaboration
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Tune agent-to-agent communication, automatic message delivery, proactive prompt nudges, and transcript retention.
        </p>
      </section>

      {/* Automated Collaboration & Nudges */}
      <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-foreground" />
            Automatic Agent Nudging
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            When another agent sends a message in the Orchestra Pit, automatically dispatch prompt nudges into idle agent terminals.
          </p>
        </div>

        <ToggleRow
          label="Auto-nudge idle agents"
          description="Deliver incoming collaborative messages to idle agent panes without requiring manual prompt copy-pasting."
          checked={pit.autoNudgeIdleAgents}
          onChange={(on) => updatePit({ autoNudgeIdleAgents: on })}
        />

        <div className="pt-3 border-t border-border flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-foreground">Nudge Cooldown Interval</div>
            <div className="text-[11px] text-muted-foreground">Wait time before sending next automatic turn</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={5}
              max={120}
              value={pit.nudgeIntervalSec}
              onChange={(e) => updatePit({ nudgeIntervalSec: Math.max(5, parseInt(e.target.value, 10) || 15) })}
              className="w-20 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground font-mono text-center focus:outline-hidden focus:ring-1 focus:ring-foreground"
            />
            <span className="text-xs text-muted-foreground font-mono">seconds</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <ToggleRow
            label="Audio chime on collaborative messages"
            description="Play a subtle sound chime when an agent broadcasts an update in the Orchestra Pit."
            checked={pit.soundOnMessage}
            onChange={(on) => updatePit({ soundOnMessage: on })}
          />
        </div>
      </section>

      {/* Transcript & History */}
      <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-foreground" />
            History & Retention Limit
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Number of recent transcript messages kept in memory per collaboration room.
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-xs font-semibold text-foreground">Max Messages in Buffer</div>
            <div className="text-[11px] text-muted-foreground">Keeps memory lean during long multi-hour agent sprints</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={100}
              max={5000}
              step={100}
              value={pit.maxHistoryMessages}
              onChange={(e) => updatePit({ maxHistoryMessages: Math.max(100, parseInt(e.target.value, 10) || 500) })}
              className="w-24 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground font-mono text-center focus:outline-hidden focus:ring-1 focus:ring-foreground"
            />
            <span className="text-xs text-muted-foreground font-mono">messages</span>
          </div>
        </div>
      </section>
    </div>
  )
}
