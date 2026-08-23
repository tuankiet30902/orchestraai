import type { ReactElement } from 'react'
import { GitCommit, History, User } from 'lucide-react'
import { useGitStore, type GitCommitLog } from '@/store/git-store'
import { writeClipboard } from '@/tauri/clipboard'

function formatTimeAgo(epochSec: number): string {
  if (!epochSec) return ''
  const diff = Math.floor(Date.now() / 1000 - epochSec)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function CommitRow({ commit }: { commit: GitCommitLog }): ReactElement {
  const handleCopyHash = (): void => {
    void writeClipboard(commit.hash)
  }

  return (
    <div className="border-b border-border/40 p-2 hover:bg-accent/30 transition-colors space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <GitCommit className="h-3.5 w-3.5 text-primary shrink-0" />
          <button
            type="button"
            onClick={handleCopyHash}
            title="Click to copy full commit hash"
            className="font-mono text-[10px] text-muted-foreground hover:text-foreground bg-muted/60 px-1 py-0.5 rounded shrink-0 cursor-pointer"
          >
            {commit.shortHash}
          </button>
          <span className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
            <User className="h-2.5 w-2.5 shrink-0 opacity-70" />
            <span className="truncate">{commit.authorName}</span>
          </span>
        </div>

        <span className="text-[10px] text-muted-foreground/60 font-mono shrink-0">
          {formatTimeAgo(commit.timestamp)}
        </span>
      </div>

      <p className="text-xs font-mono text-foreground leading-snug break-words pl-5">
        {commit.message}
      </p>
    </div>
  )
}

export function CommitHistoryList(): ReactElement {
  const history = useGitStore((s) => s.commitHistory)
  const loading = useGitStore((s) => s.loading)

  if (loading && history.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-xs text-muted-foreground">
        Loading commit history…
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground">
        <History className="mb-2 h-7 w-7 text-muted-foreground/40" />
        <p className="font-semibold text-foreground">No Commits Found</p>
        <p className="mt-1 text-[11px]">No commits recorded in this worktree.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-border/20">
      {history.map((c) => (
        <CommitRow key={c.hash} commit={c} />
      ))}
    </div>
  )
}
