// src/store/appearance-store.ts
import { create } from 'zustand'
import {
  DEFAULT_MODE,
  DEFAULT_STYLE,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_STEP,
  readStoredColorMode,
  readStoredStyle,
  readStoredZoom,
  storeColorMode,
  storeStyle,
  storeZoom,
  applyAppearanceToDOM,
  applyZoomToDOM,
  type ColorMode,
  type Style
} from '@/lib/appearance'

export interface AppearanceStore {
  mode: ColorMode
  style: Style
  zoom: number
  setMode: (mode: ColorMode) => void
  setStyle: (style: Style) => void
  setZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
}

/**
 * The active visual theme, dark/light mode, and application-wide zoom scaling.
 * Reads the persisted choice on first creation and writes every change back to localStorage and DOM.
 */
export const useAppearanceStore = create<AppearanceStore>((set, get) => {
  const initialMode =
    typeof window === 'undefined' ? DEFAULT_MODE : readStoredColorMode(window.localStorage)
  const initialStyle =
    typeof window === 'undefined' ? DEFAULT_STYLE : readStoredStyle(window.localStorage)
  const initialZoom =
    typeof window === 'undefined' ? DEFAULT_ZOOM : readStoredZoom(window.localStorage)

  // Initialize DOM attributes on startup
  if (typeof window !== 'undefined') {
    applyAppearanceToDOM(initialMode, initialStyle, initialZoom)
  }

  return {
    mode: initialMode,
    style: initialStyle,
    zoom: initialZoom,

    setMode: (mode) => {
      if (typeof window !== 'undefined') {
        storeColorMode(window.localStorage, mode)
        applyAppearanceToDOM(mode, get().style, get().zoom)
      }
      set({ mode })
    },

    setStyle: (style) => {
      if (typeof window !== 'undefined') {
        storeStyle(window.localStorage, style)
        applyAppearanceToDOM(get().mode, style, get().zoom)
      }
      set({ style })
    },

    setZoom: (zoom) => {
      const clamped = Math.round(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)) * 100) / 100
      if (typeof window !== 'undefined') {
        storeZoom(window.localStorage, clamped)
        applyZoomToDOM(clamped)
      }
      set({ zoom: clamped })
    },

    zoomIn: () => {
      const next = Math.round((get().zoom + ZOOM_STEP) * 100) / 100
      get().setZoom(next)
    },

    zoomOut: () => {
      const next = Math.round((get().zoom - ZOOM_STEP) * 100) / 100
      get().setZoom(next)
    },

    resetZoom: () => {
      get().setZoom(DEFAULT_ZOOM)
    }
  }
})
