import { useEffect, useRef, useState, useMemo, type ReactElement } from 'react'
import {
  ChevronDown,
  ChevronRight,
  FolderGit2 as Folder,
  FolderOpen,
  Sparkles as MessagesSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SplitSquareHorizontal,
  SplitSquareVertical,
  X,
  Bot
} from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GuardedPointerSensor } from '@/lib/dnd-sensors'
import { collectLeaves } from '@/lib/layout-tree'
import { useAppStore, type Workspace } from '@/store/app-store'
import { useGitStore } from '@/store/git-store'
import { useNavbarVisibilityStore } from '@/store/navbar-visibility-store'
import { useTerminalTitleStore } from '@/store/terminal-title-store'
import { useTerminalActivityStore } from '@/store/terminal-activity-store'
import { useAgentStateStore } from '@/store/agent-state-store'
import { DEFAULT_TEMPLATE_ID, TEMPLATES, templateById } from '@/lib/templates'
import { resolvePaneTitle } from '@/lib/pane-title'
import { displayState, paneDot, workspaceDot } from '@/lib/agent-state/rollup'
import { joinActiveWorkspaceToRoom } from '@/lib/orchestra-pit-join'
import { useTerminateConfirmStore } from '@/store/terminate-confirm-store'
import { ActivityDot } from '@/components/ActivityDot'
import { StateDot } from '@/components/StateDot'
import { AgentIcon } from '@/components/AgentIcon'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { UpdateButton } from '@/components/Navbar/UpdateButton'

interface NavbarProps {
  /** Open the setup wizard to create a new workspace. */
  onNewWorkspace: () => void
  /** When embedded inside PrimarySidebar */
  embedded?: boolean
}

/** Left navigation rail: Unified Hierarchical Workspace & Terminal Tree.
 * Features:
 * - Real Agent logos for every terminal (Claude, Codex, Antigravity, etc.)
 * - Inline Double-Click & Action Renaming for both Workspaces and Terminals
 * - Quick Split, Close, and Switch Agent controls
 * - Live Search Filter
 */
