import { useEffect, useState, type ReactElement } from 'react'
import { RefreshCw, ShieldAlert, Terminal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettingsConfigStore } from '@/store/settings-config-store'
import { useUpdaterStore } from '@/store/updater-store'
import { getAppVersion } from '@/tauri/app'
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
          'relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
          checked ? 'bg-primary' : 'bg-muted'
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

export function GeneralPanel(): ReactElement {
  const general = useSettingsConfigStore((s) => s.settings.general)
  const updateGeneral = useSettingsConfigStore((s) => s.updateGeneral)
  const resetToDefaults = useSettingsConfigStore((s) => s.resetToDefaults)

  const [version, setVersion] = useState<string | null>('0.1.0')
  const updater = useUpdaterStore((s) => s.state)
  const checkUpdates = useUpdaterStore((s) => s.check)

  useEffect(() => {
    getAppVersion()
      .then((v) => setVersion(v))
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          General Settings
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Configure application startup, automatic update checking, confirmation prompts, and diagnostics.
        </p>
      </section>

      {/* App Info & Updates */}
      <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border text-foreground">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                OrchestraAI
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  v{version}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Multi-Agent Development Studio</div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void checkUpdates(true)}
            disabled={updater.phase === 'checking' || updater.phase === 'downloading'}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', updater.phase === 'checking' && 'animate-spin')} />
            {updater.phase === 'checking' ? 'Checking...' : 'Check for Updates'}
          </Button>
        </div>

        <ToggleRow
          label="Automatic update checks"
          description="Silently check for new releases in the background on startup."
          checked={general.autoCheckUpdates}
          onChange={(on) => updateGeneral({ autoCheckUpdates: on })}
        />

        <ToggleRow
          label="Restore previous session"
          description="Re-open active workspaces and terminals when starting OrchestraAI."
          checked={general.restorePreviousSession}
          onChange={(on) => updateGeneral({ restorePreviousSession: on })}
        />

        <ToggleRow
          label="Confirm before closing panes"
          description="Ask for confirmation before closing active terminal panes that have running processes."
          checked={general.confirmBeforeClosingPane}
          onChange={(on) => updateGeneral({ confirmBeforeClosingPane: on })}
        />
      </section>

      {/* Danger Zone / Reset */}
      <section className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-destructive flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" />
              Reset All Settings
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Restore all preferences, agent paths, and keyboard configurations to default values.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
                resetToDefaults()
              }
            }}
            className="flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Reset to Defaults
          </Button>
        </div>
      </section>
    </div>
  )
}
