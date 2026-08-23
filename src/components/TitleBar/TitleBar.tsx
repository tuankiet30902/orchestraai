import { useEffect, useState, type ReactElement, type ReactNode } from 'react'
import {
  Activity,
  Bookmark,
  Copy,
  Minus,
  PanelLeftOpen,
  PanelRightOpen,
  Radio,
  Settings,
  Square,
  X
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import { useNavbarVisibilityStore } from '@/store/navbar-visibility-store'
import { useGitStore } from '@/store/git-store'
import { minimize, toggleMaximize, closeWindow, onMaximizedChanged } from '@/tauri/window'
import { isMacPlatform } from '@/lib/platform'
import { needsTrafficLightInset } from '@/lib/titlebar-chrome'
import { HeaderRecentSearch } from './HeaderRecentSearch'
import { SnapshotManagerModal } from '@/components/Snapshot/SnapshotManagerModal'
import { MissionControlModal } from '@/components/MissionControl/MissionControlModal'

// On macOS the OS draws native traffic lights over this header (titleBarStyle
// Overlay — see tauri.macos.conf.json): hide the custom window buttons and
// inset the left cluster so it clears the lights. Platform never changes at
// runtime, so a module-level constant is fine — but full screen does change at
// runtime, and it takes the lights away with it (see lib/titlebar-chrome.ts).
const isMac = isMacPlatform()
// Tooltip hints must match the platform binding (mac convention: ⇧ before ⌘).
const navbarHint = isMac ? '⌘B' : 'Ctrl+B'
const broadcastHint = isMac ? '⇧⌘B' : 'Ctrl+Shift+B'

interface TitleBarProps {
  /** Native full screen, owned by App — it drives the system-chrome dodge too. */
  fullscreen: boolean
  /** Whether the Settings modal is open. */
  settingsOpen?: boolean
  /** Toggle settings modal open/closed. */
  onToggleSettings?: () => void
}

/**
 * Custom window title bar for the frameless window. Left cluster:
 * [sidebar toggle] [app icon] [app name]. Centre: a read-only pill showing the
 * active workspace's name. Right: Settings, Preview, Broadcast, and window controls.
 */
export function TitleBar({ fullscreen, settingsOpen, onToggleSettings }: TitleBarProps): ReactElement {
  const [isMaximized, setIsMaximized] = useState(false)
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false)
  const [missionControlOpen, setMissionControlOpen] = useState(false)
  const visible = useNavbarVisibilityStore((s) => s.visible)
  const toggleNavbar = useNavbarVisibilityStore((s) => s.toggle)
  const rightPanelOpen = useGitStore((s) => s.panelOpen)
  const toggleRightPanel = useGitStore((s) => s.togglePanel)
  const activeWorkspaceName = useAppStore((s) => {
    const active = s.workspaces.find((w) => w.id === s.activeWorkspaceId)
    return active?.name
  })
  // Home view = Welcome focused, or no workspaces yet (matches App's showWelcome).
  const onHome = useAppStore((s) => s.welcomeFocused || s.workspaces.length === 0)
  const broadcastActive = useAppStore((s) => {
    const active = s.workspaces.find((w) => w.id === s.activeWorkspaceId)
    return active?.broadcastActive ?? false
  })
  const toggleBroadcast = useAppStore((s) => s.toggleBroadcast)

  useEffect(() => {
    if (isMac) return // maximize icon swap only exists on the custom buttons
    let unlisten: (() => void) | undefined
    onMaximizedChanged(setIsMaximized).then((un) => (unlisten = un))
    return () => unlisten?.()
  }, [])

  return (
    <div
      data-tauri-drag-region
      // Toggling a panel here must not strand the keyboard on the button that
      // was clicked — App.tsx hands it back (lib/terminal-focus.ts). The recents
      // search input is exempt automatically: it holds focus legitimately.
      data-focus-return
      className={cn(
        'flex h-9 shrink-0 items-center justify-between border-b border-border bg-card pl-1.5',
        needsTrafficLightInset(isMac, fullscreen) && 'pl-20'
      )}
    >
      <div className="flex items-center gap-2 pl-1 shrink-0">
        <Logo className="h-5 w-5 shrink-0" />
        <span className="hidden sm:inline text-xs font-semibold text-foreground tracking-tight">OrchestraAI</span>
      </div>

      <div
        data-tauri-drag-region
        className="flex min-w-0 flex-1 items-center justify-center px-2 overflow-hidden"
      >
        {onHome ? (
          <HeaderRecentSearch />
        ) : (
          activeWorkspaceName !== undefined && (
            <div className="inline-flex h-[22px] max-w-[320px] min-w-0 items-center rounded border border-border/80 bg-muted/60 px-3 text-xs text-foreground/80 font-medium overflow-hidden">
              <span className="truncate">{activeWorkspaceName}</span>
            </div>
          )
        )}
      </div>

      <div className="flex h-full items-center gap-1.5 pr-1.5 shrink-0">
        {/* UNIFIED LAYOUT TRIAD CONTROLS (Monochrome & Sized) */}
        <div className="flex items-center rounded-md border border-border bg-background/80 p-0.5 gap-0.5">
          {/* Toggle Primary Sidebar (Workspaces Tree) */}
          <button
            type="button"
            data-tauri-drag-region="false"
            aria-label={visible ? `Hide sidebar (${navbarHint})` : `Show sidebar (${navbarHint})`}
            aria-pressed={visible}
            title={`Toggle Left Sidebar (${navbarHint})`}
            onClick={toggleNavbar}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded transition-colors',
              visible
                ? 'bg-accent text-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>

          {/* Toggle Multi-Terminal Broadcast (Conduct Mode) */}
          {!onHome && (
            <button
              type="button"
              data-tauri-drag-region="false"
              aria-label={`Toggle broadcast input (${broadcastHint})`}
              aria-pressed={broadcastActive}
              title={`Broadcast Input to Terminals (${broadcastHint})`}
              onClick={toggleBroadcast}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded transition-colors',
                broadcastActive
                  ? 'bg-accent text-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Radio className="h-4 w-4" />
            </button>
          )}

          {/* Toggle Auxiliary Sidebar (Files / Git / Team Pit) */}
          {!onHome && (
            <button
              type="button"
              data-tauri-drag-region="false"
              aria-label="Toggle auxiliary right sidebar"
              aria-pressed={rightPanelOpen}
              title="Toggle Right Sidebar (Files / Git / Team Pit)"
              onClick={toggleRightPanel}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded transition-colors',
                rightPanelOpen
                  ? 'bg-accent text-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <PanelRightOpen className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Mission Control Timeline Toggle */}
        <button
          type="button"
          data-tauri-drag-region="false"
          aria-label="Mission Control Activity Timeline"
          title="Mission Control & Activity Timeline"
          onClick={() => setMissionControlOpen(true)}
          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-accent text-muted-foreground hover:text-foreground"
        >
          <Activity className="h-4 w-4" />
        </button>

        {/* Snapshots / Checkpoints Toggle */}
        <button
          type="button"
          data-tauri-drag-region="false"
          aria-label="Workspace Snapshots"
          title="Workspace Snapshots & Presets"
          onClick={() => setSnapshotModalOpen(true)}
          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-accent text-muted-foreground hover:text-foreground"
        >
          <Bookmark className="h-4 w-4" />
        </button>

        {/* Settings Toggle */}
        {onToggleSettings && (
          <button
            type="button"
            data-tauri-drag-region="false"
            aria-label="Settings"
            aria-pressed={settingsOpen}
            title="Settings (⌘,)"
            onClick={onToggleSettings}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-accent',
              settingsOpen ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Settings className="h-4 w-4" />
          </button>
        )}

        <SnapshotManagerModal
          open={snapshotModalOpen}
          onClose={() => setSnapshotModalOpen(false)}
        />

        <MissionControlModal
          open={missionControlOpen}
          onClose={() => setMissionControlOpen(false)}
        />
        {!isMac && (
          <>
            <TitleBarButton label="Minimize" onClick={() => minimize()}>
              <Minus className="h-4 w-4" />
            </TitleBarButton>
            <TitleBarButton
              label={isMaximized ? 'Restore' : 'Maximize'}
              onClick={() => toggleMaximize()}
            >
              {isMaximized ? <Copy className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
            </TitleBarButton>
            <TitleBarButton
              label="Close"
              onClick={() => closeWindow()}
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-4 w-4" />
            </TitleBarButton>
          </>
        )}
      </div>
    </div>
  )
}

interface TitleBarButtonProps {
  label: string
  onClick: () => void
  className?: string
  children: ReactNode
}

/** A single window-control button: full-height, fixed width, hover-highlighted. */
function TitleBarButton({
  label,
  onClick,
  className,
  children
}: TitleBarButtonProps): ReactElement {
  return (
    <button
      type="button"
      data-tauri-drag-region="false"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  )
}
