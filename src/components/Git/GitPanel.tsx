// src/components/Git/GitPanel.tsx
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
  FolderGit2,
  List,
  FolderTree,
  FileCode,
  FileText,
  FileJson,
  File,
  MoreHorizontal,
  ExternalLink,
  CloudSync
} from 'lucide-react'
import { useAppStore, selectActiveWorkspace } from '@/store/app-store'
import { collectLeaves, findLeaf } from '@/lib/layout-tree'
import { useGitStore } from '@/store/git-store'
import {
  stageFile,
  unstageFile,
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
import { revealInFileManager } from '@/tauri/links'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { InlineDiff } from './InlineDiff'
import { VisualDiffViewer } from './VisualDiffViewer'
import { MergeBranchDialog } from './MergeBranchDialog'
import { CommitHistoryList } from './CommitHistoryList'
import { cn } from '@/lib/utils'

// File icon helper based on file extension (VS Code style)
function getFileIcon(path: string): ReactElement {
  const ext = path.split('.').pop()?.toLowerCase()
  if (['ts', 'tsx', 'js', 'jsx', 'rs', 'py', 'go', 'c', 'cpp', 'java', 'vue', 'svelte'].includes(ext ?? '')) {
    return <FileCode className="h-3 w-3 text-sky-400 shrink-0" />
  }
  if (['json', 'yaml', 'yml', 'toml', 'xml'].includes(ext ?? '')) {
    return <FileJson className="h-3 w-3 text-amber-400 shrink-0" />
  }
  if (['md', 'txt', 'doc', 'rst'].includes(ext ?? '')) {
    return <FileText className="h-3 w-3 text-emerald-400 shrink-0" />
  }
  return <File className="h-3 w-3 text-muted-foreground shrink-0" />
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  M: { label: 'M', className: 'text-amber-400' },
  A: { label: 'A', className: 'text-emerald-400' },
  D: { label: 'D', className: 'text-rose-400' },
  R: { label: 'R', className: 'text-sky-400' },
  '?': { label: 'U', className: 'text-emerald-400' }
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
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list')

  // Section Open/Collapsed state:
  // Active/opened sections render in main scroll body;
  // Collapsed sections dock at the bottom of the sidebar.
  const [stagedOpen, setStagedOpen] = useState(true)
  const [changesOpen, setChangesOpen] = useState(true)
  const [worktreesOpen, setWorktreesOpen] = useState(false)
  const [branchesOpen, setBranchesOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  // Modals
  const [fullDiff, setFullDiff] = useState<{ path: string; diff: string } | null>(null)
  const [mergeTarget, setMergeTarget] = useState<string | null>(null)
  const [branches, setBranches] = useState<BranchInfo[]>([])

  const workspaces = useAppStore((s) => s.workspaces)
  const agentByBranch = useMemo(() => {
    const map: Record<string, string> = {}
    for (const w of workspaces)
      for (const l of collectLeaves(w.layout))
        if (l.worktreeBranch && l.agentId) map[l.worktreeBranch] = l.agentId
    return map
  }, [workspaces])

  // Partition into Staged vs Unstaged changes
  const stagedFiles = useMemo(() => changedFiles.filter((f) => f.staged), [changedFiles])
  const unstagedFiles = useMemo(() => changedFiles.filter((f) => !f.staged), [changedFiles])

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

  const handleCommit = async (andPush = false) => {
    if (!commitMessage.trim() || !selectedWorktree || committing) return
    setCommitting(true)
    try {
      if (stagedFiles.length === 0 && unstagedFiles.length > 0) {
        await stageAll(selectedWorktree)
      }
      await commitChanges(selectedWorktree, commitMessage.trim())
      setCommitMessage('')
      if (andPush) {
        await gitPush(selectedWorktree)
        showFeedback('Committed & Pushed')
      } else {
        showFeedback('Committed')
      }
      refresh()
    } catch (err) {
      showFeedback(`Error: ${String(err)}`)
    } finally {
      setCommitting(false)
    }
  }

  const handleSync = async () => {
    if (!selectedWorktree || syncing) return
    setSyncing(true)
    try {
      await gitPull(selectedWorktree)
      await gitPush(selectedWorktree)
      showFeedback('Synchronized with remote')
      refresh()
    } catch (err) {
      showFeedback(`Sync failed: ${String(err)}`)
    } finally {
      setSyncing(false)
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
    if (!confirm('Discard all uncommitted changes in this working tree?')) return
    await discardAll(selectedWorktree)
    refresh()
  }

  const handleStageFile = async (file: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!selectedWorktree) return
    await stageFile(selectedWorktree, file)
    refresh()
  }

  const handleUnstageFile = async (file: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!selectedWorktree) return
    await unstageFile(selectedWorktree, file)
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

  const handleOpenFile = (filePath: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!selectedWorktree) return
    const fullPath = `${selectedWorktree}/${filePath}`
    void revealInFileManager(fullPath)
  }

  if (loading && worktrees.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-3 text-[11px] text-muted-foreground font-sans">
        Loading git repository…
      </div>
    )
  }

  if (error && worktrees.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-3 text-center font-sans">
        <FolderGit2 className="h-6 w-6 text-muted-foreground/40 mb-1.5" />
        <p className="text-[11.5px] font-semibold text-foreground">Not a Git Repository</p>
        <p className="text-[10.5px] text-muted-foreground mt-0.5">{error}</p>
      </div>
    )
  }

  const currentBranch = commitInfo?.branch || 'main'
  const ahead = commitInfo?.ahead ?? 0
  const behind = commitInfo?.behind ?? 0

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-card text-foreground font-sans select-none text-[11.5px]">
      {/* Top Source Control Toolbar (VS Code Style) */}
      <div className="flex h-8 items-center justify-between border-b border-border bg-muted/30 px-2.5 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-bold tracking-wider text-[10.5px] text-muted-foreground uppercase truncate">
            Source Control
          </span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {/* Tree / List View Toggle */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'list' ? 'tree' : 'list')}
            title={viewMode === 'list' ? 'View as Tree' : 'View as List'}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {viewMode === 'list' ? <FolderTree className="h-3 w-3" /> : <List className="h-3 w-3" />}
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={refresh}
            title="Refresh Git Status"
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <RotateCw className="h-3 w-3" />
          </button>

          {/* More Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="More Actions…"
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <MoreHorizontal className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-[11px] font-sans">
              <DropdownMenuItem onClick={handlePull}>
                <ArrowDown className="h-3 w-3 mr-2" />
                <span>Pull from Remote</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePush}>
                <ArrowUp className="h-3 w-3 mr-2" />
                <span>Push to Remote</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSync}>
                <CloudSync className="h-3 w-3 mr-2" />
                <span>Sync Changes</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleStageAll}>
                <Plus className="h-3 w-3 mr-2" />
                <span>Stage All Changes</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleUnstageAll}>
                <Minus className="h-3 w-3 mr-2" />
                <span>Unstage All Changes</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDiscardAll} className="text-destructive focus:text-destructive">
                <Undo2 className="h-3 w-3 mr-2" />
                <span>Discard All Changes</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="bg-muted border-b border-border px-2.5 py-1 text-[10.5px] text-foreground font-mono transition-all">
          {feedback}
        </div>
      )}

      {/* Commit Box & Split Button (VS Code Standard) */}
      <div className="p-2 border-b border-border bg-background space-y-1.5 shrink-0">
        <textarea
          rows={2}
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault()
              void handleCommit(false)
            }
          }}
          placeholder={`Message (⌘Enter to commit on "${currentBranch}")`}
          className="w-full rounded border border-border bg-card px-2 py-1 text-[11px] text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden focus:ring-1 focus:ring-foreground resize-none font-sans"
        />

        {/* Primary Commit Button with Dropdown Action */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            disabled={!commitMessage.trim() || committing}
            onClick={() => void handleCommit(false)}
            className="h-6 flex-1 text-[11px] bg-foreground text-background hover:bg-foreground/90 font-semibold gap-1.5 justify-center shadow-xs rounded"
          >
            <Check className="h-3 w-3" />
            <span>{committing ? 'Committing…' : 'Commit'}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-1.5 text-muted-foreground hover:text-foreground rounded"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 text-[11px] font-sans">
              <DropdownMenuItem onClick={() => void handleCommit(true)} disabled={!commitMessage.trim() || committing}>
                <Check className="h-3 w-3 mr-2" />
                <span>Commit & Push</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSync} disabled={syncing}>
                <CloudSync className="h-3 w-3 mr-2" />
                <span>Sync ({behind}↓ {ahead}↑)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MAIN SCROLLABLE CONTAINER (Contains all currently OPEN sections)       */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col divide-y divide-border/30">
        {/* STAGED CHANGES (if open and files exist) */}
        {stagedOpen && stagedFiles.length > 0 && (
          <div className="shrink-0">
            <div
              onClick={() => setStagedOpen(false)}
              className="flex h-[23px] items-center justify-between px-2 bg-muted/25 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <ChevronDown className="h-3 w-3" />
                <span>Staged Changes</span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 text-[9.5px] font-mono font-bold ml-1">
                  {stagedFiles.length}
                </span>
              </div>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={handleUnstageAll}
                  title="Unstage All Changes"
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Minus className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-border/10">
              {stagedFiles.map((file) => {
                const isExpanded = expandedFiles.has(file.path)
                const diff = fileDiffs.get(file.path) ?? ''
                const parts = file.path.split('/')
                const basename = parts.pop() ?? file.path
                const dir = parts.join('/')
                const statusInfo = STATUS_MAP[file.status] ?? { label: file.status, className: 'text-muted-foreground' }

                return (
                  <div key={`staged-${file.path}`} className="border-b border-border/10">
                    <div
                      onClick={() => toggleFileExpand(file.path)}
                      className="group flex h-[22px] cursor-pointer items-center gap-1.5 px-2 hover:bg-muted/30 transition-colors text-[11px]"
                    >
                      <span className="text-[9px] text-muted-foreground/60 w-2.5 shrink-0">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                      {getFileIcon(file.path)}
                      <span className="font-mono text-foreground font-medium truncate" title={file.path}>
                        {basename}
                      </span>
                      {dir && (
                        <span className="text-[10px] text-muted-foreground/50 truncate max-w-[100px]" title={dir}>
                          {dir}
                        </span>
                      )}

                      <span className="flex-1" />

                      {(file.added > 0 || file.removed > 0) && (
                        <span className="shrink-0 font-mono text-[9.5px] mr-1">
                          {file.added > 0 && <span className="text-emerald-400">+{file.added}</span>}
                          {file.added > 0 && file.removed > 0 && <span className="text-muted-foreground"> </span>}
                          {file.removed > 0 && <span className="text-rose-400">-{file.removed}</span>}
                        </span>
                      )}

                      <span className={`font-mono text-[10px] font-bold mr-1 ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>

                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleUnstageFile(file.path, e)}
                          title="Unstage File"
                          className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Minus className="h-2.5 w-2.5" />
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
                          <Maximize2 className="h-2.5 w-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenFile(file.path, e)}
                          title="Reveal File in Explorer"
                          className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && <InlineDiff raw={diff} />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* CHANGES (if open) */}
        {changesOpen && (
          <div className="shrink-0">
            <div
              onClick={() => setChangesOpen(false)}
              className="flex h-[23px] items-center justify-between px-2 bg-muted/25 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <ChevronDown className="h-3 w-3" />
                <span>Changes</span>
                <span className="rounded-full bg-muted px-1.5 py-0.2 text-[9.5px] font-mono font-bold text-muted-foreground ml-1">
                  {unstagedFiles.length}
                </span>
              </div>

              {unstagedFiles.length > 0 && (
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
                    onClick={handleDiscardAll}
                    title="Discard All Changes"
                    className="rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Undo2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="divide-y divide-border/10">
              {unstagedFiles.length === 0 ? (
                <div className="py-3 text-center text-[10.5px] text-muted-foreground/60 italic font-sans">
                  No changes in working directory
                </div>
              ) : (
                unstagedFiles.map((file) => {
                  const isExpanded = expandedFiles.has(file.path)
                  const diff = fileDiffs.get(file.path) ?? ''
                  const parts = file.path.split('/')
                  const basename = parts.pop() ?? file.path
                  const dir = parts.join('/')
                  const statusInfo = STATUS_MAP[file.status] ?? { label: file.status, className: 'text-muted-foreground' }

                  return (
                    <div key={`unstaged-${file.path}`} className="border-b border-border/10">
                      <div
                        onClick={() => toggleFileExpand(file.path)}
                        className="group flex h-[22px] cursor-pointer items-center gap-1.5 px-2 hover:bg-muted/30 transition-colors text-[11px]"
                      >
                        <span className="text-[9px] text-muted-foreground/60 w-2.5 shrink-0">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                        {getFileIcon(file.path)}
                        <span className="font-mono text-foreground font-medium truncate" title={file.path}>
                          {basename}
                        </span>
                        {dir && (
                          <span className="text-[10px] text-muted-foreground/50 truncate max-w-[100px]" title={dir}>
                            {dir}
                          </span>
                        )}

                        <span className="flex-1" />

                        {(file.added > 0 || file.removed > 0) && (
                          <span className="shrink-0 font-mono text-[9.5px] mr-1">
                            {file.added > 0 && <span className="text-emerald-400">+{file.added}</span>}
                            {file.added > 0 && file.removed > 0 && <span className="text-muted-foreground"> </span>}
                            {file.removed > 0 && <span className="text-rose-400">-{file.removed}</span>}
                          </span>
                        )}

                        <span className={`font-mono text-[10px] font-bold mr-1 ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>

                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleStageFile(file.path, e)}
                            title="Stage File"
                            className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDiscardFile(file.path, e)}
                            title="Discard Changes"
                            className="rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Undo2 className="h-2.5 w-2.5" />
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
                            <Maximize2 className="h-2.5 w-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenFile(file.path, e)}
                            title="Reveal File in Explorer"
                            className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && <InlineDiff raw={diff} />}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* AGENT WORKTREES (if open) */}
        {worktreesOpen && (
          <div className="shrink-0">
            <div
              onClick={() => setWorktreesOpen(false)}
              className="flex h-[23px] items-center justify-between px-2 bg-muted/25 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <ChevronDown className="h-3 w-3" />
                <span>Agent Worktrees</span>
                <span className="rounded-full bg-muted px-1.5 py-0.2 text-[9.5px] font-mono font-bold text-muted-foreground ml-1">
                  {worktrees.length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-border/10">
              {worktrees.map((wt) => {
                const isActive = wt.path === selectedWorktree
                const isMainBranch = wt.isMain || wt.branch === 'main' || wt.branch === 'master'
                const assignedAgent = agentByBranch[wt.branch]

                return (
                  <div
                    key={wt.path}
                    onClick={() => selectWorktree(wt.path)}
                    className={cn(
                      'group flex h-[24px] items-center justify-between px-2 cursor-pointer transition-colors text-[11px]',
                      isActive ? 'bg-muted/60 border-l-2 border-foreground' : 'hover:bg-muted/30 border-l-2 border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <GitBranch className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className={cn('font-mono font-medium truncate', isActive ? 'text-foreground font-semibold' : 'text-muted-foreground')}>
                        {wt.branch}
                      </span>
                      {isMainBranch && (
                        <span className="rounded bg-muted px-1 py-0.2 text-[8.5px] font-mono uppercase">
                          main
                        </span>
                      )}
                      {assignedAgent && (
                        <span className="rounded bg-muted px-1.5 py-0.2 text-[8.5px] font-mono text-foreground">
                          @{assignedAgent}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[9.5px] text-muted-foreground/50 font-mono">
                        {wt.head}
                      </span>

                      {!isMainBranch && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setMergeTarget(wt.branch)
                          }}
                          title={`Merge ${wt.branch} into main`}
                          className="h-5 gap-1 px-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <GitMerge className="h-2.5 w-2.5" />
                          <span>Merge</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* BRANCHES (if open) */}
        {branchesOpen && (
          <div className="shrink-0">
            <div
              onClick={() => setBranchesOpen(false)}
              className="flex h-[23px] items-center justify-between px-2 bg-muted/25 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <ChevronDown className="h-3 w-3" />
                <span>Branches</span>
                <span className="rounded-full bg-muted px-1.5 py-0.2 text-[9.5px] font-mono font-bold text-muted-foreground ml-1">
                  {branches.length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-border/10 max-h-44 overflow-y-auto">
              {branches.map((b) => (
                <div
                  key={b.name}
                  onClick={() => void handleCheckout(b.name)}
                  className={cn(
                    'flex h-[22px] items-center justify-between px-2 cursor-pointer text-[11px] transition-colors',
                    b.isCurrent ? 'bg-muted/50 font-semibold text-foreground' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-1.5 truncate font-mono">
                    <GitBranch className="h-3 w-3 shrink-0" />
                    <span className="truncate">{b.name}</span>
                    {b.isCurrent && <span className="rounded bg-muted px-1 py-0.2 text-[8.5px]">active</span>}
                  </div>
                  <span className="text-[9.5px] font-mono opacity-50 shrink-0">{b.headSha}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMMIT HISTORY (if open) */}
        {historyOpen && (
          <div className="shrink-0">
            <div
              onClick={() => setHistoryOpen(false)}
              className="flex h-[23px] items-center justify-between px-2 bg-muted/25 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <ChevronDown className="h-3 w-3" />
                <span>Commit History</span>
              </div>
            </div>

            <CommitHistoryList />
          </div>
        )}

        {/* Fallback when everything is closed */}
        {!stagedOpen && !changesOpen && !worktreesOpen && !branchesOpen && !historyOpen && (
          <div className="flex-1 flex items-center justify-center p-4 text-[11px] text-muted-foreground/60 italic font-sans">
            All sections collapsed. Click below to expand.
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. BOTTOM DOCKED AREA (Pinned to bottom: Contains COLLAPSED headers)       */}
      {/* ========================================================================= */}
      <div className="shrink-0 border-t border-border bg-card flex flex-col divide-y divide-border/30">
        {/* Collapsed Staged Changes Header */}
        {!stagedOpen && stagedFiles.length > 0 && (
          <div
            onClick={() => setStagedOpen(true)}
            className="flex h-[23px] items-center justify-between px-2 bg-muted/15 hover:bg-muted/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              <ChevronRight className="h-3 w-3" />
              <span>Staged Changes</span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 text-[9.5px] font-mono font-bold ml-1">
                {stagedFiles.length}
              </span>
            </div>
          </div>
        )}

        {/* Collapsed Changes Header */}
        {!changesOpen && (
          <div
            onClick={() => setChangesOpen(true)}
            className="flex h-[23px] items-center justify-between px-2 bg-muted/15 hover:bg-muted/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              <ChevronRight className="h-3 w-3" />
              <span>Changes</span>
              <span className="rounded-full bg-muted px-1.5 py-0.2 text-[9.5px] font-mono font-bold text-muted-foreground ml-1">
                {unstagedFiles.length}
              </span>
            </div>
          </div>
        )}

        {/* Collapsed Worktrees Header */}
        {!worktreesOpen && (
          <div
            onClick={() => setWorktreesOpen(true)}
            className="flex h-[23px] items-center justify-between px-2 bg-muted/15 hover:bg-muted/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              <ChevronRight className="h-3 w-3" />
              <span>Agent Worktrees</span>
              <span className="rounded-full bg-muted px-1.5 py-0.2 text-[9.5px] font-mono font-bold text-muted-foreground ml-1">
                {worktrees.length}
              </span>
            </div>
          </div>
        )}

        {/* Collapsed Branches Header */}
        {!branchesOpen && (
          <div
            onClick={() => setBranchesOpen(true)}
            className="flex h-[23px] items-center justify-between px-2 bg-muted/15 hover:bg-muted/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              <ChevronRight className="h-3 w-3" />
              <span>Branches</span>
              <span className="rounded-full bg-muted px-1.5 py-0.2 text-[9.5px] font-mono font-bold text-muted-foreground ml-1">
                {branches.length}
              </span>
            </div>
          </div>
        )}

        {/* Collapsed History Header */}
        {!historyOpen && (
          <div
            onClick={() => setHistoryOpen(true)}
            className="flex h-[23px] items-center justify-between px-2 bg-muted/15 hover:bg-muted/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              <ChevronRight className="h-3 w-3" />
              <span>Commit History</span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. STATUS BAR (Branch & Remote Sync at very bottom)                        */}
      {/* ========================================================================= */}
      <div className="flex h-6 items-center justify-between border-t border-border bg-muted/30 px-2 text-[10.5px] font-mono text-muted-foreground shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <GitBranch className="h-3 w-3 text-foreground" />
          <span className="truncate text-foreground font-medium">{currentBranch}</span>
        </div>

        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          title="Synchronize Changes"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <CloudSync className={cn('h-3 w-3', syncing && 'animate-spin')} />
          <span>{syncing ? 'Syncing…' : `${behind}↓ ${ahead}↑`}</span>
        </button>
      </div>

      {/* Full Visual Diff Modal */}
      {fullDiff && (
        <VisualDiffViewer
          open={Boolean(fullDiff)}
          filePath={fullDiff.path}
          rawDiff={fullDiff.diff}
          onClose={() => setFullDiff(null)}
        />
      )}

      {/* Merge Modal */}
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
