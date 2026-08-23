// src/store/mission-control-store.ts
import { create } from 'zustand'

export type EventSeverity = 'info' | 'success' | 'warning' | 'error'
export type EventCategory = 'agent' | 'git' | 'task' | 'pit' | 'token' | 'system'

export interface MissionEvent {
  id: string
  timestamp: string
  title: string
  detail?: string
  agentId?: string
  terminalId?: string
  category: EventCategory
  severity: EventSeverity
}

interface MissionControlState {
  events: MissionEvent[]
  drawerOpen: boolean
  activeFilter: EventCategory | 'all'
}

interface MissionControlActions {
  addEvent: (event: Omit<MissionEvent, 'id' | 'timestamp'>) => void
  setDrawerOpen: (open: boolean) => void
  toggleDrawer: () => void
  setActiveFilter: (filter: EventCategory | 'all') => void
  clearEvents: () => void
}

const INITIAL_EVENTS: MissionEvent[] = [
  {
    id: 'evt-init-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    title: 'Workspace Initialized',
    detail: 'All PTY subsystems and MCP communication channels ready.',
    category: 'system',
    severity: 'success'
  },
  {
    id: 'evt-init-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    title: 'Orchestra Pit Channel Opened',
    detail: 'Peer-to-peer agent collaboration room is active.',
    category: 'pit',
    severity: 'info'
  }
]

export const useMissionControlStore = create<MissionControlState & MissionControlActions>((set) => ({
  events: INITIAL_EVENTS,
  drawerOpen: false,
  activeFilter: 'all',

  addEvent: (evt) => {
    const newEntry: MissionEvent = {
      id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...evt
    }
    set((s) => ({
      // Keep up to 250 recent events
      events: [newEntry, ...s.events].slice(0, 250)
    }))
  },

  setDrawerOpen: (open) => set({ drawerOpen: open }),

  toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),

  setActiveFilter: (activeFilter) => set({ activeFilter }),

  clearEvents: () => set({ events: [] })
}))
