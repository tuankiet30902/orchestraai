/**
 * appearance.ts — Color mode, themes, and native application-wide zoom scaling.
 */
import { setWebviewZoom } from '@/tauri/window'

export type ColorMode = 'dark' | 'light' | 'system'

export type Style =
  | 'orchestra-amber'
  | 'vscode-dark'
  | 'tokyo-night'
  | 'emerald-dark'
  | 'violet-dark'
  | 'rose-dark'
  | 'orchestra-light'
  | 'vscode-light'
  | 'emerald-light'
  | 'violet-light'

export const DEFAULT_MODE: ColorMode = 'dark'
export const DEFAULT_STYLE: Style = 'orchestra-amber'
export const DEFAULT_ZOOM = 1.25
export const MIN_ZOOM = 0.6
export const MAX_ZOOM = 2.0
export const ZOOM_STEP = 0.1

export const APPEARANCE_STORAGE_KEY = 'cc-appearance-style'
export const COLOR_MODE_STORAGE_KEY = 'orchestron-color-mode'
export const ZOOM_STORAGE_KEY = 'orchestron-zoom-level'

export interface AppearanceStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export const DARK_STYLES: readonly Style[] = [
  'orchestra-amber',
  'vscode-dark',
  'tokyo-night',
  'emerald-dark',
  'violet-dark',
  'rose-dark'
] as const

export const LIGHT_STYLES: readonly Style[] = [
  'orchestra-light',
  'vscode-light',
  'emerald-light',
  'violet-light'
] as const

export const KNOWN_STYLES: readonly Style[] = [...DARK_STYLES, ...LIGHT_STYLES]

export function isStyle(value: string | null): value is Style {
  return value !== null && (KNOWN_STYLES as readonly string[]).includes(value)
}

export function isColorMode(value: string | null): value is ColorMode {
  return value === 'dark' || value === 'light' || value === 'system'
}

export function readStoredStyle(storage: AppearanceStorage): Style {
  const raw = storage.getItem(APPEARANCE_STORAGE_KEY)
  return isStyle(raw) ? raw : DEFAULT_STYLE
}

export function storeStyle(storage: AppearanceStorage, style: Style): void {
  storage.setItem(APPEARANCE_STORAGE_KEY, style)
}

export function readStoredColorMode(storage: AppearanceStorage): ColorMode {
  const raw = storage.getItem(COLOR_MODE_STORAGE_KEY)
  return isColorMode(raw) ? raw : DEFAULT_MODE
}

export function storeColorMode(storage: AppearanceStorage, mode: ColorMode): void {
  storage.setItem(COLOR_MODE_STORAGE_KEY, mode)
}

export function readStoredZoom(storage: AppearanceStorage): number {
  const raw = storage.getItem(ZOOM_STORAGE_KEY)
  if (!raw) return DEFAULT_ZOOM
  const parsed = parseFloat(raw)
  if (isNaN(parsed) || parsed < MIN_ZOOM || parsed > MAX_ZOOM) return DEFAULT_ZOOM
  return Math.round(parsed * 100) / 100
}

export function storeZoom(storage: AppearanceStorage, zoom: number): void {
  storage.setItem(ZOOM_STORAGE_KEY, String(Math.round(zoom * 100) / 100))
}

/** Check if the effective appearance is dark. */
export function isEffectiveDark(mode: ColorMode, style: Style): boolean {
  if (mode === 'light') return false
  if (mode === 'dark') return true
  // System mode:
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return !LIGHT_STYLES.includes(style)
}

/** Apply application-wide zoom scaling cleanly without CSS coordinate distortion. */
export function applyZoomToDOM(zoom: number): void {
  if (typeof document === 'undefined') return
  const rounded = Math.round(zoom * 100) / 100

  // 1. Completely remove CSS root.style.zoom (which distorts coordinates and breaks modals)
  const root = document.documentElement as HTMLElement & { style: CSSStyleDeclaration & { zoom?: string } }
  if (root.style.zoom) {
    root.style.zoom = ''
  }
  root.style.setProperty('--app-zoom', String(rounded))
  root.style.fontSize = `${14 * rounded}px`
  if (document.body) {
    document.body.style.fontSize = `${12 * rounded}px`
  }

  // 2. Apply native WebKit / WebView zoom factor if available
  void setWebviewZoom(rounded)

  // 3. Dispatch window resize so responsive containers & xterm fit gracefully
  if (typeof window !== 'undefined') {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'))
    })
  }
}

/** Apply clean attributes and classes to document element. */
export function applyAppearanceToDOM(mode: ColorMode, style: Style, zoom: number = DEFAULT_ZOOM): void {
  if (typeof document === 'undefined') return
  const isDark = isEffectiveDark(mode, style)
  const root = document.documentElement

  if (isDark) {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
  }

  root.setAttribute('data-theme', style)
  root.setAttribute('data-color-mode', mode)
  applyZoomToDOM(zoom)
}
