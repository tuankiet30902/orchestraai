import type { ReactElement } from 'react'
import { GitBranch } from 'lucide-react'
import { useGitStore } from '@/store/git-store'

export function BranchManager(): ReactElement {
  const branches = useGitStore((s) => s.branches)

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Branches header */}
      <div className="border-b border-border/60 px-3 py-1.5 shrink-0 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
        <span>Branches ({branches.length})</span>
        <span className="text-[10px] font-normal lowercase opacity-70">view-only</span>
      </div>

      {/* Branches list */}
      <div className="flex-1 overflow-y-auto p-1 divide-y divide-border/20">
        {branches.map((b) => {
          const isCurrent = b.isCurrent
          return (
            <div
              key={b.name}
              className={`flex items-center justify-between p-2 rounded-sm transition-colors ${
                isCurrent ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-accent/30'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                <GitBranch className={`h-3.5 w-3.5 shrink-0 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="font-mono text-xs truncate">{b.name}</span>
                {isCurrent && (
                  <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.2 rounded font-mono shrink-0">
                    current
                  </span>
                )}
                {b.upstream && (
                  <span className="text-[10px] text-muted-foreground/60 truncate font-mono">
                    → {b.upstream}
                  </span>
                )}
              </div>

              <span className="font-mono text-[10px] text-muted-foreground/50 shrink-0">
                {b.headSha}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
