import { describe, it, expect } from 'vitest'
import { isTerminalActive, getWorkspaceBusyInfo } from './terminate-guard'
import type { Workspace } from '@/store/app-store'

describe('terminate-guard', () => {
  describe('isTerminalActive', () => {
    it('returns true when agent state is working', () => {
      expect(isTerminalActive({ state: 'working', seen: true }, false)).toBe(true)
    })

    it('returns true when agent state is blocked on prompt', () => {
      expect(isTerminalActive({ state: 'blocked', seen: true }, false)).toBe(true)
    })

    it('returns true when terminal output is active even if agent state is unknown/idle', () => {
      expect(isTerminalActive({ state: 'idle', seen: true }, true)).toBe(true)
      expect(isTerminalActive(undefined, true)).toBe(true)
    })

    it('returns false when agent is idle and no output activity', () => {
      expect(isTerminalActive({ state: 'idle', seen: true }, false)).toBe(false)
      expect(isTerminalActive(undefined, false)).toBe(false)
      expect(isTerminalActive(undefined, undefined)).toBe(false)
    })
  })

  describe('getWorkspaceBusyInfo', () => {
    const mockWorkspace: Workspace = {
      id: 'ws-1',
      name: 'Project Alpha',
      cwd: '/test/dir',
      layout: {
        type: 'split',
        id: 'split-1',
        direction: 'horizontal',
        sizes: [50, 50],
        children: [
          { type: 'leaf', id: 'l1', terminalId: 't1', agentId: 'claude-code' },
          { type: 'leaf', id: 'l2', terminalId: 't2', agentId: 'antigravity' }
        ]
      },
      focusedLeafId: 'l1',
      broadcastActive: false,
      broadcastLeafIds: [],
      worktreeMode: false
    }

    it('identifies busy agents across workspace leaves', () => {
      const agentStates = {
        t1: { state: 'working' as const, seen: true },
        t2: { state: 'idle' as const, seen: true }
      }
      const activity = { t1: false, t2: false }
      const titles = { t1: 'Claude Code', t2: 'Antigravity' }
      const customTitles = {}

      const info = getWorkspaceBusyInfo(mockWorkspace, agentStates, activity, titles, customTitles)
      expect(info.isBusy).toBe(true)
      expect(info.busyAgents).toEqual(['Claude Code'])
    })

    it('returns isBusy false when all leaves are idle', () => {
      const agentStates = {
        t1: { state: 'idle' as const, seen: true },
        t2: { state: 'idle' as const, seen: true }
      }
      const activity = { t1: false, t2: false }
      const titles = {}
      const customTitles = {}

      const info = getWorkspaceBusyInfo(mockWorkspace, agentStates, activity, titles, customTitles)
      expect(info.isBusy).toBe(false)
      expect(info.busyAgents).toEqual([])
    })
  })
})
