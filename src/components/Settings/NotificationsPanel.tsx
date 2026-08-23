// src/components/Settings/NotificationsPanel.tsx
import type { ReactElement } from 'react'
import { Bell, ShieldCheck } from 'lucide-react'
import { AgentIcon } from '@/components/AgentIcon'
import { manifestForAgent } from '@/lib/agent-state/manifests'
import { agentNotificationsEnabled } from '@/lib/notification-pref'
import { TEMPLATES } from '@/lib/templates'
import { cn } from '@/lib/utils'
import { useNotificationPrefStore } from '@/store/notification-pref-store'

interface ToggleRowProps {
  label: string
  description?: string
  checked: boolean
  onChange: (on: boolean) => void
  icon?: ReactElement
}

function ToggleRow({ label, description, checked, onChange, icon }: ToggleRowProps): ReactElement {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {icon}
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">{label}</div>
          {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
        </div>
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

/** Agent templates that actually have a state detector — plain shells never notify. */
const AGENT_TEMPLATES = TEMPLATES.filter((t) => manifestForAgent(t.id) !== undefined)

export function NotificationsPanel(): ReactElement {
  const prefs = useNotificationPrefStore((s) => s.prefs)
  const { setSound, setSystem, setAgentEnabled } = useNotificationPrefStore.getState()

  return (
    <div className="space-y-8 font-sans">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Notifications & Alerts
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Receive audio chimes and system notifications when background agents finish jobs or require human attention.
        </p>
      </section>

      {/* Global Notification Channels */}
      <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Bell className="h-4 w-4 text-foreground" />
            Global Notification Channels
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Master switches for audio sound and system-level alerts.
          </p>
        </div>

        <ToggleRow
          label="Audio Chime"
          description="Play a subtle audio bell when a background agent finishes or blocks on input."
          checked={prefs.sound}
          onChange={setSound}
        />

        <div className="border-t border-border pt-1">
          <ToggleRow
            label="System Desktop Notifications"
            description="Display an OS banner notification only when the OrchestraAI window is in the background or unfocused."
            checked={prefs.system}
            onChange={setSystem}
          />
        </div>
      </section>

      {/* Per-Agent Notification Control */}
      <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-foreground" />
            Per-Agent Notification Filters
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Toggle notification alerts for individual AI agent CLI tools.
          </p>
        </div>

        <div className="divide-y divide-border/60">
          {AGENT_TEMPLATES.map((t) => (
            <ToggleRow
              key={t.id}
              label={t.name}
              description={`Alerts for ${t.name} state changes`}
              checked={agentNotificationsEnabled(prefs, t.id)}
              onChange={(on) => setAgentEnabled(t.id, on)}
              icon={
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border shrink-0">
                  <AgentIcon template={t} className="h-4 w-4" />
                </div>
              }
            />
          ))}
        </div>
      </section>
    </div>
  )
}
