import { create } from 'zustand'
import {
  DEFAULT_NAVBAR_VISIBLE,
  DEFAULT_NAVBAR_WIDTH,
  MIN_NAVBAR_WIDTH,
  MAX_NAVBAR_WIDTH,
  readStoredNavbarVisible,
  readStoredNavbarWidth,
  storeNavbarVisible,
  storeNavbarWidth
} from '@/lib/navbar-visibility'

export interface NavbarVisibilityStore {
  visible: boolean
  width: number
  toggle: () => void
  setWidth: (width: number) => void
  resetWidth: () => void
}

/**
 * Whether the left Navbar is currently expanded, and its resizable width.
 * Reads the persisted choice on first creation and writes every change back to localStorage.
 */
export const useNavbarVisibilityStore = create<NavbarVisibilityStore>((set) => {
  const initialVisible =
    typeof window === 'undefined'
      ? DEFAULT_NAVBAR_VISIBLE
      : readStoredNavbarVisible(window.localStorage)
  const initialWidth =
    typeof window === 'undefined'
      ? DEFAULT_NAVBAR_WIDTH
      : readStoredNavbarWidth(window.localStorage)

  return {
    visible: initialVisible,
    width: initialWidth,
    toggle: () =>
      set((s) => {
        const visible = !s.visible
        storeNavbarVisible(window.localStorage, visible)
        return { visible }
      }),
    setWidth: (width: number) =>
      set(() => {
        const clamped = Math.max(MIN_NAVBAR_WIDTH, Math.min(MAX_NAVBAR_WIDTH, width))
        storeNavbarWidth(window.localStorage, clamped)
        return { width: clamped }
      }),
    resetWidth: () =>
      set(() => {
        storeNavbarWidth(window.localStorage, DEFAULT_NAVBAR_WIDTH)
        return { width: DEFAULT_NAVBAR_WIDTH }
      })
  }
})
