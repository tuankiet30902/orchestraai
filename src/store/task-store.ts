import { create } from 'zustand'
import { AgentTask, TaskStatus, createTask, updateTaskStatus } from '@/lib/task-board'

interface TaskState {
  tasks: Record<string, AgentTask>
}

interface TaskActions {
  addTask: (title: string, options?: Partial<Omit<AgentTask, 'id' | 'title' | 'createdAt' | 'updatedAt'>>) => string
  setTaskStatus: (taskId: string, status: TaskStatus) => void
  setTaskDetail: (taskId: string, detail: string) => void
  assignTask: (taskId: string, agentId?: string, terminalId?: string, branch?: string) => void
  removeTask: (taskId: string) => void
  allTasks: () => AgentTask[]
}

const DEFAULT_TASKS: AgentTask[] = [
  createTask('Implement responsive mobile navigation bar', {
    priority: 'high',
    detail: 'Add hamburger menu and drawer for screens under 768px'
  }),
  createTask('Add unit test suite for API endpoints', {
    status: 'in-progress',
    priority: 'medium',
    detail: 'Achieve >85% code coverage on auth routes'
  }),
  createTask('Optimize bundle size & chunk splitting', {
    status: 'done',
    priority: 'low'
  })
]

export const useTaskStore = create<TaskState & TaskActions>((set, get) => ({
  tasks: Object.fromEntries(DEFAULT_TASKS.map((t) => [t.id, t])),

  addTask: (title, options) => {
    const task = createTask(title, options)
    set((s) => ({ tasks: { ...s.tasks, [task.id]: task } }))
    return task.id
  },

  setTaskStatus: (taskId, status) => {
    set((s) => {
      const task = s.tasks[taskId]
      if (!task || task.status === status) return s
      return {
        tasks: {
          ...s.tasks,
          [taskId]: updateTaskStatus(task, status)
        }
      }
    })
  },

  setTaskDetail: (taskId, detail) => {
    set((s) => {
      const task = s.tasks[taskId]
      if (!task) return s
      return {
        tasks: {
          ...s.tasks,
          [taskId]: { ...task, detail, updatedAt: new Date().toISOString() }
        }
      }
    })
  },

  assignTask: (taskId, agentId, terminalId, branch) => {
    set((s) => {
      const task = s.tasks[taskId]
      if (!task) return s
      return {
        tasks: {
          ...s.tasks,
          [taskId]: {
            ...task,
            assignedAgent: agentId,
            terminalId,
            worktreeBranch: branch,
            status: 'in-progress',
            updatedAt: new Date().toISOString()
          }
        }
      }
    })
  },

  removeTask: (taskId) => {
    set((s) => {
      if (!s.tasks[taskId]) return s
      const { [taskId]: _removed, ...rest } = s.tasks
      return { tasks: rest }
    })
  },

  allTasks: () => {
    return Object.values(get().tasks).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }
}))
