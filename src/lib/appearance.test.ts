import { describe, it, expect } from 'vitest'
import {
  APPEARANCE_STORAGE_KEY,
  COLOR_MODE_STORAGE_KEY,
  ZOOM_STORAGE_KEY,
  DEFAULT_MODE,
  DEFAULT_STYLE,
  readStoredColorMode,
  readStoredStyle,
  readStoredZoom,
  storeColorMode,
  storeStyle,
  storeZoom,
  isEffectiveDark,
  type AppearanceStorage
} from './appearance'

/** An in-memory AppearanceStorage backed by a plain object. */
function fakeStorage(initial: Record<string, string> = {}): AppearanceStorage {
  const data: Record<string, string> = { ...initial }
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value
    }
  }
}

describe('DEFAULT_STYLE and DEFAULT_MODE', () => {
  it('is "orchestra-amber" and "dark"', () => {
    expect(DEFAULT_STYLE).toBe('orchestra-amber')
    expect(DEFAULT_MODE).toBe('dark')
  })
})

describe('readStoredStyle and storeStyle', () => {
  it('returns DEFAULT_STYLE when nothing is stored', () => {
    expect(readStoredStyle(fakeStorage())).toBe(DEFAULT_STYLE)
  })

  it('returns DEFAULT_STYLE for an unknown stored value', () => {
    expect(readStoredStyle(fakeStorage({ [APPEARANCE_STORAGE_KEY]: 'banana' }))).toBe(DEFAULT_STYLE)
  })

  it('returns the stored style', () => {
    expect(readStoredStyle(fakeStorage({ [APPEARANCE_STORAGE_KEY]: 'vscode-dark' }))).toBe('vscode-dark')
    expect(readStoredStyle(fakeStorage({ [APPEARANCE_STORAGE_KEY]: 'orchestra-light' }))).toBe('orchestra-light')
  })

  it('persists the style under the storage key', () => {
    const storage = fakeStorage()
    storeStyle(storage, 'tokyo-night')
    expect(storage.getItem(APPEARANCE_STORAGE_KEY)).toBe('tokyo-night')
  })
})

describe('readStoredColorMode and storeColorMode', () => {
  it('reads and writes mode correctly', () => {
    const storage = fakeStorage()
    expect(readStoredColorMode(storage)).toBe('dark')
    storeColorMode(storage, 'light')
    expect(readStoredColorMode(storage)).toBe('light')
    expect(storage.getItem(COLOR_MODE_STORAGE_KEY)).toBe('light')
  })
})

describe('isEffectiveDark', () => {
  it('identifies dark and light modes correctly', () => {
    expect(isEffectiveDark('dark', 'orchestra-amber')).toBe(true)
    expect(isEffectiveDark('light', 'orchestra-amber')).toBe(false)
    expect(isEffectiveDark('light', 'orchestra-light')).toBe(false)
  })
})

describe('readStoredZoom and storeZoom', () => {
  it('defaults to 1.0 when nothing stored', () => {
    const storage = fakeStorage()
    expect(readStoredZoom(storage)).toBe(1.0)
  })

  it('reads and writes zoom levels correctly within bounds', () => {
    const storage = fakeStorage()
    storeZoom(storage, 1.25)
    expect(readStoredZoom(storage)).toBe(1.25)
    expect(storage.getItem(ZOOM_STORAGE_KEY)).toBe('1.25')
  })

  it('falls back to default on invalid or out-of-bound zoom values', () => {
    expect(readStoredZoom(fakeStorage({ [ZOOM_STORAGE_KEY]: 'invalid' }))).toBe(1.0)
    expect(readStoredZoom(fakeStorage({ [ZOOM_STORAGE_KEY]: '0.1' }))).toBe(1.0)
    expect(readStoredZoom(fakeStorage({ [ZOOM_STORAGE_KEY]: '10.0' }))).toBe(1.0)
  })
})
