/** localStorage key the sidebar visibility flag is persisted under. */
export const NAVBAR_VISIBILITY_STORAGE_KEY = 'cc-navbar-visible'

/** localStorage key the sidebar width is persisted under. */
export const NAVBAR_WIDTH_STORAGE_KEY = 'orchestron-navbar-width'

/** The visibility used on first run, before anything is persisted. */
export const DEFAULT_NAVBAR_VISIBLE = true

/** Default width for the left sidebar in pixels. */
export const DEFAULT_NAVBAR_WIDTH = 240
export const MIN_NAVBAR_WIDTH = 180
export const MAX_NAVBAR_WIDTH = 520

/** Minimal storage surface — lets tests pass a fake in place of localStorage. */
export interface NavbarVisibilityStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

/** Read the persisted visibility, defaulting for missing or invalid values. */
export function readStoredNavbarVisible(storage: NavbarVisibilityStorage): boolean {
  const raw = storage.getItem(NAVBAR_VISIBILITY_STORAGE_KEY)
  if (raw === 'true') return true
  if (raw === 'false') return false
  return DEFAULT_NAVBAR_VISIBLE
}

/** Persist the visibility as the literal string "true" / "false". */
export function storeNavbarVisible(storage: NavbarVisibilityStorage, visible: boolean): void {
  storage.setItem(NAVBAR_VISIBILITY_STORAGE_KEY, visible ? 'true' : 'false')
}

/** Read persisted sidebar width or default. */
export function readStoredNavbarWidth(storage: NavbarVisibilityStorage): number {
  const raw = storage.getItem(NAVBAR_WIDTH_STORAGE_KEY)
  if (!raw) return DEFAULT_NAVBAR_WIDTH
  const num = parseInt(raw, 10)
  if (isNaN(num) || num < MIN_NAVBAR_WIDTH || num > MAX_NAVBAR_WIDTH) {
    return DEFAULT_NAVBAR_WIDTH
  }
  return num
}

/** Persist sidebar width. */
export function storeNavbarWidth(storage: NavbarVisibilityStorage, width: number): void {
  const clamped = Math.max(MIN_NAVBAR_WIDTH, Math.min(MAX_NAVBAR_WIDTH, width))
  storage.setItem(NAVBAR_WIDTH_STORAGE_KEY, String(clamped))
}
