import { create } from 'zustand'
import {
  DEFAULT_MODE,
  DEFAULT_STYLE,
  readStoredColorMode,
  readStoredStyle,
  storeColorMode,
  storeStyle,
  applyAppearanceToDOM,
  type ColorMode,
  type Style
} from '@/lib/appearance'

export interface AppearanceStore {
  mode: ColorMode
  style: Style
  setMode: (mode: ColorMode) => void
  setStyle: (style: Style) => void
}

/**
 * The active visual theme and dark/light mode.
 * Reads the persisted choice on first creation and writes every change back to localStorage and DOM.
 */
export const useAppearanceStore = create<AppearanceStore>((set, get) => {
  const initialMode =
    typeof window === 'undefined' ? DEFAULT_MODE : readStoredColorMode(window.localStorage)
  const initialStyle =
    typeof window === 'undefined' ? DEFAULT_STYLE : readStoredStyle(window.localStorage)

  // Initialize DOM attributes on startup
  if (typeof window !== 'undefined') {
    applyAppearanceToDOM(initialMode, initialStyle)
  }

  return {
    mode: initialMode,
    style: initialStyle,
    setMode: (mode) => {
      if (typeof window !== 'undefined') {
        storeColorMode(window.localStorage, mode)
        applyAppearanceToDOM(mode, get().style)
      }
      set({ mode })
    },
    setStyle: (style) => {
      if (typeof window !== 'undefined') {
        storeStyle(window.localStorage, style)
        applyAppearanceToDOM(get().mode, style)
      }
      set({ style })
    }
  }
})
