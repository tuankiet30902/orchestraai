/**
 * task-board.ts — Task and Kanban model for agent tasks.
 * Pure TypeScript — no Tauri/React dependencies.
 */

export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface AgentTask {
  id: string
  title: string
  detail?: string
  status: TaskStatus
  priority: TaskPriority
  assignedAgent?: string
  terminalId?: string
  worktreeBranch?: string
  createdAt: string
  updatedAt: string
}

export const KANBAN_COLUMNS: Array<{ status: TaskStatus; label: string; color: string }> = [
  { status: 'backlog', label: 'Backlog', color: 'text-muted-foreground' },
  { status: 'in-progress', label: 'In Progress', color: 'text-amber-400' },
  { status: 'review', label: 'In Review', color: 'text-blue-400' },
  { status: 'done', label: 'Done', color: 'text-emerald-400' },
]

export function createTask(
  title: string,
  options?: Partial<Omit<AgentTask, 'id' | 'title' | 'createdAt' | 'updatedAt'>>
): AgentTask {
  const now = new Date().toISOString()
  return {
    id: `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    status: options?.status ?? 'backlog',
    priority: options?.priority ?? 'medium',
    detail: options?.detail,
    assignedAgent: options?.assignedAgent,
    terminalId: options?.terminalId,
    worktreeBranch: options?.worktreeBranch,
    createdAt: now,
    updatedAt: now,
  }
}

export function updateTaskStatus(task: AgentTask, status: TaskStatus): AgentTask {
  return {
    ...task,
    status,
    updatedAt: new Date().toISOString(),
  }
}

export function groupByStatus(tasks: AgentTask[]): Record<TaskStatus, AgentTask[]> {
  const result: Record<TaskStatus, AgentTask[]> = {
    backlog: [],
    'in-progress': [],
    review: [],
    done: [],
  }
  for (const t of tasks) {
    if (result[t.status]) {
      result[t.status].push(t)
    } else {
      result.backlog.push(t)
    }
  }
  return result
}
