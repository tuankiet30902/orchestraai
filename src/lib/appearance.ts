/**
 * appearance.ts — Color mode (dark/light/system) and clean neutral theme management.
 */

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

export const APPEARANCE_STORAGE_KEY = 'cc-appearance-style'
export const COLOR_MODE_STORAGE_KEY = 'orchestraai-color-mode'

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

/** Apply clean attributes and classes to document element. */
export function applyAppearanceToDOM(mode: ColorMode, style: Style): void {
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
}
