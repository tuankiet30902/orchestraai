// src/components/StatusBar/StatusBar.tsx
import { type ReactElement } from 'react'
import {
  GitBranch,
  Terminal,
  Activity,
  Search,
  Radio,
  RotateCcw
} from 'lucide-react'
import { useAppStore, selectActiveWorkspace } from '@/store/app-store'
import { useActivityBarStore } from '@/store/activity-bar-store'
import { useOrchestraPitStore } from '@/store/orchestra-pit-store'
import { useAppearanceStore } from '@/store/appearance-store'
import { useCommandPaletteStore } from '@/store/command-palette-store'
import { SessionTokenSummary } from '@/components/TokenBar/TokenBar'
import { collectLeaves } from '@/lib/layout-tree'

export function StatusBar({
  onOpenMissionControl
}: {
  onOpenMissionControl: () => void
}): ReactElement {
  const activeWorkspace = useAppStore(selectActiveWorkspace)
  const isBroadcastActive = activeWorkspace?.broadcastActive ?? false
  const activeLeaves = activeWorkspace ? collectLeaves(activeWorkspace.layout) : []
  const agentCount = activeLeaves.length

  const setActiveTab = useActivityBarStore((s) => s.setActiveTab)
  const setSidebarOpen = useActivityBarStore((s) => s.setSidebarOpen)

  const activeRoomId = useOrchestraPitStore((s) => s.activeRoomId)
  const activeRoom = useOrchestraPitStore((s) =>
    s.rooms.find((r) => r.roomId === activeRoomId)
  )

  const zoom = useAppearanceStore((s) => s.zoom)
  const resetZoom = useAppearanceStore((s) => s.resetZoom)
  const openCommandPalette = useCommandPaletteStore((s) => s.open)

  const isDefaultZoom = Math.abs(zoom - 1.0) < 0.01

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-border bg-card/95 px-3 text-[11px] font-sans text-muted-foreground select-none z-30 backdrop-blur-xs">
      {/* Left items */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Orchestra Status & Agent Count */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('explorer')
            setSidebarOpen(true)
          }}
          className="flex items-center gap-1.5 hover:text-foreground transition-colors truncate cursor-pointer"
          title="Active Workspace & Live Terminals"
        >
          <Terminal className="h-3 w-3 text-amber-500 shrink-0" />
          <span className="font-medium text-foreground truncate">
            {activeWorkspace?.name ?? 'No Workspace'}
          </span>
          {agentCount > 0 && (
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {agentCount} {agentCount === 1 ? 'pane' : 'panes'}
            </span>
          )}
        </button>

        {/* Conduct Mode Indicator */}
        {isBroadcastActive && (
          <div className="flex items-center gap-1 text-amber-500 font-semibold animate-pulse">
            <Radio className="h-3 w-3" />
            <span className="text-[10px] uppercase tracking-wider">Conduct Mode</span>
          </div>
        )}

        {/* Git Worktrees */}
        {activeWorkspace?.worktreeMode && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('git')
              setSidebarOpen(true)
            }}
            className="flex items-center gap-1 hover:text-foreground transition-colors font-mono text-[10px] cursor-pointer"
            title="Git Worktree Isolation Active"
          >
            <GitBranch className="h-3 w-3 text-muted-foreground" />
            <span>worktrees</span>
          </button>
        )}

        {/* Orchestra Pit Status */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('pit')
            setSidebarOpen(true)
          }}
          className="hidden sm:flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
          title="Orchestra Pit MCP Collaboration"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
          <span className="text-[10px]">
            Pit: {activeRoom?.name ?? 'General'}
          </span>
        </button>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Token Tracker Summary */}
        <div className="hidden md:flex items-center">
          <SessionTokenSummary />
        </div>

        {/* UI Zoom Indicator */}
        {!isDefaultZoom && (
          <button
            type="button"
            onClick={resetZoom}
            className="flex items-center gap-1 text-amber-500 hover:text-amber-400 transition-colors font-mono text-[10px] cursor-pointer font-medium"
            title="Click to reset zoom to 100%"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            <span>{Math.round(zoom * 100)}%</span>
          </button>
        )}

        {/* Mission Control Timeline */}
        <button
          type="button"
          onClick={onOpenMissionControl}
          className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
          title="Open Mission Control Timeline"
        >
          <Activity className="h-3 w-3 text-muted-foreground" />
          <span className="hidden lg:inline text-[10px]">Timeline</span>
        </button>

        {/* Command Palette Trigger */}
        <button
          type="button"
          onClick={() => openCommandPalette()}
          className="flex items-center gap-1 rounded bg-muted hover:bg-muted/80 px-1.5 py-0.5 text-[10px] text-foreground font-mono transition-colors border border-border cursor-pointer"
          title="Command Palette (⌘K / ⌘P)"
        >
          <Search className="h-2.5 w-2.5 text-muted-foreground" />
          <span>⌘K</span>
        </button>
      </div>
    </footer>
  )
}
