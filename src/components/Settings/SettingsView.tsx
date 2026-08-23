import { useEffect, useState, type ReactElement } from 'react'
import {
  Bell,
  Bot,
  GitBranch,
  Keyboard,
  MessagesSquare,
  Palette,
  Sliders,
  Terminal,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GeneralPanel } from './GeneralPanel'
import { AgentsPanel } from './AgentsPanel'
import { GitConfigPanel } from './GitConfigPanel'
import { OrchestraPitConfigPanel } from './OrchestraPitConfigPanel'
import { AppearancePanel } from './AppearancePanel'
import { TerminalPanel } from './TerminalPanel'
import { NotificationsPanel } from './NotificationsPanel'
import { KeyboardShortcutsPanel } from './KeyboardShortcutsPanel'

export type CategoryId =
  | 'general'
  | 'agents'
  | 'git'
  | 'orchestrapit'
  | 'appearance'
  | 'terminal'
  | 'notifications'
  | 'shortcuts'

interface Category {
  id: CategoryId
  label: string
  Icon: typeof Sliders
}

const CATEGORIES: Category[] = [
  { id: 'general', label: 'General', Icon: Sliders },
  { id: 'agents', label: 'AI Agents', Icon: Bot },
  { id: 'git', label: 'Git & Worktrees', Icon: GitBranch },
  { id: 'orchestrapit', label: 'Team Pit', Icon: MessagesSquare },
  { id: 'appearance', label: 'Appearance', Icon: Palette },
  { id: 'terminal', label: 'Terminal', Icon: Terminal },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', Icon: Keyboard },
]

interface SettingsViewProps {
  onClose: () => void
  initialCategory?: CategoryId
}

/**
 * Centered modal Settings dialog over a dimmed backdrop. A left nav rail picks
 * the active category; the right pane renders its panel.
 */
export function SettingsView({ onClose, initialCategory }: SettingsViewProps): ReactElement {
  const [activeCategory, setActiveCategory] = useState<CategoryId>(initialCategory ?? 'general')

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onMouseDown={(e) => e.stopPropagation()}
        className="flex h-[88vh] w-full max-w-6xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
      >
        {/* Settings Navigation Sidebar */}
        <nav className="flex w-60 shrink-0 flex-col border-r border-border bg-card/60">
          <div className="border-b border-border px-4 py-3.5">
            <h2 className="text-sm font-semibold text-foreground tracking-tight">Preferences</h2>
          </div>

          <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2.5">
            {CATEGORIES.map((cat) => {
              const active = cat.id === activeCategory
              const Icon = cat.Icon
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  aria-pressed={active}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-xs transition-colors',
                    active
                      ? 'bg-accent text-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-foreground' : 'text-muted-foreground')} />
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Settings Content Area */}
        <div className="relative flex min-w-0 flex-1 flex-col bg-canvas">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            title="Close (Esc)"
            className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-8 py-8">
              {activeCategory === 'general' && <GeneralPanel />}
              {activeCategory === 'agents' && <AgentsPanel />}
              {activeCategory === 'git' && <GitConfigPanel />}
              {activeCategory === 'orchestrapit' && <OrchestraPitConfigPanel />}
              {activeCategory === 'appearance' && <AppearancePanel />}
              {activeCategory === 'terminal' && <TerminalPanel />}
              {activeCategory === 'notifications' && <NotificationsPanel />}
              {activeCategory === 'shortcuts' && <KeyboardShortcutsPanel />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
