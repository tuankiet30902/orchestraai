// src/components/Settings/AgentsPanel.tsx
import { useEffect, type ReactElement } from 'react'
import { CheckCircle2, CircleAlert } from 'lucide-react'
import { useSettingsConfigStore } from '@/store/settings-config-store'
import { useAgentAvailabilityStore } from '@/store/agent-availability-store'
import { TEMPLATES } from '@/lib/templates'
import { AgentIcon } from '@/components/AgentIcon'

export function AgentsPanel(): ReactElement {
  const agents = useSettingsConfigStore((s) => s.settings.agents)
  const updateAgent = useSettingsConfigStore((s) => s.updateAgent)
  const availability = useAgentAvailabilityStore((s) => s.availability)
  const refreshAvailability = useAgentAvailabilityStore((s) => s.refresh)

  useEffect(() => {
    void refreshAvailability()
  }, [refreshAvailability])

  return (
    <div className="space-y-8 font-sans">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          AI Agents Configuration
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Configure CLI executable paths, custom launch arguments, and runtime detection for each AI agent tool.
        </p>
      </section>

      {/* Agents List */}
      <section className="space-y-4">
        {TEMPLATES.filter((t) => t.id !== 'terminal').map((t) => {
          const config = agents[t.id] ?? {
            id: t.id,
            name: t.name,
            binaryName: t.command,
            customPath: '',
            defaultArgs: '',
            enabled: true
          }
          const available = availability[t.id] ?? true

          return (
            <div
              key={t.id}
              className="rounded-xl border border-border bg-card/40 p-5 space-y-4 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border shadow-2xs">
                    <AgentIcon template={t} className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {t.name}
                      <span className="font-mono text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                        {config.binaryName}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {available ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Detected in PATH
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-md">
                      <CircleAlert className="h-3.5 w-3.5" />
                      Not Found in PATH
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/60">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Custom Binary Path (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. /usr/local/bin/${config.binaryName}`}
                    value={config.customPath}
                    onChange={(e) => updateAgent(t.id, { customPath: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground font-mono placeholder:text-muted-foreground/40 focus:outline-hidden focus:ring-1 focus:ring-foreground transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Default Launch Arguments
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. --dangerously-skip-permissions"
                    value={config.defaultArgs}
                    onChange={(e) => updateAgent(t.id, { defaultArgs: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground font-mono placeholder:text-muted-foreground/40 focus:outline-hidden focus:ring-1 focus:ring-foreground transition-all"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
