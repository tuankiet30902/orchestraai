// src/components/PrimarySidebar/PrimarySidebar.tsx
import { useRef, useState, type ReactElement } from 'react'
import {
  LayoutGrid,
  FolderTree,
  GitGraph,
  Sparkles,
  Plus,
  RotateCw
} from 'lucide-react'
import { useActivityBarStore, type ActivityTab } from '@/store/activity-bar-store'
import { useGitStore } from '@/store/git-store'
import { Navbar } from '@/components/Navbar/Navbar'
import { FilesPanel } from '@/components/Files/FilesPanel'
import { GitPanel } from '@/components/Git/GitPanel'
import { OrchestraPitPanel } from '@/components/OrchestraPit/OrchestraPitPanel'
import { cn } from '@/lib/utils'

const PANEL_CONFIG: Record<ActivityTab, { title: string; icon: typeof LayoutGrid }> = {
  explorer: { title: 'Workspaces & Agents', icon: LayoutGrid },
  files: { title: 'Project Files', icon: FolderTree },
  git: { title: 'Source Control & Worktrees', icon: GitGraph },
  pit: { title: 'Orchestra Pit', icon: Sparkles }
}

export function PrimarySidebar({ onNewWorkspace }: { onNewWorkspace: () => void }): ReactElement | null {
  const activeTab = useActivityBarStore((s) => s.activeTab)
  const sidebarOpen = useActivityBarStore((s) => s.sidebarOpen)
  const setSidebarOpen = useActivityBarStore((s) => s.setSidebarOpen)
  const sidebarWidth = useActivityBarStore((s) => s.sidebarWidth)
  const setSidebarWidth = useActivityBarStore((s) => s.setSidebarWidth)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const refreshGit = useGitStore((s) => s.refresh)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setIsResizing(true)
    const startX = e.clientX
    const startWidth = sidebarOpen ? sidebarWidth : 0

    const onPointerMove = (moveEvent: PointerEvent): void => {
      const delta = moveEvent.clientX - startX
      const targetWidth = startWidth + delta
      if (targetWidth < 120) {
        setSidebarOpen(false)
      } else {
        setSidebarWidth(Math.min(Math.max(targetWidth, 180), 550))
      }
    }

    const onPointerUp = (): void => {
      setIsResizing(false)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  // When closed, render a draggable edge strip to drag-open
  if (!sidebarOpen) {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        onPointerDown={handlePointerDown}
        onDoubleClick={() => setSidebarOpen(true)}
        title="Drag right to open sidebar (or double-click to open)"
        className="group relative h-full w-1 cursor-col-resize select-none shrink-0 z-30 hover:bg-foreground/30 transition-colors"
      >
        <div className="h-full w-[1px] bg-border" />
      </div>
    )
  }

  const config = PANEL_CONFIG[activeTab]
  const Icon = config.icon

  return (
    <div
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}px` }}
      className="relative flex h-full min-w-[180px] max-w-[550px] flex-col border-r border-border bg-card select-none shrink-0 overflow-hidden"
    >
      {/* Sidebar Header (No close button: drag edge or double-click to close) */}
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-border bg-muted/20 px-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-[11px] font-semibold text-foreground tracking-tight truncate">
            {config.title}
          </span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {activeTab === 'explorer' && (
            <button
              type="button"
              onClick={onNewWorkspace}
              title="New Workspace"
              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}

          {activeTab === 'git' && (
            <button
              type="button"
              onClick={refreshGit}
              title="Refresh Git status"
              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <RotateCw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Sidebar Content Panel */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === 'explorer' && <Navbar onNewWorkspace={onNewWorkspace} embedded={true} />}
        {activeTab === 'files' && <FilesPanel />}
        {activeTab === 'git' && <GitPanel />}
        {activeTab === 'pit' && <OrchestraPitPanel />}
      </div>

      {/* Resize handle on the right edge: Drag left to collapse, double-click to toggle */}
      <div
        role="separator"
        aria-orientation="vertical"
        onPointerDown={handlePointerDown}
        onDoubleClick={() => setSidebarOpen(false)}
        title="Drag to resize / drag left to close (double-click to close)"
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
