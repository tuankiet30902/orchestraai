import { useState, useEffect, useMemo, type ReactElement } from 'react'
import {
  GitBranch,
  RotateCw,
  Plus,
  Minus,
  Undo2,
  Maximize2,
  ChevronDown,
  ChevronRight,
  GitMerge,
  ArrowUp,
  ArrowDown,
  Check,
  FolderGit2
} from 'lucide-react'
import { useAppStore, selectActiveWorkspace } from '@/store/app-store'
import { collectLeaves, findLeaf } from '@/lib/layout-tree'
import { useGitStore } from '@/store/git-store'
import {
  stageFile,
  stageAll,
  unstageAll,
  commitChanges,
  gitPush,
  gitPull,
  discardFile,
  discardAll,
  checkoutBranch,
  listBranches,
  type BranchInfo
} from '@/tauri/git'
import { Button } from '@/components/ui/button'
import { InlineDiff } from './InlineDiff'
import { VisualDiffViewer } from './VisualDiffViewer'
import { MergeBranchDialog } from './MergeBranchDialog'
import { CommitHistoryList } from './CommitHistoryList'
import { cn } from '@/lib/utils'

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  M: { label: 'M', className: 'text-amber-400 font-bold' },
  A: { label: 'A', className: 'text-emerald-400 font-bold' },
  D: { label: 'D', className: 'text-rose-400 font-bold' },
  R: { label: 'R', className: 'text-blue-400 font-bold' },
  '?': { label: 'U', className: 'text-muted-foreground font-bold' }
}

