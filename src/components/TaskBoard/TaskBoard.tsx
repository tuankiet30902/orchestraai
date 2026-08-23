// src/components/TaskBoard/TaskBoard.tsx
import { useState, type ReactElement } from 'react'
import { Plus, Trash2, ArrowRight, GripVertical } from 'lucide-react'
import { useTaskStore } from '@/store/task-store'
import { KANBAN_COLUMNS, TaskStatus, TaskPriority, groupByStatus } from '@/lib/task-board'
import { Button } from '@/components/ui/button'

const PRIORITY_BADGE: Record<TaskPriority, { label: string; className: string }> = {
  high: { label: 'High', className: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  medium: { label: 'Med', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  low: { label: 'Low', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
}

function TaskCard({ taskId }: { taskId: string }): ReactElement | null {
  const task = useTaskStore((s) => s.tasks[taskId])
  const setTaskStatus = useTaskStore((s) => s.setTaskStatus)
  const removeTask = useTaskStore((s) => s.removeTask)

  if (!task) return null

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
      className="group relative flex flex-col gap-1.5 rounded-lg border border-border bg-card p-2.5 shadow-xs hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex items-start justify-between gap-1.5">
        <span className="text-xs font-medium text-foreground leading-snug flex-1">
          {task.title}
        </span>
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/80 shrink-0" />
      </div>

      {task.detail && (
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
          {task.detail}
        </p>
      )}

      <div className="flex items-center justify-between pt-1 text-[10px] border-t border-border/40 mt-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`rounded px-1.5 py-0.2 font-semibold border ${PRIORITY_BADGE[task.priority].className}`}
          >
            {PRIORITY_BADGE[task.priority].label}
          </span>
          {task.assignedAgent && (
            <span className="rounded bg-muted px-1.5 py-0.2 text-muted-foreground font-mono">
              @{task.assignedAgent}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setTaskStatus(task.id, nextStatus())}
            title="Advance status"
            className="rounded p-1 text-primary hover:bg-primary/10 transition-colors"
          >
            <ArrowRight className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => removeTask(task.id)}
            title="Delete task"
            className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function TaskBoard(): ReactElement {
  const allTasks = useTaskStore((s) => s.allTasks())
  const addTask = useTaskStore((s) => s.addTask)

  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium')
  const [showAddForm, setShowAddForm] = useState(false)

  const grouped = groupByStatus(allTasks)

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    addTask(newTitle.trim(), { priority: newPriority, status: 'backlog' })
    setNewTitle('')
    setShowAddForm(false)
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2 shrink-0 bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Kanban Task Board
          </span>
          <span className="rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-mono font-bold">
            {allTasks.length}
          </span>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-1"
        >
          <Plus className="h-3 w-3" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <form onSubmit={handleCreateTask} className="border-b border-border bg-card p-3 space-y-2 shrink-0">
          <input
            type="text"
            placeholder="Task title (e.g. Implement user authentication)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] text-muted-foreground">Priority:</span>
              {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPriority(p)}
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase transition-colors ${
                    newPriority === p
                      ? 'bg-primary text-primary-foreground'
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
                className="h-6 text-xs text-muted-foreground"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-6 text-xs bg-primary text-primary-foreground">
                Add
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Columns Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 h-full min-w-[640px]">
          {KANBAN_COLUMNS.map((col) => {
            const tasksInCol = grouped[col.status] ?? []
            return (
              <div
                key={col.status}
                className="flex flex-col rounded-lg border border-border/80 bg-muted/15 p-2 h-full overflow-hidden"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/40 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold ${col.color}`}>
                      {col.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {tasksInCol.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 overflow-y-auto pt-2 space-y-2 pr-0.5">
                  {tasksInCol.map((task) => (
                    <TaskCard key={task.id} taskId={task.id} />
                  ))}
                  {tasksInCol.length === 0 && (
                    <div className="flex h-24 items-center justify-center rounded border border-dashed border-border/50 text-[11px] text-muted-foreground/60 italic">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
