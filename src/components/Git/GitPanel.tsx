// src/components/Git/GitPanel.tsx
import { useEffect, useMemo, type ReactElement } from 'react'
import { FileDiff, GitBranch, History } from 'lucide-react'
import { useAppStore, selectActiveWorkspace } from '@/store/app-store'
import { collectLeaves, findLeaf } from '@/lib/layout-tree'
import { useGitStore, type GitSubTab } from '@/store/git-store'
import { WorktreeSelector } from './WorktreeSelector'
import { ChangedFileList } from './ChangedFileList'
import { CommitHistoryList } from './CommitHistoryList'
import { BranchManager } from './BranchManager'
import { cn } from '@/lib/utils'

export function GitPanel(): ReactElement {
  const loading = useGitStore((s) => s.loading)
  const error = useGitStore((s) => s.error)
  const worktrees = useGitStore((s) => s.worktrees)
  const currentCwd = useGitStore((s) => s.currentCwd)
  const commitInfo = useGitStore((s) => s.commitInfo)
  const changedFiles = useGitStore((s) => s.changedFiles)
  const gitSubTab = useGitStore((s) => s.gitSubTab)
  const setGitSubTab = useGitStore((s) => s.setGitSubTab)
  const fetchWorktrees = useGitStore((s) => s.fetchWorktrees)

  // Branch -> agent id for the panes currently bound to a worktree
  const workspaces = useAppStore((s) => s.workspaces)
  const agentByBranch = useMemo(() => {
    const map: Record<string, string> = {}
    for (const w of workspaces)
      for (const l of collectLeaves(w.layout))
        if (l.worktreeBranch && l.agentId) map[l.worktreeBranch] = l.agentId
    return map
  }, [workspaces])

  // Subscribe to the focused terminal's CWD and re-fetch when it changes.
  useEffect(() => {
    const unsubscribe = useAppStore.subscribe((state) => {
      const ws = selectActiveWorkspace(state)
      if (!ws) return
      const leaf = findLeaf(ws.layout, ws.focusedLeafId)
      const cwd = leaf?.cwd ?? ws.cwd
      if (!cwd) return
      if (cwd !== useGitStore.getState().currentCwd) {
        void fetchWorktrees(cwd)
      }
    })
    // Initial fetch on mount.
    const ws = selectActiveWorkspace(useAppStore.getState())
    if (ws) {
      const leaf = findLeaf(ws.layout, ws.focusedLeafId)
      const cwd = leaf?.cwd ?? ws.cwd
      if (cwd) void fetchWorktrees(cwd)
    }
    return unsubscribe
  }, [fetchWorktrees])

  const subTabButton = (key: GitSubTab, label: React.ReactNode, icon: React.ReactNode): ReactElement => (
    <button
      type="button"
      onClick={() => setGitSubTab(key)}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors rounded-sm',
        gitSubTab === key
          ? 'bg-muted text-foreground font-semibold'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-background">
      <WorktreeSelector agentByBranch={agentByBranch} />

      {/* Sub-tab navigation strip */}
      <div className="flex items-center gap-1 border-b border-border/80 px-2 py-1 bg-muted/20 shrink-0">
        {subTabButton(
          'changes',
          <>
            Changes
            {changedFiles.length > 0 && (
              <span className="ml-1 rounded-full bg-emerald-500/20 px-1.5 text-[10px] font-mono text-emerald-400">
                {changedFiles.length}
              </span>
            )}
          </>,
          <FileDiff className="h-3 w-3" />
        )}
        {subTabButton('history', 'History', <History className="h-3 w-3" />)}
        {subTabButton('branches', 'Branches', <GitBranch className="h-3 w-3" />)}
      </div>

      {loading && (
        <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
          Loading git data…
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-1 items-center justify-center px-3 text-center text-xs text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && currentCwd !== '' && worktrees.length === 0 && (
        <div className="flex flex-1 items-center justify-center px-3 text-center text-xs text-muted-foreground">
          Not a git repository
        </div>
      )}

      {/* Sub-tab content */}
      {!loading && !error && worktrees.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {gitSubTab === 'changes' && <ChangedFileList />}
          {gitSubTab === 'history' && <CommitHistoryList />}
          {gitSubTab === 'branches' && <BranchManager />}
        </div>
      )}

      {commitInfo && (
        <div className="flex shrink-0 items-center gap-2 border-t border-border bg-muted/30 px-2.5 py-1 text-[10px] text-muted-foreground font-mono">
          {commitInfo.ahead != null && (
            <span>
              <span className="text-emerald-400">↑{commitInfo.ahead}</span>
              {' · '}
              <span className="text-rose-400">↓{commitInfo.behind ?? 0}</span>
            </span>
          )}
          {commitInfo.branch && (
            <span className="truncate text-muted-foreground/80">({commitInfo.branch})</span>
          )}
          {commitInfo.headSha && (
            <span className="ml-auto">HEAD: {commitInfo.headSha}</span>
          )}
        </div>
      )}
    </div>
  )
}
