import type { ReactElement } from 'react'
import { Radio, X, Users } from 'lucide-react'
import { useAppStore, type Workspace as WorkspaceModel } from '@/store/app-store'
import { isMacPlatform } from '@/lib/platform'
import { Button } from '@/components/ui/button'

const altHint = isMacPlatform() ? '⌥' : 'Alt'

interface BroadcastBannerProps {
  workspace: WorkspaceModel
}

/**
 * Modern, high-visibility Conduct mode banner.
 * Unmistakably informs the user that keystrokes are being sent to multiple agent terminals.
 */
export function BroadcastBanner({ workspace }: BroadcastBannerProps): ReactElement | null {
  const selectAll = useAppStore((s) => s.selectAllBroadcast)
  const clear = useAppStore((s) => s.clearBroadcast)
  const toggle = useAppStore((s) => s.toggleBroadcast)

  if (!workspace.broadcastActive) return null
  const count = workspace.broadcastLeafIds.length

  return (
    <div className="flex h-8 shrink-0 items-center justify-between border-b border-primary/40 bg-primary/15 px-3 text-xs text-foreground shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 font-bold text-primary font-mono">
          <Radio className="h-4 w-4 animate-pulse text-primary" />
          <span>CONDUCT MODE ACTIVE</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full border border-border">
          <Users className="h-3 w-3 text-primary" />
          <span>{count} {count === 1 ? 'terminal targeted' : 'terminals targeted'}</span>
        </span>
        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={selectAll}
            className="rounded px-2 py-0.5 bg-primary/20 text-primary font-semibold hover:bg-primary/30 transition-colors"
          >
            Target all
          </button>
          <button
            type="button"
            onClick={clear}
            className="rounded px-2 py-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Clear selection
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          {altHint}+Click pane to toggle target
        </span>
        <Button
          size="sm"
          variant="destructive"
          onClick={toggle}
          className="h-6 px-2.5 text-xs font-semibold gap-1 rounded"
        >
          <X className="h-3.5 w-3.5" />
          <span>Stop Conduct (Esc)</span>
        </Button>
      </div>
    </div>
  )
}
