// src/components/ActivityBar/ActivityBar.tsx
import { type ReactElement } from 'react'
import {
  LayoutGrid,
  FolderTree,
  GitGraph,
  Sparkles,
  Activity,
  Archive,
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
  icon: typeof LayoutGrid
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
      icon: LayoutGrid
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
      icon: GitGraph,
      badge: changedFiles > 0 ? changedFiles : undefined
    },
    {
      id: 'pit',
      label: 'Orchestra Pit (Team Collaboration)',
      shortcut: '⌘⇧P',
      icon: Sparkles
    }
  ]

  return (
    <aside
      aria-label="Activity Bar"
      className="flex h-full w-12 flex-col items-center justify-between border-r border-border bg-canvas py-3 select-none shrink-0 z-30"
    >
      {/* Top Primary Navigation Items */}
      <div className="flex w-full flex-col items-center gap-2">
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
                'group relative flex h-9 w-9 items-center justify-center rounded-xl transition-all cursor-pointer',
                isActive
                  ? 'bg-primary/15 text-primary shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon className={cn('h-5 w-5 transition-transform group-hover:scale-105', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />

              {/* Counter Badge */}
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold font-mono text-primary-foreground shadow-2xs">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Bottom Modals & Settings Launcher Items */}
      <div className="flex w-full flex-col items-center gap-2">
        {/* Mission Control Timeline */}
        <button
          type="button"
          title="Mission Control & Activity Timeline"
          aria-label="Mission Control"
          onClick={onOpenMissionControl}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer"
        >
          <Activity className="h-5 w-5" />
        </button>

        {/* Snapshots / Checkpoints */}
        <button
          type="button"
          title="Workspace Snapshots & Presets"
          aria-label="Snapshots"
          onClick={onOpenSnapshots}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer"
        >
          <Archive className="h-5 w-5" />
        </button>

        {/* Settings & Preferences */}
        <button
          type="button"
          title="Settings & Preferences (⌘,)"
          aria-label="Settings"
          onClick={onOpenSettings}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </aside>
  )
}
