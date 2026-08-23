import { describe, it, expect } from 'vitest'
import { createTask, updateTaskStatus, groupByStatus, KANBAN_COLUMNS } from './task-board'

describe('task-board', () => {
  it('creates task with default backlog status', () => {
    const task = createTask('Fix bug in auth')
    expect(task.title).toBe('Fix bug in auth')
    expect(task.status).toBe('backlog')
    expect(task.priority).toBe('medium')
    expect(task.id).toBeDefined()
  })

  it('updates task status and timestamp', () => {
    const task = createTask('Build UI')
    const updated = updateTaskStatus(task, 'in-progress')
    expect(updated.status).toBe('in-progress')
    expect(updated.updatedAt).toBeDefined()
  })

  it('groups tasks by status accurately', () => {
    const t1 = createTask('T1', { status: 'backlog' })
    const t2 = createTask('T2', { status: 'in-progress' })
    const t3 = createTask('T3', { status: 'review' })
    const t4 = createTask('T4', { status: 'done' })

    const grouped = groupByStatus([t1, t2, t3, t4])
    expect(grouped.backlog).toHaveLength(1)
    expect(grouped['in-progress']).toHaveLength(1)
    expect(grouped.review).toHaveLength(1)
    expect(grouped.done).toHaveLength(1)
  })

  it('has 4 columns in KANBAN_COLUMNS', () => {
    expect(KANBAN_COLUMNS).toHaveLength(4)
  })
})
