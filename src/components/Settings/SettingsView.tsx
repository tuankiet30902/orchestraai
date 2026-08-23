import { useEffect, useState, useMemo, type ReactElement } from 'react'
import {
  Bell,
  Bot,
  GitBranch,
  Keyboard,
  Palette,
  Search,
  Settings,
  Sparkles,
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
  | 'appearance'
  | 'terminal'
  | 'agents'
  | 'git'
  | 'orchestrapit'
  | 'notifications'
  | 'shortcuts'

interface Category {
  id: CategoryId
  label: string
  Icon: typeof Settings
  keywords: string[]
}

const CATEGORIES: Category[] = [
  { id: 'general', label: 'Cài đặt chung', Icon: Settings, keywords: ['startup', 'update', 'version', 'diagnostics'] },
  { id: 'appearance', label: 'Giao diện & Tỉ lệ', Icon: Palette, keywords: ['zoom', 'scale', 'theme', 'color', 'accent', 'sidebar', 'width', 'dark', 'light'] },
  { id: 'terminal', label: 'Dòng lệnh (Terminal)', Icon: Terminal, keywords: ['font', 'fontSize', 'shell', 'scrollback', 'cursor'] },
  { id: 'agents', label: 'Tác nhân AI (Agents)', Icon: Bot, keywords: ['claude', 'opencode', 'codex', 'cli', 'arguments', 'path'] },
  { id: 'git', label: 'Git & Worktrees', Icon: GitBranch, keywords: ['git', 'worktree', 'branch', 'prune', 'diff', 'commit'] },
  { id: 'orchestrapit', label: 'Orchestra Pit', Icon: Sparkles, keywords: ['room', 'chat', 'collaboration', 'broadcast', 'peers'] },
  { id: 'notifications', label: 'Thông báo', Icon: Bell, keywords: ['sound', 'alert', 'chime', 'toast'] },
  { id: 'shortcuts', label: 'Phím tắt', Icon: Keyboard, keywords: ['keybindings', 'hotkeys', 'shortcuts', 'cmd', 'ctrl'] }
]

interface SettingsViewProps {
  onClose: () => void
  initialCategory?: CategoryId
}

/**
 * Clean and simple Settings modal with Category Rail, Search Filter, and Setting Cards.
 */
export function SettingsView({ onClose, initialCategory }: SettingsViewProps): ReactElement {
  const [activeCategory, setActiveCategory] = useState<CategoryId>(initialCategory ?? 'general')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return CATEGORIES
    const query = searchQuery.toLowerCase().trim()
    return CATEGORIES.filter(
      (c) =>
        c.label.toLowerCase().includes(query) ||
        c.keywords.some((k) => k.toLowerCase().includes(query))
    )
  }, [searchQuery])

  // Auto-switch to matching category when searching
  useEffect(() => {
    if (searchQuery.trim() && filteredCategories.length > 0) {
      if (!filteredCategories.some((c) => c.id === activeCategory)) {
        setActiveCategory(filteredCategories[0].id)
      }
    }
  }, [searchQuery, filteredCategories, activeCategory])

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-xs font-sans select-none"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onMouseDown={(e) => e.stopPropagation()}
        className="flex h-[85vh] w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl flex-col"
      >
        {/* Top Settings Header */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-muted/30 px-4">
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm cài đặt (zoom, theme, git, font)…"
                className="w-full h-7 rounded-md border border-border bg-card pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden focus:ring-1 focus:ring-foreground font-sans"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            title="Đóng (Esc)"
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ml-4"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Settings Body: Left Navigation + Right Content Panel */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Settings Navigation Sidebar */}
          <nav className="flex w-52 shrink-0 flex-col border-r border-border bg-card/60">
            <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
              {filteredCategories.map((cat) => {
                const active = cat.id === activeCategory
                const Icon = cat.Icon
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    aria-pressed={active}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors',
                      active
                        ? 'bg-muted text-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    )}
                  >
                    <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-foreground' : 'text-muted-foreground')} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                )
              })}

              {filteredCategories.length === 0 && (
                <div className="py-6 text-center text-xs text-muted-foreground italic">
                  Không tìm thấy cài đặt phù hợp
                </div>
              )}
            </div>
          </nav>

          {/* Settings Content Area */}
          <div className="relative flex min-w-0 flex-1 flex-col bg-canvas overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl px-6 py-6">
              {activeCategory === 'general' && <GeneralPanel />}
              {activeCategory === 'appearance' && <AppearancePanel />}
              {activeCategory === 'terminal' && <TerminalPanel />}
              {activeCategory === 'agents' && <AgentsPanel />}
              {activeCategory === 'git' && <GitConfigPanel />}
              {activeCategory === 'orchestrapit' && <OrchestraPitConfigPanel />}
              {activeCategory === 'notifications' && <NotificationsPanel />}
              {activeCategory === 'shortcuts' && <KeyboardShortcutsPanel />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
