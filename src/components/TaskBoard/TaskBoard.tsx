// src/components/TaskBoard/TaskBoard.tsx
import { useState, type ReactElement } from 'react'
import { Plus, Trash2, ArrowRight, GripVertical, CheckSquare } from 'lucide-react'
import { useTaskStore } from '@/store/task-store'
import { KANBAN_COLUMNS, TaskStatus, TaskPriority, groupByStatus, type AgentTask } from '@/lib/task-board'
import { Button } from '@/components/ui/button'

const STATUS_LABELS: Record<TaskStatus, { label: string; desc: string }> = {
  backlog: { label: 'Backlog', desc: 'Tasks to do' },
  'in-progress': { label: 'In Progress', desc: 'Agents working' },
  review: { label: 'In Review', desc: 'Ready to verify' },
  done: { label: 'Done', desc: 'Completed' }
}

const PRIORITY_BADGES: Record<TaskPriority, { label: string; className: string }> = {
  high: { label: 'HIGH', className: 'bg-muted text-foreground font-semibold border-border' },
  medium: { label: 'MED', className: 'bg-muted/60 text-muted-foreground border-border/80' },
  low: { label: 'LOW', className: 'bg-muted/30 text-muted-foreground/70 border-border/40' }
}

function TaskCard({ task }: { task: AgentTask }): ReactElement {
  const setTaskStatus = useTaskStore((s) => s.setTaskStatus)
  const removeTask = useTaskStore((s) => s.removeTask)

  const STATUS_ORDER: TaskStatus[] = ['backlog', 'in-progress', 'review', 'done']
  const nextStatus = (): TaskStatus => {
    const idx = STATUS_ORDER.indexOf(task.status)
    return STATUS_ORDER[(idx + 1) % STATUS_ORDER.length]
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      'application/orchestraai-task',
      JSON.stringify({
        id: task.id,
        title: task.title,
        detail: task.detail,
        priority: task.priority
      })
    )
    e.dataTransfer.setData('text/plain', `Task: ${task.title}\n${task.detail ?? ''}`)
    e.dataTransfer.effectAllowed = 'copyMove'
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group relative flex flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-xs hover:border-foreground/40 hover:bg-accent/20 transition-all cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-foreground leading-snug flex-1 break-words">
          {task.title}
        </span>
        <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0" />
      </div>

      {task.detail && (
        <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed break-words">
          {task.detail}
        </p>
      )}

      <div className="flex items-center justify-between pt-1.5 border-t border-border/40 text-[10px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-[9px] border ${PRIORITY_BADGES[task.priority].className}`}
          >
            {PRIORITY_BADGES[task.priority].label}
          </span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground font-medium uppercase text-[9px]">
            {STATUS_LABELS[task.status].label}
          </span>
          {task.assignedAgent && (
            <span className="rounded bg-muted/80 px-1.5 py-0.5 text-foreground font-mono text-[9px] truncate max-w-[100px]">
              @{task.assignedAgent}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={() => setTaskStatus(task.id, nextStatus())}
            title={`Advance to ${STATUS_LABELS[nextStatus()].label}`}
            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => removeTask(task.id)}
            title="Delete task"
            className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function TaskBoard({ isModal = false }: { isModal?: boolean }): ReactElement {
  const allTasks = useTaskStore((s) => s.allTasks())
  const addTask = useTaskStore((s) => s.addTask)

  const [newTitle, setNewTitle] = useState('')
  const [newDetail, setNewDetail] = useState('')
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium')
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('all')

  const grouped = groupByStatus(allTasks)

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    const initialStatus = activeTab !== 'all' ? activeTab : 'backlog'
    addTask(newTitle.trim(), {
      priority: newPriority,
      status: initialStatus,
      detail: newDetail.trim() || undefined
    })
    setNewTitle('')
    setNewDetail('')
    setShowAddForm(false)
  }

  const tasksToDisplay =
    activeTab === 'all'
      ? allTasks
      : allTasks.filter((t) => t.status === activeTab)

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5 shrink-0 bg-muted/20">
        <div className="flex items-center gap-2 min-w-0">
          <CheckSquare className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider truncate">
            Task Board
          </span>
          <span className="rounded-full bg-muted border border-border px-2 py-0.2 text-[10px] font-mono font-medium text-foreground">
            {allTasks.length}
          </span>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="h-7 text-xs bg-foreground text-background hover:bg-foreground/90 font-medium gap-1 shrink-0"
        >
          <Plus className="h-3 w-3" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Add Task Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleCreateTask}
          className="border-b border-border bg-card p-3 space-y-2.5 shrink-0 shadow-md animate-in slide-in-from-top-1 duration-100"
        >
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-foreground">Task Title</label>
            <input
              type="text"
              placeholder="e.g. Build authentication endpoints..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-foreground">Details / Instructions (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Implement JWT verification in Rust backend..."
              value={newDetail}
              onChange={(e) => setNewDetail(e.target.value)}
              className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[10px] text-muted-foreground mr-1">Priority:</span>
              {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPriority(p)}
                  className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase transition-colors ${
                    newPriority === p
                      ? 'bg-foreground text-background shadow-xs'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="h-7 text-xs text-muted-foreground"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-7 text-xs bg-foreground text-background">
                Create
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Mode 1: Fullscreen Modal (4 Columns Side-by-Side) */}
      {isModal ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 h-full min-w-[760px]">
            {KANBAN_COLUMNS.map((col) => {
              const tasksInCol = grouped[col.status] ?? []
              return (
                <div
                  key={col.status}
                  className="flex flex-col rounded-lg border border-border bg-card/60 p-2.5 h-full overflow-hidden"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-border/40 shrink-0">
                    <span className="text-xs font-semibold text-foreground">
                      {col.label}
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                      {tasksInCol.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="flex-1 overflow-y-auto pt-2.5 space-y-2 pr-0.5">
                    {tasksInCol.map((t) => (
                      <TaskCard key={t.id} task={t} />
                    ))}
                    {tasksInCol.length === 0 && (
                      <div className="flex h-20 items-center justify-center rounded border border-dashed border-border/40 text-[11px] text-muted-foreground/60 italic">
                        Empty column
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* Mode 2: Sidebar Mode (Responsive Tab Filter + Vertical Cards) */
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          {/* Status Tabs Strip */}
          <div className="flex items-center gap-1 border-b border-border bg-muted/10 px-2 py-1.5 overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors shrink-0 ${
                activeTab === 'all'
                  ? 'bg-muted text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              All ({allTasks.length})
            </button>
            {KANBAN_COLUMNS.map((col) => (
              <button
                key={col.status}
                type="button"
                onClick={() => setActiveTab(col.status)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors shrink-0 ${
                  activeTab === col.status
                    ? 'bg-muted text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                {col.label} ({grouped[col.status]?.length ?? 0})
              </button>
            ))}
          </div>

          {/* Cards List Container */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {tasksToDisplay.length === 0 ? (
              <div className="flex h-36 flex-col items-center justify-center rounded-lg border border-dashed border-border/50 text-center p-4">
                <CheckSquare className="mb-1.5 h-6 w-6 text-muted-foreground/40" />
                <p className="text-xs font-semibold text-foreground">No tasks in this view</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Click <span className="font-semibold text-foreground">+ New Task</span> above to add one.
                </p>
              </div>
            ) : (
              tasksToDisplay.map((t) => <TaskCard key={t.id} task={t} />)
            )}
          </div>
        </div>
      )}
    </div>
  )
}
