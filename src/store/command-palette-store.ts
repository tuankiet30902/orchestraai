// src/store/command-palette-store.ts
import { create } from 'zustand'

interface CommandPaletteState {
  isOpen: boolean
  initialQuery: string
  open: (initialQuery?: string) => void
  close: () => void
  toggle: () => void
}

export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  isOpen: false,
  initialQuery: '',
  open: (initialQuery = '') => set({ isOpen: true, initialQuery }),
  close: () => set({ isOpen: false, initialQuery: '' }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen, initialQuery: '' }))
}))