export function Navbar({ onNewWorkspace, embedded = false }: NavbarProps): ReactElement {
  const visible = useNavbarVisibilityStore((s) => s.visible)
  const width = useNavbarVisibilityStore((s) => s.width)
  const setWidth = useNavbarVisibilityStore((s) => s.setWidth)
  const resetWidth = useNavbarVisibilityStore((s) => s.resetWidth)
  const [isResizing, setIsResizing] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  const [searchQuery, setSearchQuery] = useState('')

  const workspaces = useAppStore((s) => s.workspaces)
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId)
  const welcomeFocused = useAppStore((s) => s.welcomeFocused)
  const setActiveWorkspace = useAppStore((s) => s.setActiveWorkspace)
  const renameWorkspace = useAppStore((s) => s.renameWorkspace)
  const closeWorkspace = useAppStore((s) => s.closeWorkspace)
  const moveWorkspace = useAppStore((s) => s.moveWorkspace)
  const setFocusedLeaf = useAppStore((s) => s.setFocusedLeaf)
  const splitPane = useAppStore((s) => s.splitPane)
  const closePane = useAppStore((s) => s.closePane)
  const setPaneAgent = useAppStore((s) => s.setPaneAgent)
  const requestWorkspaceClose = useTerminateConfirmStore((s) => s.requestWorkspaceClose)
  const requestPaneClose = useTerminateConfirmStore((s) => s.requestPaneClose)

  const [renamingWorkspaceId, setRenamingWorkspaceId] = useState<string | null>(null)
  const [renamingTerminalId, setRenamingTerminalId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(GuardedPointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const draggingWorkspace = workspaces.find((w) => w.id === draggingId) ?? null

  const filteredWorkspaces = useMemo(() => {
    if (!searchQuery.trim()) return workspaces
    const q = searchQuery.toLowerCase().trim()
    const titles = useTerminalTitleStore.getState().titles
    const customTitles = useTerminalTitleStore.getState().customTitles

    return workspaces.filter((ws) => {
      if (ws.name.toLowerCase().includes(q)) return true
      const leaves = collectLeaves(ws.layout)
      return leaves.some((l) => {
        const agentId = l.agentId ?? DEFAULT_TEMPLATE_ID
        const title = resolvePaneTitle(agentId, titles[l.terminalId], customTitles[l.terminalId])
        return (
          title.toLowerCase().includes(q) ||
          agentId.toLowerCase().includes(q) ||
          templateById(agentId).name.toLowerCase().includes(q)
        )
      })
    })
  }, [workspaces, searchQuery])

  function handleDragStart(event: DragStartEvent): void {
    setDraggingId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent): void {
    setDraggingId(null)
    const { active, over } = event
    if (over && active.id !== over.id) {
      moveWorkspace(String(active.id), String(over.id))
    }
  }

  const handlePointerDown = (e: React.PointerEvent): void => {
    if (e.button !== 0) return
    e.preventDefault()
    setIsResizing(true)

    const onPointerMove = (moveEvent: PointerEvent): void => {
      if (!navRef.current) return
      const rect = navRef.current.getBoundingClientRect()
      const newWidth = moveEvent.clientX - rect.left
      setWidth(newWidth)
    }

    const onPointerUp = (): void => {
      setIsResizing(false)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const content = (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-card font-sans select-none">
      {/* Search Filter Header */}
      <div className="p-2 border-b border-border/60">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter workspaces & agents..."
            className="w-full h-7 rounded-md border border-input bg-background/80 pl-7 pr-6 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-1 focus:ring-foreground transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Tree Navigator */}
      <div className="min-h-0 flex-1 overflow-y-auto p-1.5 space-y-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setDraggingId(null)}
        >
          <SortableContext
            items={filteredWorkspaces.map((w) => w.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-1">
              {filteredWorkspaces.map((ws) => (
                <WorkspaceTreeNode
                  key={ws.id}
                  workspace={ws}
                  active={!welcomeFocused && ws.id === activeWorkspaceId}
                  renaming={renamingWorkspaceId === ws.id}
                  renamingTerminalId={renamingTerminalId}
                  onSelect={() => setActiveWorkspace(ws.id)}
                  onStartRename={() => setRenamingWorkspaceId(ws.id)}
                  onCommitRename={(name) => {
                    renameWorkspace(ws.id, name)
                    setRenamingWorkspaceId(null)
                  }}
                  onCancelRename={() => setRenamingWorkspaceId(null)}
                  onStartTerminalRename={(terminalId) => setRenamingTerminalId(terminalId)}
                  onCommitTerminalRename={(terminalId, name) => {
                    useTerminalTitleStore.getState().setCustomTitle(terminalId, name)
                    setRenamingTerminalId(null)
                  }}
                  onCancelTerminalRename={() => setRenamingTerminalId(null)}
                  onClose={() => requestWorkspaceClose(ws, () => closeWorkspace(ws.id))}
                  onFocusLeaf={(leafId) => {
                    setActiveWorkspace(ws.id)
                    setFocusedLeaf(leafId)
                  }}
                  onSplitLeaf={(leafId, direction = 'horizontal') => {
                    setActiveWorkspace(ws.id)
                    splitPane(leafId, direction)
                  }}
                  onSetPaneAgent={(leafId, agentId) => {
                    setPaneAgent(leafId, agentId)
                  }}
                  onCloseLeaf={(leafId) => {
                    const targetLeaf = collectLeaves(ws.layout).find((l) => l.id === leafId)
                    if (targetLeaf) {
                      const agentId = targetLeaf.agentId ?? DEFAULT_TEMPLATE_ID
                      const titles = useTerminalTitleStore.getState().titles
                      const customTitles = useTerminalTitleStore.getState().customTitles
                      const title = resolvePaneTitle(
                        agentId,
                        titles[targetLeaf.terminalId],
                        customTitles[targetLeaf.terminalId]
                      )
                      requestPaneClose(targetLeaf.terminalId, title, () => closePane(leafId))
                    } else {
                      closePane(leafId)
                    }
                  }}
                />
              ))}
            </ul>
          </SortableContext>
          <DragOverlay>
            {draggingWorkspace ? (
              <div aria-hidden className="flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-xs text-accent-foreground shadow-lg border border-border">
                <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1 truncate font-medium">{draggingWorkspace.name}</span>
                <span className="text-[10px] tabular-nums text-muted-foreground font-mono">
                  {collectLeaves(draggingWorkspace.layout).length} panes
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40"
          onClick={onNewWorkspace}
        >
          <Plus className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
          New Workspace
        </Button>
      </div>

      {/* Footer update button if present */}
      <div className="shrink-0 space-y-0.5 border-t border-border p-1">
        <UpdateButton />
      </div>
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <nav
      ref={navRef}
      aria-hidden={!visible}
      inert={!visible}
      data-focus-return
      style={{ width: visible ? width : 0 }}
      className={cn(
        'relative h-full shrink-0 overflow-hidden border-r border-border bg-card',
        isResizing
          ? 'transition-none select-none'
          : 'transition-[width] duration-200 ease-in-out motion-reduce:transition-none'
      )}
    >
      {content}

      {/* Resizable drag handle */}
      {visible && (
        <div
          role="separator"
          aria-orientation="vertical"
          title="Drag to resize sidebar (double click to reset)"
          onPointerDown={handlePointerDown}
          onDoubleClick={resetWidth}
          className="group absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize z-30 flex items-center justify-end"
        >
          <div
            className={cn(
              'h-full w-[1px] transition-colors duration-150',
              isResizing ? 'bg-primary/60' : 'group-hover:bg-primary/35'
            )}
          />
        </div>
      )}
    </nav>
  )
}

interface WorkspaceTreeNodeProps {
  workspace: Workspace
  active: boolean
  renaming: boolean
  renamingTerminalId: string | null
  onSelect: () => void
  onStartRename: () => void
  onCommitRename: (name: string) => void
  onCancelRename: () => void
  onStartTerminalRename: (terminalId: string) => void
  onCommitTerminalRename: (terminalId: string, name: string) => void
  onCancelTerminalRename: () => void
  onClose: () => void
  onFocusLeaf: (leafId: string) => void
  onSplitLeaf: (leafId: string, direction?: 'horizontal' | 'vertical') => void
  onSetPaneAgent: (leafId: string, agentId: string) => void
  onCloseLeaf: (leafId: string) => void
}

function WorkspaceTreeNode({
  workspace,
  active,
  renaming,
  renamingTerminalId,
  onSelect,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onStartTerminalRename,
  onCommitTerminalRename,
  onCancelTerminalRename,
  onClose,
  onFocusLeaf,
  onSplitLeaf,
  onSetPaneAgent,
  onCloseLeaf
}: WorkspaceTreeNodeProps): ReactElement {
  const [expanded, setExpanded] = useState(true)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: workspace.id,
    disabled: renaming || Boolean(renamingTerminalId)
  })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const leaves = collectLeaves(workspace.layout)

  const titles = useTerminalTitleStore((s) => s.titles)
  const customTitles = useTerminalTitleStore((s) => s.customTitles)
  const activity = useTerminalActivityStore((s) => s.active)
  const agentStates = useAgentStateStore((s) => s.byId)

  const dot = active
    ? null
    : workspaceDot(
        leaves.map((l) => ({
          display: displayState(agentStates[l.terminalId]),
          outputActive: activity[l.terminalId] === true
        }))
      )

  if (renaming) {
    return (
      <li ref={setNodeRef} style={style} className="p-1">
        <RenameInput
          initialValue={workspace.name}
          onCommit={onCommitRename}
          onCancel={onCancelRename}
        />
      </li>
    )
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      tabIndex={-1}
      className={cn('select-none rounded-lg border border-transparent transition-colors', isDragging && 'opacity-40')}
    >
      {/* Workspace Parent Header */}
      <div
        onClick={onSelect}
        onDoubleClick={(e) => {
          e.stopPropagation()
          onStartRename()
        }}
        className={cn(
          'group flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors',
          active
            ? 'bg-muted/70 text-foreground font-medium shadow-2xs border border-border/80'
            : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
        )}
      >
        {/* Toggle Expand / Collapse Chevron */}
        <button
          type="button"
          data-no-dnd
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((prev) => !prev)
          }}
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-background text-muted-foreground"
        >
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>

        {/* Folder Icon */}
        {expanded ? (
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-foreground/80" />
        ) : (
          <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}

        {/* Workspace Name */}
        <span className="flex-1 truncate leading-none font-medium">{workspace.name}</span>

        {/* Activity Dot */}
        {dot && (
          <span className="shrink-0">
            {dot === 'activity' ? <ActivityDot /> : <StateDot state={dot} />}
          </span>
        )}

        {/* Terminal Count Badge */}
        <span className="text-[10px] tabular-nums font-mono text-muted-foreground/80 px-1.5 py-0.5 rounded-md bg-muted/60">
          {leaves.length}
        </span>

        {/* Quick Add Split Pane Button on hover */}
        <button
          data-no-dnd
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            const targetLeaf = workspace.focusedLeafId ?? leaves[0]?.id
            if (targetLeaf) onSplitLeaf(targetLeaf, 'horizontal')
          }}
          title="Split Terminal"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-background text-muted-foreground hover:text-foreground transition-opacity"
        >
          <Plus className="h-3 w-3" />
        </button>

        {/* Actions Dropdown Trigger */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-no-dnd
              type="button"
              aria-label="Workspace Actions"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-background text-muted-foreground hover:text-foreground transition-opacity"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                const targetLeaf = workspace.focusedLeafId ?? leaves[0]?.id
                if (targetLeaf) onSplitLeaf(targetLeaf, 'horizontal')
              }}
            >
              <SplitSquareHorizontal className="h-3.5 w-3.5 mr-1.5" />
              Split Horizontal
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                const targetLeaf = workspace.focusedLeafId ?? leaves[0]?.id
                if (targetLeaf) onSplitLeaf(targetLeaf, 'vertical')
              }}
            >
              <SplitSquareVertical className="h-3.5 w-3.5 mr-1.5" />
              Split Vertical
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                void joinActiveWorkspaceToRoom()
                useGitStore.getState().setMode('orchestrapit')
                useGitStore.getState().setPanelOpen(true)
              }}
            >
              <MessagesSquare className="h-3.5 w-3.5 mr-1.5" />
              Add to Orchestra Pit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onStartRename}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Rename Workspace
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onClose}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Close Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Child Terminals Tree */}
      {expanded && leaves.length > 0 && (
        <ul className="ml-3 pl-2.5 border-l border-border/50 mt-1 space-y-0.5">
          {leaves.map((leaf) => {
            const agentId = leaf.agentId ?? DEFAULT_TEMPLATE_ID
            const title = resolvePaneTitle(agentId, titles[leaf.terminalId], customTitles[leaf.terminalId])
            const isFocused = active && leaf.id === workspace.focusedLeafId
            const isEditing = renamingTerminalId === leaf.terminalId
            const leafDot = paneDot(
              displayState(agentStates[leaf.terminalId]),
              activity[leaf.terminalId] === true
            )

            if (isEditing) {
              return (
                <li key={leaf.id} className="py-0.5">
                  <RenameInput
                    initialValue={title}
                    onCommit={(name) => onCommitTerminalRename(leaf.terminalId, name)}
                    onCancel={onCancelTerminalRename}
                  />
                </li>
              )
            }

            return (
              <li key={leaf.id}>
                <div
                  data-no-dnd
                  onClick={(e) => {
                    e.stopPropagation()
                    onFocusLeaf(leaf.id)
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    onStartTerminalRename(leaf.terminalId)
                  }}
                  title={`${title} (Double-click to rename)`}
                  className={cn(
                    'group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors',
                    isFocused
                      ? 'bg-accent/80 text-foreground font-medium shadow-2xs border border-border/80'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  )}
                >
                  {/* Distinctive Agent Logo */}
                  <div className="relative flex items-center justify-center shrink-0">
                    <AgentIcon
                      agentId={agentId}
                      className="h-3.5 w-3.5 shrink-0 rounded-xs"
                    />
                    {activity[leaf.terminalId] === true && (
                      <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>

                  {/* Terminal / Agent Name */}
                  <span className="flex-1 truncate font-mono text-[11px] leading-tight">
                    {title}
                  </span>

                  {/* State / Activity Indicator */}
                  {leafDot && (
                    <span className="shrink-0">
                      {leafDot === 'activity' ? <ActivityDot /> : <StateDot state={leafDot} />}
                    </span>
                  )}

                  {/* Terminal Item Actions (Rename, Split, Switch Agent, Close) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        data-no-dnd
                        type="button"
                        aria-label="Terminal Actions"
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 hover:bg-background/80 flex h-4 w-4 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-opacity"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => onStartTerminalRename(leaf.terminalId)}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Rename Terminal
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Bot className="h-3.5 w-3.5 mr-1.5" />
                          Switch Agent
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48">
                          {TEMPLATES.map((tmpl) => (
                            <DropdownMenuItem
                              key={tmpl.id}
                              onSelect={() => onSetPaneAgent(leaf.id, tmpl.id)}
                              className="flex items-center gap-2 text-xs"
                            >
                              <AgentIcon template={tmpl} className="h-3.5 w-3.5" />
                              <span className="truncate">{tmpl.name}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuItem
                        onSelect={() => onSplitLeaf(leaf.id, 'horizontal')}
                      >
                        <SplitSquareHorizontal className="h-3.5 w-3.5 mr-1.5" />
                        Split Horizontal
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => onSplitLeaf(leaf.id, 'vertical')}
                      >
                        <SplitSquareVertical className="h-3.5 w-3.5 mr-1.5" />
                        Split Vertical
                      </DropdownMenuItem>
                      {leaves.length > 1 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => onCloseLeaf(leaf.id)}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <X className="h-3.5 w-3.5 mr-1.5" />
                            Close Pane
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Quick Close Button on hover (when more than 1 pane) */}
                  {leaves.length > 1 && (
                    <button
                      type="button"
                      data-no-dnd
                      onClick={(e) => {
                        e.stopPropagation()
                        onCloseLeaf(leaf.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive flex h-4 w-4 items-center justify-center rounded transition-opacity"
                      title="Close Pane"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}

interface RenameInputProps {
  initialValue: string
  onCommit: (name: string) => void
  onCancel: () => void
}

function RenameInput({ initialValue, onCommit, onCancel }: RenameInputProps): ReactElement {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)
  const doneRef = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const finish = (commit: boolean): void => {
    if (doneRef.current) return
    doneRef.current = true
    if (commit) onCommit(value)
    else onCancel()
  }

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          finish(true)
        } else if (e.key === 'Escape') {
          e.preventDefault()
          finish(false)
        }
      }}
      onBlur={() => finish(true)}
      className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs outline-hidden focus:ring-1 focus:ring-foreground font-medium shadow-2xs"
    />
  )
}
