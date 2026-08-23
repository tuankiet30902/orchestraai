import { useEffect, useRef, useState, type ReactElement } from 'react'
import {
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  MessagesSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  SplitSquareHorizontal,
  Terminal,
  X
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
import { DEFAULT_TEMPLATE_ID } from '@/lib/templates'
import { resolvePaneTitle } from '@/lib/pane-title'
import { displayState, paneDot, workspaceDot } from '@/lib/agent-state/rollup'
import { joinActiveWorkspaceToRoom } from '@/lib/orchestra-pit-join'
import { useTerminateConfirmStore } from '@/store/terminate-confirm-store'
import { ActivityDot } from '@/components/ActivityDot'
import { StateDot } from '@/components/StateDot'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { UpdateButton } from '@/components/Navbar/UpdateButton'
import { TaskBoardModal } from '@/components/TaskBoard/TaskBoardModal'

interface NavbarProps {
  /** Open the setup wizard to create a new workspace. */
  onNewWorkspace: () => void
}

/** Left navigation rail: Unified Hierarchical Workspace & Terminal Tree.
 * Each Workspace is a parent node with expandable child terminals.
 */
export function Navbar({ onNewWorkspace }: NavbarProps): ReactElement {
  const visible = useNavbarVisibilityStore((s) => s.visible)
  const width = useNavbarVisibilityStore((s) => s.width)
  const setWidth = useNavbarVisibilityStore((s) => s.setWidth)
  const resetWidth = useNavbarVisibilityStore((s) => s.resetWidth)
  const [isResizing, setIsResizing] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

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
  const requestWorkspaceClose = useTerminateConfirmStore((s) => s.requestWorkspaceClose)
  const requestPaneClose = useTerminateConfirmStore((s) => s.requestPaneClose)

  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(GuardedPointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const draggingWorkspace = workspaces.find((w) => w.id === draggingId) ?? null

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
      <div className="flex h-full w-full min-w-0 flex-col">
        {/* Header Title */}
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/40 px-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
            Explorer & Trees
          </span>
          <button
            type="button"
            onClick={onNewWorkspace}
            title="New workspace"
            aria-label="New workspace"
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tree Navigator */}
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setDraggingId(null)}
          >
            <SortableContext
              items={workspaces.map((w) => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-1">
                {workspaces.map((ws) => (
                  <WorkspaceTreeNode
                    key={ws.id}
                    workspace={ws}
                    active={!welcomeFocused && ws.id === activeWorkspaceId}
                    renaming={renamingId === ws.id}
                    onSelect={() => setActiveWorkspace(ws.id)}
                    onStartRename={() => setRenamingId(ws.id)}
                    onCommitRename={(name) => {
                      renameWorkspace(ws.id, name)
                      setRenamingId(null)
                    }}
                    onCancelRename={() => setRenamingId(null)}
                    onClose={() => requestWorkspaceClose(ws, () => closeWorkspace(ws.id))}
                    onFocusLeaf={(leafId) => {
                      setActiveWorkspace(ws.id)
                      setFocusedLeaf(leafId)
                    }}
                    onSplitLeaf={(leafId) => {
                      setActiveWorkspace(ws.id)
                      splitPane(leafId, 'horizontal')
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
                <div aria-hidden className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs text-accent-foreground shadow-lg">
                  <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="flex-1 truncate">{draggingWorkspace.name}</span>
                  <span className="text-[10px] tabular-nums text-muted-foreground font-mono">
                    {collectLeaves(draggingWorkspace.layout).length} panes
                  </span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          <div className="mt-2 space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
              onClick={onNewWorkspace}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              New workspace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                const ws = useAppStore.getState().workspaces
                if (ws.length > 0) {
                  useGitStore.getState().setMode('tasks')
                  useGitStore.getState().setPanelOpen(true)
                  useAppStore.getState().closeWelcome()
                } else {
                  setTaskModalOpen(true)
                }
              }}
            >
              <CheckSquare className="h-3.5 w-3.5 mr-1" />
              Tasks & Kanban
            </Button>
          </div>
        </div>

        {/* Footer update button if present */}
        <div className="shrink-0 space-y-0.5 border-t border-border p-1">
          <UpdateButton />
        </div>
      </div>

      <TaskBoardModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
      />

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
  onSelect: () => void
  onStartRename: () => void
  onCommitRename: (name: string) => void
  onCancelRename: () => void
  onClose: () => void
  onFocusLeaf: (leafId: string) => void
  onSplitLeaf: (leafId: string) => void
  onCloseLeaf: (leafId: string) => void
}

function WorkspaceTreeNode({
  workspace,
  active,
  renaming,
  onSelect,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onClose,
  onFocusLeaf,
  onSplitLeaf,
  onCloseLeaf
}: WorkspaceTreeNodeProps): ReactElement {
  const [expanded, setExpanded] = useState(true)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: workspace.id,
    disabled: renaming
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
      <li ref={setNodeRef} style={style}>
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
      className={cn('select-none', isDragging && 'opacity-40')}
    >
      {/* Workspace Parent Node */}
      <div
        onClick={onSelect}
        className={cn(
          'group flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1.5 text-xs transition-colors',
          active
            ? 'bg-accent/80 text-accent-foreground font-medium'
            : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
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
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-background/80 text-muted-foreground"
        >
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>

        {/* Folder Icon */}
        {expanded ? (
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}

        {/* Workspace Name */}
        <span className="flex-1 truncate leading-none">{workspace.name}</span>

        {/* Activity Dot */}
        {dot && (
          <span className="shrink-0">
            {dot === 'activity' ? <ActivityDot /> : <StateDot state={dot} />}
          </span>
        )}

        {/* Terminal Count Badge */}
        <span className="text-[10px] tabular-nums font-mono text-muted-foreground/80 px-1 py-0.2 rounded bg-muted/60">
          {leaves.length}
        </span>

        {/* Actions Dropdown Trigger */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-no-dnd
              type="button"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-background/80 text-muted-foreground hover:text-foreground transition-opacity"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                void joinActiveWorkspaceToRoom()
                useGitStore.getState().setMode('orchestrapit')
                useGitStore.getState().setPanelOpen(true)
              }}
            >
              <MessagesSquare className="h-3.5 w-3.5 mr-1" />
              Add to Team Pit
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                const targetLeaf = workspace.focusedLeafId ?? leaves[0]?.id
                if (targetLeaf) onSplitLeaf(targetLeaf)
              }}
            >
              <SplitSquareHorizontal className="h-3.5 w-3.5 mr-1" />
              Split Terminal
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onStartRename}>
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={onClose}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Close Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Child Terminals Tree */}
      {expanded && leaves.length > 0 && (
        <ul className="ml-3.5 pl-2.5 border-l border-border/60 mt-0.5 space-y-0.5">
          {leaves.map((leaf) => {
            const agentId = leaf.agentId ?? DEFAULT_TEMPLATE_ID
            const title = resolvePaneTitle(agentId, titles[leaf.terminalId], customTitles[leaf.terminalId])
            const isFocused = active && leaf.id === workspace.focusedLeafId
            const leafDot = paneDot(
              displayState(agentStates[leaf.terminalId]),
              activity[leaf.terminalId] === true
            )

            return (
              <li key={leaf.id}>
                <div
                  data-no-dnd
                  onClick={(e) => {
                    e.stopPropagation()
                    onFocusLeaf(leaf.id)
                  }}
                  title={title}
                  className={cn(
                    'group flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors',
                    isFocused
                      ? 'bg-accent text-foreground font-medium shadow-xs'
                      : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                  )}
                >
                  <Terminal className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate font-mono text-[11px] leading-tight">
                    {title}
                  </span>

                  {leafDot && (
                    <span className="shrink-0">
                      {leafDot === 'activity' ? <ActivityDot /> : <StateDot state={leafDot} />}
                    </span>
                  )}

                  {/* Close pane button on hover if more than 1 pane */}
                  {leaves.length > 1 && (
                    <button
                      type="button"
                      data-no-dnd
                      onClick={(e) => {
                        e.stopPropagation()
                        onCloseLeaf(leaf.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive flex h-4 w-4 items-center justify-center rounded"
                      title="Close pane"
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

  // Defer focus past Radix's focus-restore so the input reliably wins.
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
      className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-ring font-medium"
    />
  )
}
