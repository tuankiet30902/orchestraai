// src/components/CommandPalette/CommandPaletteModal.tsx
import { useEffect, useRef, useState, useMemo, type ReactElement } from 'react'
import {
  Search,
  Sparkles,
  Terminal,
  FolderOpen,
  FolderTree,
  Columns2,
  Rows2,
  LayoutGrid,
  Radio,
  Palette,
  Activity,
  Bookmark,
  Settings,
  RotateCcw,
  ChevronRight,
  Globe
} from 'lucide-react'
import { useCommandPaletteStore } from '@/store/command-palette-store'
import { useAppStore } from '@/store/app-store'
import { useAppearanceStore } from '@/store/appearance-store'
import { useActivityBarStore } from '@/store/activity-bar-store'
import { useGitStore } from '@/store/git-store'
import { useRecentsStore } from '@/store/recents-store'
import { ORCHESTRA_TEMPLATES, type OrchestraTemplate } from '@/lib/agent-templates'
import { pickDirectory, getHomeDir } from '@/tauri/dialog'
import { type Style } from '@/lib/appearance'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  category: 'Workspace' | 'Templates' | 'Layout & Panes' | 'Themes & Display' | 'Tools & Studio'
  icon: ReactElement
  shortcut?: string
  action: () => void
}

export function CommandPaletteModal({
  onOpenSettings,
  onOpenSnapshots,
  onOpenMissionControl,
  onNewWorkspace
}: {
  onOpenSettings: (category?: string) => void
  onOpenSnapshots: () => void
  onOpenMissionControl: () => void
  onNewWorkspace: () => void
}): ReactElement | null {
  const isOpen = useCommandPaletteStore((s) => s.isOpen)
  const initialQuery = useCommandPaletteStore((s) => s.initialQuery)
  const close = useCommandPaletteStore((s) => s.close)

  const workspaces = useAppStore((s) => s.workspaces)
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId)
  const setActiveWorkspace = useAppStore((s) => s.setActiveWorkspace)
  const createWorkspace = useAppStore((s) => s.createWorkspace)
  const toggleBroadcast = useAppStore((s) => s.toggleBroadcast)
  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId)

  const recents = useRecentsStore((s) => s.recents)
  const addRecent = useRecentsStore((s) => s.add)

  const style = useAppearanceStore((s) => s.style)
  const setStyle = useAppearanceStore((s) => s.setStyle)
  const zoom = useAppearanceStore((s) => s.zoom)
  const resetZoom = useAppearanceStore((s) => s.resetZoom)
  const zoomIn = useAppearanceStore((s) => s.zoomIn)
  const zoomOut = useAppearanceStore((s) => s.zoomOut)

  const toggleSidebar = useActivityBarStore((s) => s.toggleSidebar)
  const toggleRightPanel = useGitStore((s) => s.togglePanel)

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery || '')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 20)
    }
  }, [isOpen, initialQuery])

  // Build full action list
  const allCommands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = []

    // 1. Workspaces & Actions
    items.push({
      id: 'open-folder',
      title: 'Open Project Folder…',
      subtitle: 'Choose a directory to start a new workspace',
      category: 'Workspace',
      icon: <FolderOpen className="h-4 w-4 text-amber-400" />,
      shortcut: '⌘O',
      action: () => {
        close()
        void (async () => {
          const picked = await pickDirectory()
          if (picked) {
            addRecent(picked)
            createWorkspace({
              cwd: picked,
              terminalCount: 1,
              agentIds: ['terminal'],
              worktreeMode: false
            })
          }
        })()
      }
    })

    items.push({
      id: 'quick-terminal',
      title: 'Quick Terminal',
      subtitle: 'Spawn a clean shell in Home folder',
      category: 'Workspace',
      icon: <Terminal className="h-4 w-4 text-foreground" />,
      shortcut: '⌘T',
      action: () => {
        close()
        void (async () => {
          const home = (await getHomeDir()) || '/'
          createWorkspace({
            cwd: home,
            terminalCount: 1,
            agentIds: ['terminal'],
            worktreeMode: false
          })
        })()
      }
    })

    items.push({
      id: 'team-workspace',
      title: 'New Team Workspace…',
      subtitle: 'Multi-agent setup with isolated git worktrees',
      category: 'Workspace',
      icon: <Sparkles className="h-4 w-4 text-amber-400" />,
      shortcut: '⌘N',
      action: () => {
        close()
        onNewWorkspace()
      }
    })

    // Active workspaces switcher
    workspaces.forEach((ws, idx) => {
      items.push({
        id: `switch-ws-${ws.id}`,
        title: `Switch to Workspace: ${ws.name}`,
        subtitle: `${ws.cwd}`,
        category: 'Workspace',
        icon: <LayoutGrid className="h-4 w-4 text-muted-foreground" />,
        shortcut: `⌘${idx + 1}`,
        action: () => {
          setActiveWorkspace(ws.id)
          close()
        }
      })
    })

    // Recent project folders
    recents.slice(0, 5).forEach((path) => {
      const name = path.split('/').filter(Boolean).pop() || path
      items.push({
        id: `recent-${path}`,
        title: `Open Recent: ${name}`,
        subtitle: path,
        category: 'Workspace',
        icon: <FolderTree className="h-4 w-4 text-muted-foreground" />,
        action: () => {
          close()
          addRecent(path)
          createWorkspace({
            cwd: path,
            terminalCount: 1,
            agentIds: ['terminal'],
            worktreeMode: false
          })
        }
      })
    })

    // 2. Team Templates
    ORCHESTRA_TEMPLATES.forEach((tpl: OrchestraTemplate) => {
      items.push({
        id: `template-${tpl.id}`,
        title: `Template: ${tpl.name}`,
        subtitle: `${tpl.tagline} — ${tpl.description}`,
        category: 'Templates',
        icon: <span className="text-sm">{tpl.icon}</span>,
        action: () => {
          close()
          void (async () => {
            const cwd = activeWs?.cwd || (await getHomeDir()) || '/'
            createWorkspace({
              cwd,
              terminalCount: tpl.agents.length,
              agentIds: tpl.agents.map((a) => a.agentId || 'terminal'),
              worktreeMode: tpl.worktreeMode,
              initialPrompts: tpl.agents.map((a) => a.initialPrompt)
            })
          })()
        }
      })
    })

    // 3. Layout & Panes
    items.push({
      id: 'split-right',
      title: 'Split Pane Right',
      subtitle: 'Divide current focused pane horizontally',
      category: 'Layout & Panes',
      icon: <Columns2 className="h-4 w-4 text-foreground" />,
      action: () => {
        close()
        if (activeWs) useAppStore.getState().splitPane(activeWs.focusedLeafId, 'horizontal')
      }
    })

    items.push({
      id: 'split-down',
      title: 'Split Pane Down',
      subtitle: 'Divide current focused pane vertically',
      category: 'Layout & Panes',
      icon: <Rows2 className="h-4 w-4 text-foreground" />,
      action: () => {
        close()
        if (activeWs) useAppStore.getState().splitPane(activeWs.focusedLeafId, 'vertical')
      }
    })

    items.push({
      id: 'toggle-broadcast',
      title: activeWs?.broadcastActive ? 'Disable Conduct Mode' : 'Enable Conduct Mode (Broadcast)',
      subtitle: 'Send terminal keystrokes to all agents at once',
      category: 'Layout & Panes',
      icon: <Radio className="h-4 w-4 text-amber-500" />,
      shortcut: '⌘B',
      action: () => {
        toggleBroadcast()
        close()
      }
    })

    items.push({
      id: 'toggle-sidebar',
      title: 'Toggle Primary Sidebar',
      subtitle: 'Show or hide the left studio navigation bar',
      category: 'Layout & Panes',
      icon: <LayoutGrid className="h-4 w-4 text-muted-foreground" />,
      action: () => {
        toggleSidebar()
        close()
      }
    })

    items.push({
      id: 'toggle-browser',
      title: 'Toggle Web Preview Browser',
      subtitle: 'Show or hide the live webview right column',
      category: 'Layout & Panes',
      icon: <Globe className="h-4 w-4 text-muted-foreground" />,
      action: () => {
        toggleRightPanel()
        close()
      }
    })

    // 4. Themes & Display
    const themes: Array<{ id: Style; label: string }> = [
      { id: 'orchestra-amber', label: 'Orchestra Amber (Default)' },
      { id: 'vscode-dark', label: 'VS Code Dark Blue' },
      { id: 'tokyo-night', label: 'Tokyo Cyan Neon' },
      { id: 'emerald-dark', label: 'Emerald Green Dark' },
      { id: 'violet-dark', label: 'Amethyst Violet Dark' },
      { id: 'rose-dark', label: 'Rose Pink Dark' },
      { id: 'orchestra-light', label: 'Orchestra Light Luxury' }
    ]

    themes.forEach((t) => {
      items.push({
        id: `theme-${t.id}`,
        title: `Theme: ${t.label}`,
        subtitle: t.id === style ? 'Currently Active' : 'Switch color palette',
        category: 'Themes & Display',
        icon: <Palette className="h-4 w-4 text-amber-400" />,
        action: () => {
          setStyle(t.id)
          close()
        }
      })
    })

    items.push({
      id: 'zoom-reset',
      title: 'Reset UI Zoom to 100%',
      subtitle: `Current scale: ${Math.round(zoom * 100)}%`,
      category: 'Themes & Display',
      icon: <RotateCcw className="h-4 w-4 text-foreground" />,
      shortcut: '⌘0',
      action: () => {
        resetZoom()
        close()
      }
    })

    items.push({
      id: 'zoom-in',
      title: 'Zoom In UI Interface',
      subtitle: 'Increase typography and panel dimensions',
      category: 'Themes & Display',
      icon: <span className="font-mono text-xs">+</span>,
      shortcut: '⌘+',
      action: () => {
        zoomIn()
        close()
      }
    })

    items.push({
      id: 'zoom-out',
      title: 'Zoom Out UI Interface',
      subtitle: 'Decrease typography and panel dimensions',
      category: 'Themes & Display',
      icon: <span className="font-mono text-xs">-</span>,
      shortcut: '⌘-',
      action: () => {
        zoomOut()
        close()
      }
    })

    // 5. Tools & Studio
    items.push({
      id: 'mission-control',
      title: 'Open Mission Control & Telemetry',
      subtitle: 'Live chronological feed across all agents',
      category: 'Tools & Studio',
      icon: <Activity className="h-4 w-4 text-amber-400" />,
      action: () => {
        close()
        onOpenMissionControl()
      }
    })

    items.push({
      id: 'checkpoint-snapshots',
      title: 'Workspace Checkpoint Snapshots…',
      subtitle: 'Save, export, and restore complete multi-agent states',
      category: 'Tools & Studio',
      icon: <Bookmark className="h-4 w-4 text-foreground" />,
      action: () => {
        close()
        onOpenSnapshots()
      }
    })

    items.push({
      id: 'open-settings',
      title: 'Open Settings…',
      subtitle: 'Appearance, Terminals, Git, Orchestra Pit, Notifications',
      category: 'Tools & Studio',
      icon: <Settings className="h-4 w-4 text-muted-foreground" />,
      shortcut: '⌘,',
      action: () => {
        close()
        onOpenSettings()
      }
    })

    return items
  }, [
    workspaces,
    activeWorkspaceId,
    activeWs,
    recents,
    style,
    zoom,
    close,
    createWorkspace,
    addRecent,
    setActiveWorkspace,
    toggleBroadcast,
    toggleSidebar,
    toggleRightPanel,
    setStyle,
    resetZoom,
    zoomIn,
    zoomOut,
    onNewWorkspace,
    onOpenSettings,
    onOpenSnapshots,
    onOpenMissionControl
  ])

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allCommands
    const q = query.toLowerCase().trim()
    return allCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q)
    )
  }, [allCommands, query])

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>()
    filteredCommands.forEach((item) => {
      const list = map.get(item.category) || []
      list.push(item)
      map.set(item.category, list)
    })
    return Array.from(map.entries())
  }, [filteredCommands])

  const flatFiltered = useMemo(
    () => grouped.flatMap(([, items]) => items),
    [grouped]
  )

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!isOpen) return null

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, flatFiltered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = flatFiltered[selectedIndex]
      if (selected) selected.action()
    }
  }

  let runningIndex = 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={close}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-md pt-[12vh] p-4 animate-in fade-in duration-150 select-none font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-xl flex-col rounded-2xl border border-white/[0.12] bg-zinc-950/95 shadow-2xl text-foreground overflow-hidden backdrop-blur-xl"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px -5px rgba(245, 158, 11, 0.12)'
        }}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3.5 bg-white/[0.02]">
          <Search className="h-5 w-5 text-amber-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, template, workspace, or theme…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-zinc-500 hover:text-white px-1.5 py-0.5 rounded bg-white/[0.06]"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center rounded border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Action List */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto p-2 space-y-4 no-scrollbar divide-y divide-white/[0.04]"
        >
          {grouped.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No matching commands or actions found for &ldquo;<span className="text-white">{query}</span>&rdquo;
            </div>
          ) : (
            grouped.map(([category, items]) => (
              <div key={category} className="pt-2 first:pt-0">
                <div className="px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
                  {category}
                </div>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const currentIndex = runningIndex++
                    const isSelected = currentIndex === selectedIndex

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => item.action()}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={cn(
                          'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs transition-all duration-100 cursor-pointer',
                          isSelected
                            ? 'bg-amber-500/15 text-white border border-amber-500/30 shadow-xs'
                            : 'text-zinc-300 hover:bg-white/[0.04] border border-transparent'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors',
                              isSelected
                                ? 'border-amber-500/40 bg-amber-500/20 text-amber-300'
                                : 'border-white/[0.08] bg-white/[0.04] text-zinc-400'
                            )}
                          >
                            {item.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-white truncate">{item.title}</div>
                            {item.subtitle && (
                              <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.shortcut && (
                            <kbd className="inline-flex items-center rounded border border-white/[0.1] bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 font-semibold">
                              {item.shortcut}
                            </kbd>
                          )}
                          <ChevronRight
                            className={cn(
                              'h-3.5 w-3.5 transition-opacity',
                              isSelected ? 'opacity-100 text-amber-400' : 'opacity-0'
                            )}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info strip */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-white/[0.02] px-4 py-2 text-[11px] text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="font-mono text-[10px] bg-white/[0.06] px-1 rounded">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono text-[10px] bg-white/[0.06] px-1 rounded">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono text-[10px] bg-white/[0.06] px-1 rounded">ESC</kbd> Close
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-500/80">OrchestraAI Studio</span>
        </div>
      </div>
    </div>
  )
}
