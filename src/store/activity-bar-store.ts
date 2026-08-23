// src/store/activity-bar-store.ts
import { create } from 'zustand'

export type ActivityTab = 'explorer' | 'files' | 'git' | 'pit'

interface ActivityBarState {
  activeTab: ActivityTab
  sidebarOpen: boolean
  sidebarWidth: number
  lastSavedWidth: number
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
  lastSavedWidth: 260,

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

  setSidebarOpen: (open) => {
    const { lastSavedWidth } = get()
    set({
      sidebarOpen: open,
      sidebarWidth: open ? lastSavedWidth : 0
    })
  },

  toggleSidebar: () => {
    const { sidebarOpen, lastSavedWidth } = get()
    const nextOpen = !sidebarOpen
    set({
      sidebarOpen: nextOpen,
      sidebarWidth: nextOpen ? lastSavedWidth : 0
    })
  },

  setSidebarWidth: (width) => {
    if (width < 100) {
      // Snapped to collapse
      set({ sidebarOpen: false })
    } else {
      const clamped = Math.max(160, Math.min(600, width))
      set({
        sidebarWidth: clamped,
        lastSavedWidth: clamped,
        sidebarOpen: true
      })
    }
  }
}))
