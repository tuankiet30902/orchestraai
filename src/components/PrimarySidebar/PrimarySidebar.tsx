// src/components/PrimarySidebar/PrimarySidebar.tsx
import { useRef, useState, type ReactElement } from 'react'
import {
  Layers,
  FolderTree,
  GitBranch,
  MessagesSquare,
  Plus,
  PanelLeftClose,
  RotateCw
} from 'lucide-react'
import { useActivityBarStore, type ActivityTab } from '@/store/activity-bar-store'
import { useGitStore } from '@/store/git-store'
import { Navbar } from '@/components/Navbar/Navbar'
import { FilesPanel } from '@/components/Files/FilesPanel'
import { GitPanel } from '@/components/Git/GitPanel'
import { OrchestraPitPanel } from '@/components/OrchestraPit/OrchestraPitPanel'
import { cn } from '@/lib/utils'

const PANEL_CONFIG: Record<ActivityTab, { title: string; icon: typeof Layers }> = {
  explorer: { title: 'Workspaces & Agents', icon: Layers },
  files: { title: 'Project Files', icon: FolderTree },
  git: { title: 'Source Control & Worktrees', icon: GitBranch },
  pit: { title: 'Orchestra Pit', icon: MessagesSquare }
}

export function PrimarySidebar({ onNewWorkspace }: { onNewWorkspace: () => void }): ReactElement | null {
  const activeTab = useActivityBarStore((s) => s.activeTab)
  const sidebarOpen = useActivityBarStore((s) => s.sidebarOpen)
  const toggleSidebar = useActivityBarStore((s) => s.toggleSidebar)
  const sidebarWidth = useActivityBarStore((s) => s.sidebarWidth)
  const setSidebarWidth = useActivityBarStore((s) => s.setSidebarWidth)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const refreshGit = useGitStore((s) => s.refresh)

  if (!sidebarOpen) return null

  const config = PANEL_CONFIG[activeTab]
  const Icon = config.icon

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setIsResizing(true)
    const startX = e.clientX
    const startWidth = sidebarWidth

    const onPointerMove = (moveEvent: PointerEvent): void => {
      const delta = moveEvent.clientX - startX
      setSidebarWidth(startWidth + delta)
    }

    const onPointerUp = (): void => {
      setIsResizing(false)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  return (
    <div
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}px` }}
      className="relative flex h-full flex-col border-r border-border bg-card select-none shrink-0 overflow-hidden"
    >
      {/* Sidebar Header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-muted/20 px-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-semibold text-foreground tracking-tight truncate">
            {config.title}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {activeTab === 'explorer' && (
            <button
              type="button"
              onClick={onNewWorkspace}
              title="New Workspace"
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}

          {activeTab === 'git' && (
            <button
              type="button"
              onClick={refreshGit}
              title="Refresh Git status"
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={toggleSidebar}
            title="Collapse Sidebar (⌘B)"
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Sidebar Content Panel */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === 'explorer' && <Navbar onNewWorkspace={onNewWorkspace} embedded={true} />}
        {activeTab === 'files' && <FilesPanel />}
        {activeTab === 'git' && <GitPanel />}
        {activeTab === 'pit' && <OrchestraPitPanel />}
      </div>

      {/* Resize handle on the right edge */}
      <div
        role="separator"
        aria-orientation="vertical"
        onPointerDown={handlePointerDown}
        onDoubleClick={() => setSidebarWidth(260)}
        title="Drag to resize sidebar (double click to reset)"
        className="group absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize z-30 flex items-center justify-end"
      >
        <div
          className={cn(
            'h-full w-[1px] transition-colors duration-150',
            isResizing ? 'bg-foreground' : 'group-hover:bg-foreground/50'
          )}
        />
      </div>
    </div>
  )
}
