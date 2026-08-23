// src/components/TitleBar/TitleBar.tsx
import { useEffect, useState, type ReactElement } from 'react'
import {
  Activity,
  Archive,
  Minus,
  PanelLeft,
  PanelRight,
  Radio,
  Settings,
  Square,
  Copy,
  X,
  Search
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import { useActivityBarStore } from '@/store/activity-bar-store'
import { useGitStore } from '@/store/git-store'
import { minimize, toggleMaximize, closeWindow, onMaximizedChanged } from '@/tauri/window'
import { isMacPlatform } from '@/lib/platform'
import { needsTrafficLightInset } from '@/lib/titlebar-chrome'
import { HeaderRecentSearch } from './HeaderRecentSearch'
import { SnapshotManagerModal } from '@/components/Snapshot/SnapshotManagerModal'
import { MissionControlModal } from '@/components/MissionControl/MissionControlModal'

const isMac = isMacPlatform()
const navbarHint = isMac ? '⌘B' : 'Ctrl+B'
const broadcastHint = isMac ? '⇧⌘B' : 'Ctrl+Shift+B'

interface TitleBarProps {
  fullscreen: boolean
  settingsOpen?: boolean
  onToggleSettings?: () => void
}

export function TitleBar({ fullscreen, settingsOpen, onToggleSettings }: TitleBarProps): ReactElement {
  const [isMaximized, setIsMaximized] = useState(false)
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false)
  const [missionControlOpen, setMissionControlOpen] = useState(false)

  const sidebarOpen = useActivityBarStore((s) => s.sidebarOpen)
  const toggleSidebar = useActivityBarStore((s) => s.toggleSidebar)

  const rightPanelOpen = useGitStore((s) => s.panelOpen)
  const toggleRightPanel = useGitStore((s) => s.togglePanel)

  const activeWorkspace = useAppStore((s) => s.workspaces.find((w) => w.id === s.activeWorkspaceId))
  const activeWorkspaceName = activeWorkspace?.name

  const onHome = useAppStore((s) => s.welcomeFocused || s.workspaces.length === 0)
  const broadcastActive = activeWorkspace?.broadcastActive ?? false
  const toggleBroadcast = useAppStore((s) => s.toggleBroadcast)

  useEffect(() => {
    if (isMac) return
    let unlisten: (() => void) | undefined
    onMaximizedChanged(setIsMaximized).then((un) => (unlisten = un))
    return () => unlisten?.()
  }, [])

  return (
    <header
      data-tauri-drag-region
      data-focus-return
      className={cn(
        'flex h-10 shrink-0 items-center justify-between border-b border-border bg-card px-2 select-none z-40',
        needsTrafficLightInset(isMac, fullscreen) && 'pl-20'
      )}
    >
      {/* Left: Brand & Sidebar Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          data-tauri-drag-region="false"
          aria-label={sidebarOpen ? `Hide sidebar (${navbarHint})` : `Show sidebar (${navbarHint})`}
          title={`Toggle Primary Sidebar (${navbarHint})`}
          onClick={toggleSidebar}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
            sidebarOpen
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 pl-1">
          <Logo className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline text-xs font-bold text-foreground tracking-tight">
            OrchestraAI
          </span>
        </div>
      </div>

      {/* Center: Command Center & Quick Search Bar (Cursor/VSCode Studio style) */}
      <div
        data-tauri-drag-region
        className="flex min-w-0 flex-1 items-center justify-center px-4"
      >
        {onHome ? (
          <HeaderRecentSearch />
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-7 max-w-[340px] min-w-0 items-center gap-2 rounded-md border border-border bg-background/90 px-3 text-xs text-muted-foreground shadow-2xs hover:border-foreground/30 hover:text-foreground transition-all cursor-default">
              <Search className="h-3.5 w-3.5 shrink-0 opacity-60" />
              <span className="truncate font-medium text-foreground">
                {activeWorkspaceName ?? 'Orchestra Workspace'}
              </span>
              <kbd className="hidden md:inline-flex items-center rounded border border-border bg-muted/60 px-1.5 font-mono text-[9px] text-muted-foreground font-semibold">
                ⌘K
              </kbd>
            </div>
          </div>
        )}
      </div>

      {/* Right: Studio Layout Controls & Actions */}
      <div className="flex h-full items-center gap-1 shrink-0">
        {/* Layout Triad Controls */}
        <div className="flex items-center rounded-md border border-border bg-background/80 p-0.5 gap-0.5">
          {/* Multi-terminal Broadcast */}
          {!onHome && (
            <button
              type="button"
              data-tauri-drag-region="false"
              aria-label={`Toggle broadcast input (${broadcastHint})`}
              aria-pressed={broadcastActive}
              title={`Broadcast Input to Terminals (${broadcastHint})`}
              onClick={toggleBroadcast}
              className={cn(
                'flex h-6.5 w-6.5 items-center justify-center rounded transition-colors',
                broadcastActive
                  ? 'bg-foreground text-background shadow-xs font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Radio className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Auxiliary Right Panel Toggle */}
          {!onHome && (
            <button
              type="button"
              data-tauri-drag-region="false"
              aria-label="Toggle auxiliary right sidebar"
              aria-pressed={rightPanelOpen}
              title="Toggle Right Preview / Git Panel"
              onClick={toggleRightPanel}
              className={cn(
                'flex h-6.5 w-6.5 items-center justify-center rounded transition-colors',
                rightPanelOpen
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <PanelRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Mission Control Timeline Modal */}
        <button
          type="button"
          data-tauri-drag-region="false"
          aria-label="Mission Control Activity Timeline"
          title="Mission Control & Activity Timeline"
          onClick={() => setMissionControlOpen(true)}
          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <Activity className="h-4 w-4" />
        </button>

        {/* Snapshots / Checkpoints Modal */}
        <button
          type="button"
          data-tauri-drag-region="false"
          aria-label="Workspace Snapshots"
          title="Workspace Snapshots & Presets"
          onClick={() => setSnapshotModalOpen(true)}
          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <Archive className="h-4 w-4" />
        </button>

        {/* Settings Button */}
        {onToggleSettings && (
          <button
            type="button"
            data-tauri-drag-region="false"
            aria-label="Settings"
            aria-pressed={settingsOpen}
            title="Settings (⌘,)"
            onClick={onToggleSettings}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted',
              settingsOpen ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Settings className="h-4 w-4" />
          </button>
        )}

        {/* Window controls on non-macOS */}
        {!isMac && (
          <div className="flex items-center pl-1 border-l border-border ml-1">
            <button
              type="button"
              onClick={minimize}
              title="Minimize"
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleMaximize}
              title={isMaximized ? 'Restore' : 'Maximize'}
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              {isMaximized ? <Copy className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={closeWindow}
              title="Close"
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-destructive hover:text-destructive-foreground text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <SnapshotManagerModal
        open={snapshotModalOpen}
        onClose={() => setSnapshotModalOpen(false)}
      />

      <MissionControlModal
        open={missionControlOpen}
        onClose={() => setMissionControlOpen(false)}
      />
    </header>
  )
}
