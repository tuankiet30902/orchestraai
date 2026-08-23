import { useEffect, useRef, useState, type ReactElement } from 'react'
import {
  Folder,
  FolderSearch,
  Minus,
  Plus,
  GitBranch,
  Play,
  X
} from 'lucide-react'
import {
  TEMPLATES,
  isTemplateAvailable
} from '@/lib/templates'
import { TERMINAL_COUNTS, layoutSummary } from '@/lib/layout-tree'
import { allocateAgents, clampCounts } from '@/lib/agent-allocation'
import { useAgentAvailabilityStore } from '@/store/agent-availability-store'
import { useAppStore } from '@/store/app-store'
import { AgentIcon } from '@/components/AgentIcon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { pickDirectory } from '@/tauri/dialog'
import { listWorktrees, createWorktree, ensureRepoWithCommit } from '@/tauri/git'
import { listAgentSessions } from '@/tauri/sessions'
import { planWorktreeBranches, provisionWorktrees } from '@/lib/worktree-naming'
import { useRecentsStore } from '@/store/recents-store'
import {
  mergeSessions,
  sessionKey,
  type AgentSessionEntry
} from '@/lib/agent-sessions'
import { LayoutPreview } from './LayoutPreview'

const DEFAULT_TERMINAL_COUNT = 2

/** Templates that run an AI agent CLI. */
const CODING_TEMPLATES = TEMPLATES.filter((t) => t.command !== null)

interface NewWorkspaceModalProps {
  open: boolean
  onClose: () => void
  initialFolder?: string
}

