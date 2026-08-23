import { useEffect, useRef, useState, type ReactElement } from 'react'
import { Compass, Edit2, FolderGit2 as Folder, FolderOpen, Sparkles as MessagesSquare, Plus, X } from 'lucide-react'
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
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GuardedPointerSensor } from '@/lib/dnd-sensors'
import { useAppStore, type Workspace } from '@/store/app-store'
import { cn } from '@/lib/utils'
import { collectLeaves } from '@/lib/layout-tree'
import { useTerminalActivityStore } from '@/store/terminal-activity-store'
import { useAgentStateStore } from '@/store/agent-state-store'
import { displayState, workspaceDot, type DotState } from '@/lib/agent-state/rollup'
import { ActivityDot } from '@/components/ActivityDot'
import { StateDot } from '@/components/StateDot'
import { joinActiveWorkspaceToRoom } from '@/lib/orchestra-pit-join'
import { useTerminateConfirmStore } from '@/store/terminate-confirm-store'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu'

interface WorkspaceTabsProps {
  /** Open the setup wizard to create a new workspace. */
  onNewWorkspace: () => void
}

/** Shared tab box styling — used by the live tabs and the drag overlay (VS Code standard). */
const TAB_BASE =
  'group relative flex h-full min-w-[80px] sm:min-w-[120px] max-w-[200px] shrink items-center gap-1.5 sm:gap-2 border-r border-border/80 px-2 sm:px-3 text-[12px] font-normal transition-colors select-none'

function tabStateClass(active: boolean): string {
  return active
    ? 'bg-background text-foreground border-t-2 border-t-foreground border-r-border/80 z-10 font-medium'
    : 'bg-card/40 text-muted-foreground hover:bg-card/80 hover:text-foreground border-t-2 border-t-transparent'
}

/**
 * VS Code style Workspace tab strip below the title bar.
 * Square full-height tabs, top-border active indicator, crisp borders and inline actions.
 */
