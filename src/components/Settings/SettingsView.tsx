// src/components/Settings/SettingsView.tsx
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
  {
    id: 'general',
    label: 'General',
    Icon: Settings,
    keywords: ['startup', 'update', 'version', 'restore', 'session', 'reset', 'diagnostics']
  },
  {
    id: 'appearance',
    label: 'Appearance & Zoom',
    Icon: Palette,
    keywords: ['zoom', 'scale', 'theme', 'color', 'accent', 'sidebar', 'width', 'dark', 'font']
  },
  {
    id: 'terminal',
    label: 'Terminal & Shell',
    Icon: Terminal,
    keywords: ['font', 'fontSize', 'shell', 'scrollback', 'cursor', 'ligatures', 'lineheight', 'bash', 'zsh', 'fish']
  },
  {
    id: 'agents',
    label: 'AI Agents',
    Icon: Bot,
    keywords: ['claude', 'opencode', 'codex', 'cli', 'arguments', 'path', 'binary', 'ai']
  },
  {
    id: 'git',
    label: 'Git & Worktrees',
    Icon: GitBranch,
    keywords: ['git', 'worktree', 'branch', 'prune', 'diff', 'commit', 'unified', 'split']
  },
  {
    id: 'orchestrapit',
    label: 'Orchestra Pit',
    Icon: Sparkles,
    keywords: ['room', 'chat', 'collaboration', 'broadcast', 'peers', 'nudge', 'conduct']
  },
  {
    id: 'notifications',
    label: 'Notifications',
    Icon: Bell,
    keywords: ['sound', 'alert', 'chime', 'toast', 'system', 'desktop', 'audio']
  },
  {
    id: 'shortcuts',
    label: 'Keyboard Shortcuts',
    Icon: Keyboard,
    keywords: ['keybindings', 'hotkeys', 'shortcuts', 'cmd', 'ctrl', 'keys', 'modifiers']
  }
]

interface SettingsViewProps {
  onClose: () => void
  initialCategory?: CategoryId
}

/**
 * Modern, user-friendly Settings dialog with Category Rail, Search Filter, and Setting Cards.
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
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-muted/30 px-5">
          <div className="flex items-center gap-3 min-w-0 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings (zoom, font, git, theme)..."
                className="w-full h-8 rounded-lg border border-border bg-card pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden focus:ring-1 focus:ring-foreground font-sans transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              Esc
            </kbd>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close settings"
              title="Close (Esc)"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Settings Body: Left Navigation + Right Content Panel */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Settings Navigation Sidebar */}
          <nav className="flex w-56 shrink-0 flex-col border-r border-border bg-card/60">
            <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Categories
              </div>
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
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left',
                      active
                        ? 'bg-muted text-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    )}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-foreground' : 'text-muted-foreground')} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                )
              })}

              {filteredCategories.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground italic">
                  No matching settings found
                </div>
              )}
            </div>
          </nav>

          {/* Settings Content Area */}
          <div className="relative flex min-w-0 flex-1 flex-col bg-canvas overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl px-6 py-6 sm:py-8">
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