export function NewWorkspaceModal({
  open,
  onClose,
  initialFolder = ''
}: NewWorkspaceModalProps): ReactElement | null {
  const createWorkspace = useAppStore((s) => s.createWorkspace)
  const addRecentFolder = useRecentsStore((s) => s.add)
  const availability = useAgentAvailabilityStore((s) => s.availability)

  const [folder, setFolder] = useState<string>(initialFolder)
  const [terminalCount, setTerminalCount] = useState<number>(DEFAULT_TERMINAL_COUNT)
  const [counts, setCounts] = useState<Record<string, number>>({ 'claude-code': 1 })
  const seededRef = useRef(false)

  const [isolateWorktrees, setIsolateWorktrees] = useState(false)
  const [isGitRepo, setIsGitRepo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [sessions, setSessions] = useState<AgentSessionEntry[]>([])
  const [tickedSessions] = useState<ReadonlySet<string>>(new Set())

  // Sync initial folder when modal opens
  useEffect(() => {
    if (open && initialFolder) {
      setFolder(initialFolder)
    }
  }, [open, initialFolder])

  // Correct seed once availability resolves
  useEffect(() => {
    if (seededRef.current) return
    seededRef.current = true
    const claude = TEMPLATES.find((t) => t.id === 'claude-code')
    if (claude && !isTemplateAvailable(claude, availability)) {
      setCounts({})
    }
  }, [availability])

  const totalAssigned = Object.values(counts).reduce((a, b) => a + b, 0)

  const changeTerminalCount = (next: number): void => {
    setTerminalCount(next)
    setCounts((c) => clampCounts(c, next))
  }

  const agentIds = allocateAgents(terminalCount, counts)
  const trimmedFolder = folder.trim()
  const canCreate = trimmedFolder !== ''

  // Probe whether folder is inside a git repo
  useEffect(() => {
    if (trimmedFolder === '' || !open) {
      setIsGitRepo(false)
      return
    }
    let cancelled = false
    void listWorktrees(trimmedFolder)
      .then((trees) => {
        if (cancelled) return
        const main = trees.find((t) => t.isMain)
        const unborn = main !== undefined && /^0+$/.test(main.head)
        setIsGitRepo(trees.length > 0 && !unborn)
      })
      .catch(() => {
        if (!cancelled) setIsGitRepo(false)
      })
    return () => {
      cancelled = true
    }
  }, [trimmedFolder, open])

  // Resume sessions discovery
  useEffect(() => {
    if (trimmedFolder === '' || !open) {
      setSessions([])
      return
    }
    let cancelled = false
    void listAgentSessions(trimmedFolder)
      .then((entries) => {
        if (!cancelled) setSessions(mergeSessions(entries, availability))
      })
      .catch(() => {
        if (!cancelled) setSessions([])
      })
    return () => {
      cancelled = true
    }
  }, [trimmedFolder, availability, open])

  const browse = async (): Promise<void> => {
    const picked = await pickDirectory()
    if (picked) setFolder(picked)
  }

  const resumePanes = sessions
    .filter((e) => tickedSessions.has(sessionKey(e)))
    .map((e) => ({ agentId: e.agentId, sessionId: e.sessionId, cwd: e.cwd }))

  const totalPaneCount = terminalCount + resumePanes.length
  const maxTiles = TERMINAL_COUNTS[TERMINAL_COUNTS.length - 1] // 12

  const submit = async (): Promise<void> => {
    if (!canCreate || isSubmitting) return
    setIsSubmitting(true)
    try {
      addRecentFolder(trimmedFolder)
      const isolate = isolateWorktrees
      let paneWorktrees: ({ path: string; branch: string } | null)[] | undefined

      if (isolate) {
        try {
          await ensureRepoWithCommit(trimmedFolder)
        } catch (err) {
          console.error('failed to initialize git repo:', err)
        }
        const plan = planWorktreeBranches(agentIds)
        paneWorktrees = await provisionWorktrees(plan, (name) =>
          createWorktree(trimmedFolder, name)
        )
      }

      createWorkspace({
        cwd: trimmedFolder,
        terminalCount,
        agentIds,
        worktreeMode: isolate,
        paneWorktrees,
        resumePanes: resumePanes.length > 0 ? resumePanes : undefined
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Esc and ⌘↵ inside modal
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose()
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        void submit()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, trimmedFolder, terminalCount, counts, isolateWorktrees, isSubmitting, tickedSessions, sessions])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create New Workspace"
        className="flex max-h-[90vh] w-[620px] max-w-[95vw] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl font-sans"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">
            Configure Workspace
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {/* 1. FOLDER SELECTION */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5 text-foreground">
                <Folder className="h-3.5 w-3.5 text-primary" />
                Project Directory
              </span>
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background/90 px-3 py-1.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <input
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="Select or enter project directory path…"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/60"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void browse()}
                className="h-6.5 px-2.5 text-xs gap-1"
              >
                <FolderSearch className="h-3 w-3" />
                Browse…
              </Button>
            </div>
          </div>

          {/* 2. NUMBER OF TERMINALS */}
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground">
              Terminal Panes ({layoutSummary(totalPaneCount)}):
            </span>
            <div className="flex flex-wrap gap-2">
              {TERMINAL_COUNTS.map((count) => {
                const selected = count === terminalCount
                const disabled = count + resumePanes.length > maxTiles
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => changeTerminalCount(count)}
                    disabled={disabled}
                    className={cn(
                      'flex h-8 min-w-[2.5rem] items-center justify-center rounded-md border text-xs font-bold transition-all',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                        : 'border-border bg-background/60 text-muted-foreground hover:text-foreground',
                      disabled && 'cursor-not-allowed opacity-30'
                    )}
                  >
                    {count}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. AGENT ALLOCATION & PREVIEW */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Agent Steppers */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span>Allocate AI Agents:</span>
                <span>{totalAssigned} / {terminalCount} assigned</span>
              </div>
              <div className="space-y-1">
                {CODING_TEMPLATES.map((t) => {
                  const available = isTemplateAvailable(t, availability)
                  const count = counts[t.id] ?? 0
                  const atCapacity = totalAssigned >= terminalCount
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-md border border-border/80 bg-background/50 px-2.5 py-1.5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <AgentIcon template={t} className="h-3.5 w-3.5" />
                        <span className="font-semibold text-foreground">{t.name}</span>
                      </div>
                      {available ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={count === 0}
                            onClick={() =>
                              setCounts((prev) => {
                                const next = { ...prev }
                                const n = (next[t.id] ?? 0) - 1
                                if (n <= 0) delete next[t.id]
                                else next[t.id] = n
                                return next
                              })
                            }
                            className="flex h-5 w-5 items-center justify-center rounded border border-border hover:bg-accent disabled:opacity-30"
                          >
                            <Minus className="h-2.5 w-2.5" />
                          </button>
                          <span className="w-4 text-center font-mono font-bold text-foreground">{count}</span>
                          <button
                            type="button"
                            disabled={atCapacity}
                            onClick={() =>
                              setCounts((prev) => ({ ...prev, [t.id]: (prev[t.id] ?? 0) + 1 }))
                            }
                            className="flex h-5 w-5 items-center justify-center rounded border border-border hover:bg-accent disabled:opacity-30"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50">not installed</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Layout Preview */}
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Layout Preview:
              </span>
              <div className="h-[135px] rounded-md border border-border bg-background/90 p-1">
                <LayoutPreview
                  terminalCount={totalPaneCount}
                  agents={[...agentIds, ...resumePanes.map((p) => p.agentId)]}
                />
              </div>
            </div>
          </div>

          {/* 4. GIT WORKTREES CHECKBOX */}
          <div className="rounded-md border border-border/80 bg-background/50 p-3">
            <label
              className="flex cursor-pointer items-center gap-2.5 text-xs select-none"
              title={isGitRepo ? undefined : 'Automatically initialize git if missing'}
            >
              <input
                type="checkbox"
                checked={isolateWorktrees}
                onChange={(e) => setIsolateWorktrees(e.target.checked)}
                className="h-4 w-4 rounded accent-primary"
              />
              <div>
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <GitBranch className="h-3.5 w-3.5 text-primary" />
                  Isolate in Git Worktrees (Recommended)
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Each agent works in its own isolated branch without merge collisions.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-end gap-2.5 border-t border-border bg-card px-5 py-3.5">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel (Esc)
          </Button>
          <Button
            size="sm"
            onClick={() => void submit()}
            disabled={!canCreate || isSubmitting}
            className="gap-1.5 font-semibold"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {isSubmitting ? 'Initializing…' : 'Launch Workspace (↵)'}
          </Button>
        </div>
      </div>
    </div>
  )
}
