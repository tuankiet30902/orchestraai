// src/components/TitleBar/TitleBar.tsx
import { useEffect, useState, type ReactElement } from 'react'
import {
  Minus,
  PanelLeft,
  PanelRight,
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

const isMac = isMacPlatform()
const navbarHint = isMac ? '⌘B' : 'Ctrl+B'

interface TitleBarProps {
  fullscreen: boolean
  settingsOpen?: boolean
  onToggleSettings?: () => void
}

export function TitleBar({ fullscreen }: TitleBarProps): ReactElement {
  const [isMaximized, setIsMaximized] = useState(false)

  const sidebarOpen = useActivityBarStore((s) => s.sidebarOpen)
  const toggleSidebar = useActivityBarStore((s) => s.toggleSidebar)

  const rightPanelOpen = useGitStore((s) => s.panelOpen)
  const toggleRightPanel = useGitStore((s) => s.togglePanel)

  const activeWorkspace = useAppStore((s) => s.workspaces.find((w) => w.id === s.activeWorkspaceId))
  const activeWorkspaceName = activeWorkspace?.name

  const onHome = useAppStore((s) => s.welcomeFocused || s.workspaces.length === 0)

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
      {/* Left: Brand / Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2 pl-1">
          <Logo className="h-5 w-5 shrink-0 rounded-md" />
          <span className="hidden sm:inline text-xs font-bold text-foreground tracking-tight">
            OrchestraAI
          </span>
        </div>
      </div>

      {/* Center: Command Center & Quick Search Bar */}
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

      {/* Right: Sidebar & Panel Open/Close Toggle Icons */}
      <div className="flex h-full items-center gap-1 shrink-0">
        {/* Open/Close Toggle Control Group */}
        <div className="flex items-center rounded-md border border-border bg-background/80 p-0.5 gap-0.5">
          {/* Toggle Left Sidebar */}
          <button
            type="button"
            data-tauri-drag-region="false"
            aria-label={sidebarOpen ? `Hide sidebar (${navbarHint})` : `Show sidebar (${navbarHint})`}
            aria-pressed={sidebarOpen}
            title={`Toggle Left Sidebar (${navbarHint})`}
            onClick={toggleSidebar}
            className={cn(
              'flex h-6.5 w-6.5 items-center justify-center rounded transition-colors',
              sidebarOpen
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </button>

          {/* Toggle Right Panel */}
          {!onHome && (
            <button
              type="button"
              data-tauri-drag-region="false"
              aria-label="Toggle right panel"
              aria-pressed={rightPanelOpen}
              title="Toggle Right Panel"
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
    </header>
  )
}