export function WorkspaceTabs({ onNewWorkspace }: WorkspaceTabsProps): ReactElement {
  const workspaces = useAppStore((s) => s.workspaces)
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId)
  const setActiveWorkspace = useAppStore((s) => s.setActiveWorkspace)
  const renameWorkspace = useAppStore((s) => s.renameWorkspace)
  const closeWorkspace = useAppStore((s) => s.closeWorkspace)
  const moveWorkspace = useAppStore((s) => s.moveWorkspace)
  const welcomeOpen = useAppStore((s) => s.welcomeOpen)
  const welcomeFocused = useAppStore((s) => s.welcomeFocused)
  const focusWelcome = useAppStore((s) => s.focusWelcome)
  const closeWelcome = useAppStore((s) => s.closeWelcome)
  const activity = useTerminalActivityStore((s) => s.active)
  const agentStates = useAgentStateStore((s) => s.byId)
  const requestWorkspaceClose = useTerminateConfirmStore((s) => s.requestWorkspaceClose)
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

  return (
    <div
      data-focus-return
      className="flex h-[35px] shrink-0 items-stretch justify-between border-b border-border bg-canvas px-0 overflow-hidden"
    >
      <div className="flex h-full items-stretch overflow-x-auto no-scrollbar flex-1 min-w-0">
        {welcomeOpen && (
          <WelcomeTab
            active={welcomeFocused}
            closable={workspaces.length > 0}
            onSelect={focusWelcome}
            onClose={closeWelcome}
          />
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setDraggingId(null)}
        >
          <SortableContext
            items={workspaces.map((w) => w.id)}
            strategy={horizontalListSortingStrategy}
          >
            {workspaces.map((ws) => {
              const isActive = !welcomeFocused && ws.id === activeWorkspaceId
              const leaves = collectLeaves(ws.layout)
              const dot = isActive
                ? null
                : workspaceDot(
                    leaves.map((l) => ({
                      display: displayState(agentStates[l.terminalId]),
                      outputActive: activity[l.terminalId] === true
                    }))
                  )
              return (
                <SortableWorkspaceTab
                  key={ws.id}
                  workspace={ws}
                  active={isActive}
                  paneCount={leaves.length}
                  dot={dot}
                  renaming={renamingId === ws.id}
                  onSelect={() => setActiveWorkspace(ws.id)}
                  onStartRename={() => setRenamingId(ws.id)}
                  onCommitRename={(name) => {
                    renameWorkspace(ws.id, name)
                    setRenamingId(null)
                  }}
                  onCancelRename={() => setRenamingId(null)}
                  onClose={() => requestWorkspaceClose(ws, () => closeWorkspace(ws.id))}
                />
              )
            })}
          </SortableContext>
          <DragOverlay>
            {draggingWorkspace ? (
              <div
                aria-hidden
                className={cn(
                  TAB_BASE,
                  tabStateClass(draggingWorkspace.id === activeWorkspaceId),
                  'cursor-grabbing bg-background shadow-2xl border-x border-border z-50'
                )}
              >
                <Folder className="h-4 w-4 text-foreground shrink-0" />
                <span className="flex-1 truncate">{draggingWorkspace.name}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <button
          type="button"
          title="New Workspace"
          aria-label="New Workspace"
          onClick={onNewWorkspace}
          className="flex h-full w-8 shrink-0 items-center justify-center text-muted-foreground hover:bg-card/80 hover:text-foreground border-r border-border/80 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

interface WelcomeTabProps {
  active: boolean
  closable: boolean
  onSelect: () => void
  onClose: () => void
}

/** The leading "Welcome" tab — pinned first, not draggable. */
function WelcomeTab({ active, closable, onSelect, onClose }: WelcomeTabProps): ReactElement {
  return (
    <div
      onClick={onSelect}
      className={cn(TAB_BASE, 'cursor-pointer', tabStateClass(active))}
      title="Welcome Hub"
    >
      <Compass className={cn('h-4 w-4 shrink-0', active ? 'text-foreground' : 'text-muted-foreground')} />
      <span className="flex-1 truncate">Welcome</span>
      {closable && (
        <button
          type="button"
          title="Close Welcome tab"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

interface WorkspaceTabProps {
  workspace: Workspace
  active: boolean
  paneCount: number
  dot: DotState | null
  renaming: boolean
  onSelect: () => void
  onStartRename: () => void
  onCommitRename: (name: string) => void
  onCancelRename: () => void
  onClose: () => void
}

/** A compact, draggable, sortable workspace tab with context menu and quick actions. */
function SortableWorkspaceTab({
  workspace,
  active,
  paneCount,
  dot,
  renaming,
  onSelect,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onClose
}: WorkspaceTabProps): ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: workspace.id,
    disabled: renaming
  })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          {...(renaming ? {} : attributes)}
          {...(renaming ? {} : listeners)}
          tabIndex={-1}
          onClick={onSelect}
          onDoubleClick={onStartRename}
          className={cn(TAB_BASE, 'cursor-pointer', tabStateClass(active), isDragging && 'opacity-40')}
        >
          {renaming ? (
            <TabRenameInput
              initialValue={workspace.name}
              onCommit={onCommitRename}
              onCancel={onCancelRename}
            />
          ) : (
            <>
              {/* Folder Icon */}
              {active ? (
                <FolderOpen className="h-4 w-4 text-foreground shrink-0" />
              ) : (
                <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
              )}

              {/* Status / Activity dot */}
              {dot !== null && (dot === 'activity' ? <ActivityDot /> : <StateDot state={dot} />)}

              {/* Tab Title */}
              <span className="flex-1 min-w-0 truncate text-[12px] font-normal leading-none" title={`${workspace.name} (Double-click to rename)`}>
                {workspace.name}
              </span>

              {/* Panes count badge */}
              {paneCount > 1 && (
                <span className="hidden sm:inline-block rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shrink-0">
                  {paneCount}
                </span>
              )}

              {/* Close Button */}
              <button
                data-no-dnd
                type="button"
                title="Close workspace"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onSelect={onStartRename}>
          <Edit2 className="h-3.5 w-3.5 mr-1" />
          <span>Rename Workspace</span>
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => void joinActiveWorkspaceToRoom()}>
          <MessagesSquare className="h-3.5 w-3.5 mr-1" />
          <span>Add to Team Pit</span>
        </ContextMenuItem>
        <ContextMenuItem onSelect={onClose} className="text-destructive focus:text-destructive">
          <X className="h-3.5 w-3.5 mr-1" />
          <span>Close Workspace</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

interface TabRenameInputProps {
  initialValue: string
  onCommit: (name: string) => void
  onCancel: () => void
}

/** Inline text input for renaming a workspace tab. */
function TabRenameInput({ initialValue, onCommit, onCancel }: TabRenameInputProps): ReactElement {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)
  const doneRef = useRef(false)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
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
      onClick={(e) => e.stopPropagation()}
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
      className="w-full rounded border border-primary/50 bg-background px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-primary font-mono"
    />
  )
}
