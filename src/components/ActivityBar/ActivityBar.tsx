// src/components/ActivityBar/ActivityBar.tsx
import { type ReactElement } from 'react'
import {
  Layers,
  FolderTree,
  GitBranch,
  MessagesSquare,
  Activity,
  Bookmark,
  Settings
} from 'lucide-react'
import { useActivityBarStore, type ActivityTab } from '@/store/activity-bar-store'
import { useGitStore } from '@/store/git-store'
import { cn } from '@/lib/utils'

interface ActivityBarProps {
  onOpenMissionControl: () => void
  onOpenSnapshots: () => void
  onOpenSettings: () => void
}

interface ActivityItem {
  id: ActivityTab
  label: string
  shortcut: string
  icon: typeof Layers
  badge?: number
}

export function ActivityBar({
  onOpenMissionControl,
  onOpenSnapshots,
  onOpenSettings
}: ActivityBarProps): ReactElement {
  const activeTab = useActivityBarStore((s) => s.activeTab)
  const sidebarOpen = useActivityBarStore((s) => s.sidebarOpen)
  const toggleTab = useActivityBarStore((s) => s.toggleTab)
  const changedFiles = useGitStore((s) => s.changedFiles.length)

  const items: ActivityItem[] = [
    {
      id: 'explorer',
      label: 'Workspaces & Explorer',
      shortcut: '⌘⇧E',
      icon: Layers
    },
    {
      id: 'files',
      label: 'Project Files',
      shortcut: '⌘⇧F',
      icon: FolderTree
    },
    {
      id: 'git',
      label: 'Source Control & Worktrees',
      shortcut: '⌘⇧G',
      icon: GitBranch,
      badge: changedFiles > 0 ? changedFiles : undefined
    },
    {
      id: 'pit',
      label: 'Orchestra Pit (Team Chat)',
      shortcut: '⌘⇧P',
      icon: MessagesSquare
    }
  ]

  return (
    <aside
      aria-label="Activity Bar"
      className="flex h-full w-12 flex-col items-center justify-between border-r border-border bg-canvas py-2 select-none shrink-0 z-30"
    >
      {/* Top Primary Navigation Items */}
      <div className="flex w-full flex-col items-center gap-1.5">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = sidebarOpen && activeTab === item.id

          return (
            <button
              key={item.id}
              type="button"
              title={`${item.label} (${item.shortcut})`}
              aria-label={item.label}
              aria-pressed={isActive}
              onClick={() => toggleTab(item.id)}
              className={cn(
                'group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              )}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute -left-1 top-2 bottom-2 w-0.75 rounded-r bg-foreground" />
              )}

              <Icon className="h-5 w-5 transition-transform group-hover:scale-105" />

              {/* Badge Counter */}
              {item.badge !== undefined && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 font-mono text-[9px] font-bold text-background">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Bottom Utility Items */}
      <div className="flex w-full flex-col items-center gap-1.5 pt-2 border-t border-border/40">
        {/* Mission Control Timeline */}
        <button
          type="button"
          title="Mission Control & Activity Timeline"
          aria-label="Mission Control"
          onClick={onOpenMissionControl}
          className="group relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
        >
          <Activity className="h-5 w-5 transition-transform group-hover:scale-105" />
        </button>

        {/* Snapshots & Presets */}
        <button
          type="button"
          title="Workspace Snapshots & Presets"
          aria-label="Snapshots"
          onClick={onOpenSnapshots}
          className="group relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
        >
          <Bookmark className="h-5 w-5 transition-transform group-hover:scale-105" />
        </button>

        {/* Settings */}
        <button
          type="button"
          title="Settings (⌘,)"
          aria-label="Settings"
          onClick={onOpenSettings}
          className="group relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
        >
          <Settings className="h-5 w-5 transition-transform group-hover:scale-105" />
        </button>
      </div>
    </aside>
  )
}
