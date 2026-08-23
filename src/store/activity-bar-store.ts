// src/store/activity-bar-store.ts
import { create } from 'zustand'

export type ActivityTab = 'explorer' | 'files' | 'git' | 'pit'

interface ActivityBarState {
  activeTab: ActivityTab
  sidebarOpen: boolean
  sidebarWidth: number
}

interface ActivityBarActions {
  setActiveTab: (tab: ActivityTab) => void
  toggleTab: (tab: ActivityTab) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
}

export const useActivityBarStore = create<ActivityBarState & ActivityBarActions>((set, get) => ({
  activeTab: 'explorer',
  sidebarOpen: true,
  sidebarWidth: 260,

  setActiveTab: (tab) => {
    set({ activeTab: tab, sidebarOpen: true })
  },

  toggleTab: (tab) => {
    const current = get()
    if (current.activeTab === tab && current.sidebarOpen) {
      set({ sidebarOpen: false })
    } else {
      set({ activeTab: tab, sidebarOpen: true })
    }
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(180, Math.min(600, width)) })
}))