export function GitPanel(): ReactElement {
  const loading = useGitStore((s) => s.loading)
  const error = useGitStore((s) => s.error)
  const worktrees = useGitStore((s) => s.worktrees)
  const selectedWorktree = useGitStore((s) => s.selectedWorktreePath)
  const changedFiles = useGitStore((s) => s.changedFiles)
  const commitInfo = useGitStore((s) => s.commitInfo)
  const fileDiffs = useGitStore((s) => s.fileDiffs)
  const expandedFiles = useGitStore((s) => s.expandedFiles)
  const toggleFileExpand = useGitStore((s) => s.toggleFileExpand)
  const selectWorktree = useGitStore((s) => s.selectWorktree)
  const fetchWorktrees = useGitStore((s) => s.fetchWorktrees)
  const refresh = useGitStore((s) => s.refresh)

  const [commitMessage, setCommitMessage] = useState('')
  const [committing, setCommitting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Collapsible sections
  const [changesOpen, setChangesOpen] = useState(true)
  const [worktreesOpen, setWorktreesOpen] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [branchesOpen, setBranchesOpen] = useState(false)

  // Full Diff modal
  const [fullDiff, setFullDiff] = useState<{ path: string; diff: string } | null>(null)
  const [mergeTarget, setMergeTarget] = useState<string | null>(null)

  // Branches list
  const [branches, setBranches] = useState<BranchInfo[]>([])

  const workspaces = useAppStore((s) => s.workspaces)
  const agentByBranch = useMemo(() => {
    const map: Record<string, string> = {}
    for (const w of workspaces)
      for (const l of collectLeaves(w.layout))
        if (l.worktreeBranch && l.agentId) map[l.worktreeBranch] = l.agentId
    return map
  }, [workspaces])

  // Subscribe to CWD changes
  useEffect(() => {
    const unsubscribe = useAppStore.subscribe((state) => {
      const ws = selectActiveWorkspace(state)
      if (!ws) return
      const leaf = findLeaf(ws.layout, ws.focusedLeafId)
      const cwd = leaf?.cwd ?? ws.cwd
      if (cwd && cwd !== useGitStore.getState().currentCwd) {
        void fetchWorktrees(cwd)
      }
    })
    const ws = selectActiveWorkspace(useAppStore.getState())
    if (ws) {
      const leaf = findLeaf(ws.layout, ws.focusedLeafId)
      const cwd = leaf?.cwd ?? ws.cwd
      if (cwd) void fetchWorktrees(cwd)
    }
    return unsubscribe
  }, [fetchWorktrees])

  // Load branches
  useEffect(() => {
    if (!selectedWorktree) return
    listBranches(selectedWorktree)
      .then(setBranches)
      .catch(() => {})
  }, [selectedWorktree, commitInfo?.branch])

  const showFeedback = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 2500)
  }

  const handleCommit = async () => {
    if (!commitMessage.trim() || !selectedWorktree || committing) return
    setCommitting(true)
    try {
      // Stage all changes before commit if not staged
      await stageAll(selectedWorktree)
      await commitChanges(selectedWorktree, commitMessage.trim())
      setCommitMessage('')
      showFeedback('Committed successfully')
      refresh()
    } catch (err) {
      showFeedback(`Error: ${String(err)}`)
    } finally {
      setCommitting(false)
    }
  }

  const handlePush = async () => {
    if (!selectedWorktree || syncing) return
    setSyncing(true)
    try {
      await gitPush(selectedWorktree)
      showFeedback('Pushed to remote')
      refresh()
    } catch (err) {
      showFeedback(`Push failed: ${String(err)}`)
    } finally {
      setSyncing(false)
    }
  }

  const handlePull = async () => {
    if (!selectedWorktree || syncing) return
    setSyncing(true)
    try {
      await gitPull(selectedWorktree)
      showFeedback('Pulled latest changes')
      refresh()
    } catch (err) {
      showFeedback(`Pull failed: ${String(err)}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleStageAll = async () => {
    if (!selectedWorktree) return
    await stageAll(selectedWorktree)
    refresh()
  }

  const handleUnstageAll = async () => {
    if (!selectedWorktree) return
    await unstageAll(selectedWorktree)
    refresh()
  }

  const handleDiscardAll = async () => {
    if (!selectedWorktree) return
    if (!confirm('Discard all uncommitted changes in this worktree?')) return
    await discardAll(selectedWorktree)
    refresh()
  }

  const handleStageFile = async (file: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!selectedWorktree) return
    await stageFile(selectedWorktree, file)
    refresh()
  }

  const handleDiscardFile = async (file: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!selectedWorktree) return
    if (!confirm(`Discard changes to ${file}?`)) return
    await discardFile(selectedWorktree, file)
    refresh()
  }

  const handleCheckout = async (branchName: string) => {
    if (!selectedWorktree) return
    try {
      await checkoutBranch(selectedWorktree, branchName)
      showFeedback(`Switched to ${branchName}`)
      refresh()
    } catch (err) {
      showFeedback(`Checkout failed: ${String(err)}`)
    }
  }

  if (loading && worktrees.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-xs text-muted-foreground">
        Loading git status…
      </div>
    )
  }

  if (error && worktrees.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <FolderGit2 className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-xs font-semibold text-foreground">Not a Git Repository</p>
        <p className="text-[11px] text-muted-foreground mt-1">{error}</p>
      </div>
    )
  }

  const currentBranch = commitInfo?.branch || 'main'

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-card text-foreground font-sans select-none">
      {/* Top Source Control Header & Action Bar */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <GitBranch className="h-3.5 w-3.5 text-foreground shrink-0" />
          <span className="font-mono text-xs font-bold text-foreground truncate">
            {currentBranch}
          </span>
          {commitInfo?.ahead !== undefined && commitInfo.ahead !== null && commitInfo.ahead > 0 && (
            <span className="flex items-center text-[10px] font-mono text-emerald-400 font-bold" title={`${commitInfo.ahead} commits ahead`}>
              <ArrowUp className="h-2.5 w-2.5" />{commitInfo.ahead}
            </span>
          )}
          {commitInfo?.behind !== undefined && commitInfo.behind !== null && commitInfo.behind > 0 && (
            <span className="flex items-center text-[10px] font-mono text-amber-400 font-bold" title={`${commitInfo.behind} commits behind`}>
              <ArrowDown className="h-2.5 w-2.5" />{commitInfo.behind}
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={handlePull}
            disabled={syncing}
            title="Pull from remote (Git Pull)"
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handlePush}
            disabled={syncing}
            title="Push to remote (Git Push)"
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={refresh}
            title="Refresh Git Status"
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="bg-muted/90 border-b border-border px-3 py-1.5 text-[11px] text-foreground font-mono transition-all">
          {feedback}
        </div>
      )}

      {/* Commit Composer (VS Code / Cursor style) */}
      <div className="p-3 border-b border-border bg-background space-y-2 shrink-0">
        <textarea
          rows={2}
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault()
              void handleCommit()
            }
          }}
          placeholder="Commit message (⌘Enter to commit)..."
          className="w-full rounded border border-border bg-card p-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground resize-none font-sans"
        />

        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            size="sm"
            disabled={!commitMessage.trim() || committing}
            onClick={() => void handleCommit()}
            className="h-7 w-full text-xs bg-foreground text-background hover:bg-foreground/90 font-semibold gap-1.5 justify-center shadow-xs"
          >
            <Check className="h-3.5 w-3.5" />
            <span>{committing ? 'Committing…' : 'Commit Changes'}</span>
          </Button>
        </div>
      </div>

      {/* Scrollable Accordion Sections */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40">
        {/* 1. CHANGES SECTION */}
        <div>
          <div
            onClick={() => setChangesOpen(!changesOpen)}
            className="flex items-center justify-between px-3 py-1.5 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              {changesOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <span>CHANGES</span>
              <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                {changedFiles.length}
              </span>
            </div>

            {changedFiles.length > 0 && (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={handleStageAll}
                  title="Stage All Changes"
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={handleUnstageAll}
                  title="Unstage All Changes"
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={handleDiscardAll}
                  title="Discard All Changes"
                  className="rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Undo2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {changesOpen && (
            <div className="divide-y divide-border/20">
              {changedFiles.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground italic">
                  No changes detected in working tree
                </div>
              ) : (
                changedFiles.map((file) => {
                  const isExpanded = expandedFiles.has(file.path)
                  const diff = fileDiffs.get(file.path) ?? ''
                  const basename = file.path.split(/[/\\]/).pop() ?? file.path
                  const statusInfo = STATUS_MAP[file.status] ?? { label: file.status, className: 'text-muted-foreground' }

                  return (
                    <div key={file.path} className="border-b border-border/20">
                      <div
                        onClick={() => toggleFileExpand(file.path)}
                        className="group flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-muted/30 transition-colors text-xs"
                      >
                        <span className="text-[10px] text-muted-foreground/60 w-3">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                        <span className={`font-mono text-[10px] ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-mono text-foreground" title={file.path}>
                          {basename}
                        </span>

                        {(file.added > 0 || file.removed > 0) && (
                          <span className="shrink-0 font-mono text-[10px]">
                            {file.added > 0 && <span className="text-emerald-400">+{file.added}</span>}
                            {file.added > 0 && file.removed > 0 && <span className="text-muted-foreground"> </span>}
                            {file.removed > 0 && <span className="text-rose-400">-{file.removed}</span>}
                          </span>
                        )}

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleStageFile(file.path, e)}
                            title="Stage File"
                            className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDiscardFile(file.path, e)}
                            title="Discard Changes"
                            className="rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Undo2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setFullDiff({ path: file.path, diff })
                            }}
                            title="Open Visual Diff"
                            className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Maximize2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && <InlineDiff raw={diff} />}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* 2. AGENT WORKTREES SECTION */}
        <div>
          <div
            onClick={() => setWorktreesOpen(!worktreesOpen)}
            className="flex items-center justify-between px-3 py-1.5 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              {worktreesOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <span>AGENT WORKTREES</span>
              <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                {worktrees.length}
              </span>
            </div>
          </div>

          {worktreesOpen && (
            <div className="divide-y divide-border/20">
              {worktrees.map((wt) => {
                const isActive = wt.path === selectedWorktree
                const isMainBranch = wt.isMain || wt.branch === 'main' || wt.branch === 'master'
                const assignedAgent = agentByBranch[wt.branch]

                return (
                  <div
                    key={wt.path}
                    onClick={() => selectWorktree(wt.path)}
                    className={cn(
                      'group flex items-center justify-between px-3 py-2 cursor-pointer transition-colors text-xs',
                      isActive ? 'bg-muted/60 border-l-2 border-foreground' : 'hover:bg-muted/30 border-l-2 border-transparent'
                    )}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <GitBranch className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className={cn('font-mono font-medium truncate', isActive ? 'text-foreground font-semibold' : 'text-muted-foreground')}>
                          {wt.branch}
                        </span>
                        {isMainBranch && (
                          <span className="rounded bg-muted px-1 py-0.2 text-[9px] font-mono uppercase">
                            main
                          </span>
                        )}
                        {assignedAgent && (
                          <span className="rounded bg-muted px-1.5 py-0.2 text-[9px] font-mono text-foreground">
                            @{assignedAgent}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground/60 font-mono truncate">
                        {wt.head}
                      </div>
                    </div>

                    {!isMainBranch && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setMergeTarget(wt.branch)
                        }}
                        title={`Merge ${wt.branch} into main`}
                        className="h-6 gap-1 px-1.5 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <GitMerge className="h-3 w-3" />
                        <span>Merge</span>
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 3. BRANCHES SECTION */}
        <div>
          <div
            onClick={() => setBranchesOpen(!branchesOpen)}
            className="flex items-center justify-between px-3 py-1.5 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              {branchesOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <span>BRANCHES</span>
              <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                {branches.length}
              </span>
            </div>
          </div>

          {branchesOpen && (
            <div className="divide-y divide-border/20 max-h-48 overflow-y-auto">
              {branches.map((b) => (
                <div
                  key={b.name}
                  onClick={() => void handleCheckout(b.name)}
                  className={cn(
                    'flex items-center justify-between px-3 py-1.5 cursor-pointer text-xs transition-colors',
                    b.isCurrent ? 'bg-muted/50 font-semibold text-foreground' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-1.5 truncate font-mono">
                    <GitBranch className="h-3 w-3 shrink-0" />
                    <span className="truncate">{b.name}</span>
                    {b.isCurrent && <span className="rounded bg-muted px-1 py-0.2 text-[9px]">active</span>}
                  </div>
                  <span className="text-[10px] font-mono opacity-60 shrink-0">{b.headSha}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. COMMIT HISTORY SECTION */}
        <div>
          <div
            onClick={() => setHistoryOpen(!historyOpen)}
            className="flex items-center justify-between px-3 py-1.5 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              {historyOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <span>COMMIT HISTORY</span>
            </div>
          </div>

          {historyOpen && <CommitHistoryList />}
        </div>
      </div>

      {/* Modals */}
      {fullDiff && (
        <VisualDiffViewer
          open={Boolean(fullDiff)}
          filePath={fullDiff.path}
          rawDiff={fullDiff.diff}
          onClose={() => setFullDiff(null)}
        />
      )}

      {mergeTarget && (
        <MergeBranchDialog
          open={Boolean(mergeTarget)}
          repoCwd={selectedWorktree}
          sourceBranch={mergeTarget}
          targetBranch="main"
          onClose={() => setMergeTarget(null)}
          onSuccess={() => {
            showFeedback('Merged successfully!')
            refresh()
          }}
        />
      )}
    </div>
  )
}
