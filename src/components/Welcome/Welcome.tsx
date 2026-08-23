import { useEffect, useState, type ReactElement } from 'react'
import {
  FolderOpen,
  FolderGit2,
  X,
  SquareTerminal,
  Sparkles,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { useAppStore } from '@/store/app-store'
import { pickDirectory, getHomeDir } from '@/tauri/dialog'
import { folderName } from '@/lib/recent-folders'
import { useRecentsStore } from '@/store/recents-store'
import { NewWorkspaceModal } from './NewWorkspaceModal'
import { useAgentAvailabilityStore } from '@/store/agent-availability-store'

export function Welcome(): ReactElement {
  const folder = useAppStore((s) => s.welcomeFolder)
  const setFolder = useAppStore((s) => s.setWelcomeFolder)
  const createWorkspace = useAppStore((s) => s.createWorkspace)
  const recents = useRecentsStore((s) => s.recents)
  const addRecent = useRecentsStore((s) => s.add)
  const removeRecentFolder = useRecentsStore((s) => s.remove)

  const [modalOpen, setModalOpen] = useState(false)
  const [targetFolder, setTargetFolder] = useState('')

  // Pre-fill home directory on mount if empty
  useEffect(() => {
    void getHomeDir().then((home) => {
      if (useAppStore.getState().welcomeFolder === '') setFolder(home)
    })
  }, [setFolder])

  // Probe agent CLIs on mount
  useEffect(() => {
    void useAgentAvailabilityStore.getState().refresh()
  }, [])

  // Open directory directly into a fresh workspace with 1 terminal
  const handleOpenFolder = async (): Promise<void> => {
    const picked = await pickDirectory()
    if (picked) {
      setFolder(picked)
      addRecent(picked)
      createWorkspace({
        cwd: picked,
        terminalCount: 1,
        agentIds: ['terminal'],
        worktreeMode: false
      })
    }
  }

  // Quick Terminal in Home directory
  const handleQuickTerminal = async (): Promise<void> => {
    const home = (await getHomeDir()) || folder || '/'
    createWorkspace({
      cwd: home,
      terminalCount: 1,
      agentIds: ['terminal'],
      worktreeMode: false
    })
  }

  // Open team setup modal for multi-agent configuration
  const handleNewTeamWorkspace = (initialPath?: string): void => {
    setTargetFolder(initialPath || folder || '')
    setModalOpen(true)
  }

  // Directly open selected recent workspace with 1 terminal
  const handleSelectRecentDirectly = (path: string): void => {
    setFolder(path)
    addRecent(path)
    createWorkspace({
      cwd: path,
      terminalCount: 1,
      agentIds: ['terminal'],
      worktreeMode: false
    })
  }

  // Keyboard shortcuts: ⌘O for Open Folder, ⌘T for Quick Terminal, ⌘N for Team Workspace
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      const isMod = e.metaKey || e.ctrlKey
      if (isMod && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        void handleOpenFolder()
      } else if (isMod && e.key.toLowerCase() === 't') {
        e.preventDefault()
        void handleQuickTerminal()
      } else if (isMod && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        handleNewTeamWorkspace()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [folder])

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col justify-center px-6 py-10 font-sans select-none">
      {/* BRAND & INTRO */}
      <div className="mb-7 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground/5 border border-border text-foreground shadow-xs">
          <Logo className="h-8 w-8 text-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Orchestra<span className="text-muted-foreground font-medium">AI</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          AI Multi-Agent Collaborative Development Studio
        </p>
      </div>

      {/* PRIMARY ACTION CARDS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* 1. Open Folder Card (Direct 1-click terminal in project) */}
        <button
          type="button"
          onClick={() => void handleOpenFolder()}
          className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-foreground/30 hover:bg-muted/30 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
              <FolderOpen className="h-4 w-4" />
            </div>
            <span className="font-mono text-[10px] text-muted-foreground group-hover:text-foreground">
              ⌘O
            </span>
          </div>
          <div className="mt-3.5">
            <h2 className="text-xs font-bold text-foreground group-hover:text-foreground transition-colors">
              Open Folder…
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
              Open a project folder with an instant terminal
            </p>
          </div>
        </button>

        {/* 2. Quick Terminal Card (Instant shell) */}
        <button
          type="button"
          onClick={() => void handleQuickTerminal()}
          className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-foreground/30 hover:bg-muted/30 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
              <SquareTerminal className="h-4 w-4" />
            </div>
            <span className="font-mono text-[10px] text-muted-foreground group-hover:text-foreground">
              ⌘T
            </span>
          </div>
          <div className="mt-3.5">
            <h2 className="text-xs font-bold text-foreground group-hover:text-foreground transition-colors">
              Quick Terminal
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
              Open a clean shell in home directory
            </p>
          </div>
        </button>

        {/* 3. New Team Workspace Card (Advanced Modal Setup) */}
        <button
          type="button"
          onClick={() => handleNewTeamWorkspace()}
          className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-foreground/30 hover:bg-muted/30 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-mono text-[10px] text-muted-foreground group-hover:text-foreground">
              ⌘N
            </span>
          </div>
          <div className="mt-3.5">
            <h2 className="text-xs font-bold text-foreground group-hover:text-foreground transition-colors">
              Team Workspace…
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
              Configure multi-agent team and worktrees
            </p>
          </div>
        </button>
      </div>

      {/* RECENT WORKSPACES SECTION */}
      <div className="mt-7">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Workspaces
          </span>
          {recents.length > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {recents.length} {recents.length === 1 ? 'project' : 'projects'}
            </span>
          )}
        </div>

        {recents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 p-7 text-center text-xs text-muted-foreground">
            <Sparkles className="mx-auto mb-1.5 h-4 w-4 opacity-40" />
            No recent workspaces yet. Open a project folder to get started.
          </div>
        ) : (
          <div className="max-h-[240px] space-y-1 overflow-y-auto pr-1">
            {recents.map((path) => (
              <div
                key={path}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectRecentDirectly(path)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectRecentDirectly(path)
                  }
                }}
                className="group flex cursor-pointer items-center justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-2 transition-all hover:border-border hover:bg-accent/50"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <FolderGit2 className="h-4 w-4 text-foreground/80 shrink-0" />
                  <div className="min-w-0">
                    <span className="block truncate text-xs font-medium text-foreground group-hover:text-foreground transition-colors">
                      {folderName(path)}
                    </span>
                    <span className="block truncate font-mono text-[10px] text-muted-foreground">
                      {path}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    title="Configure Team Workspace"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNewTeamWorkspace(path)
                    }}
                    className="rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-background hover:text-foreground transition-all"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title={`Remove ${folderName(path)} from recents`}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeRecentFolder(path)
                    }}
                    className="rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-background hover:text-destructive transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEW TEAM WORKSPACE MODAL */}
      <NewWorkspaceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialFolder={targetFolder}
      />
    </div>
  )
}
