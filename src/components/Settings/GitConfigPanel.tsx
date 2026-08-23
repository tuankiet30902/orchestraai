import { type ReactElement } from 'react'
import { GitFork, SplitSquareVertical } from 'lucide-react'
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

export function GitConfigPanel(): ReactElement {
  const git = useSettingsConfigStore((s) => s.settings.git)
  const updateGit = useSettingsConfigStore((s) => s.updateGit)

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Git & Worktrees
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Control Git worktree branching for parallel agents, auto-cleanup on close, and diff viewing behavior.
        </p>
      </section>

      {/* Worktrees Config */}
      <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <GitFork className="h-4 w-4 text-primary" />
            Git Worktree Branch Prefix
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Prefix used when auto-generating isolated feature branches for each AI agent (e.g. <span className="font-mono">orchestra/agent-alpha</span>).
          </p>
        </div>

        <div className="pt-2">
          <input
            type="text"
            value={git.worktreeBranchPrefix}
            onChange={(e) => updateGit({ worktreeBranchPrefix: e.target.value })}
            placeholder="orchestra/"
            className="w-full max-w-sm rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="border-t border-border pt-2">
          <ToggleRow
            label="Auto-clean worktrees on pane close"
            description="Automatically delete the temporary git worktree folder when an agent pane is closed."
            checked={git.autoCleanupWorktrees}
            onChange={(on) => updateGit({ autoCleanupWorktrees: on })}
          />
        </div>
      </section>

      {/* Diff View Settings */}
      <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <SplitSquareVertical className="h-4 w-4 text-muted-foreground" />
            Default Diff View Mode
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            How changes are presented in the built-in Git review panel.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-md pt-2">
          <button
            type="button"
            onClick={() => updateGit({ diffViewMode: 'unified' })}
            className={cn(
              'flex flex-col items-start p-3 rounded-lg border text-left transition-colors',
              git.diffViewMode === 'unified'
                ? 'border-border bg-accent text-foreground font-semibold shadow-xs'
                : 'border-border bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            )}
          >
            <div className="text-xs font-semibold">Unified Diff</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Inline lines with + and -</div>
          </button>

          <button
            type="button"
            onClick={() => updateGit({ diffViewMode: 'split' })}
            className={cn(
              'flex flex-col items-start p-3 rounded-lg border text-left transition-colors',
              git.diffViewMode === 'split'
                ? 'border-border bg-accent text-foreground font-semibold shadow-xs'
                : 'border-border bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            )}
          >
            <div className="text-xs font-semibold">Side-by-Side Split</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Original on left, modified on right</div>
          </button>
        </div>
      </section>
    </div>
  )
}
