import { describe, it, expect } from 'vitest'
import {
  DEFAULT_NAVBAR_VISIBLE,
  DEFAULT_NAVBAR_WIDTH,
  MIN_NAVBAR_WIDTH,
  MAX_NAVBAR_WIDTH,
  NAVBAR_VISIBILITY_STORAGE_KEY,
  NAVBAR_WIDTH_STORAGE_KEY,
  readStoredNavbarVisible,
  readStoredNavbarWidth,
  storeNavbarVisible,
  storeNavbarWidth,
  type NavbarVisibilityStorage
} from './navbar-visibility'

/** An in-memory NavbarVisibilityStorage backed by a plain object. */
function fakeStorage(initial: Record<string, string> = {}): NavbarVisibilityStorage {
  const data: Record<string, string> = { ...initial }
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value
    }
  }
}

describe('DEFAULT_NAVBAR_VISIBLE', () => {
  it('is true (first-run users see the sidebar)', () => {
    expect(DEFAULT_NAVBAR_VISIBLE).toBe(true)
  })
})

describe('readStoredNavbarVisible', () => {
  it('returns DEFAULT_NAVBAR_VISIBLE when nothing is stored', () => {
    expect(readStoredNavbarVisible(fakeStorage())).toBe(DEFAULT_NAVBAR_VISIBLE)
  })

  it('returns DEFAULT_NAVBAR_VISIBLE for an invalid stored value', () => {
    expect(
      readStoredNavbarVisible(fakeStorage({ [NAVBAR_VISIBILITY_STORAGE_KEY]: 'banana' }))
    ).toBe(DEFAULT_NAVBAR_VISIBLE)
  })

  it('returns true when storage holds "true"', () => {
    expect(
      readStoredNavbarVisible(fakeStorage({ [NAVBAR_VISIBILITY_STORAGE_KEY]: 'true' }))
    ).toBe(true)
  })

  it('returns false when storage holds "false"', () => {
    expect(
      readStoredNavbarVisible(fakeStorage({ [NAVBAR_VISIBILITY_STORAGE_KEY]: 'false' }))
    ).toBe(false)
  })
})

describe('storeNavbarVisible', () => {
  it('persists true under the storage key', () => {
    const storage = fakeStorage()
    storeNavbarVisible(storage, true)
    expect(storage.getItem(NAVBAR_VISIBILITY_STORAGE_KEY)).toBe('true')
  })

  it('persists false under the storage key', () => {
    const storage = fakeStorage()
    storeNavbarVisible(storage, false)
    expect(storage.getItem(NAVBAR_VISIBILITY_STORAGE_KEY)).toBe('false')
  })
})

describe('readStoredNavbarWidth and storeNavbarWidth', () => {
  it('defaults to DEFAULT_NAVBAR_WIDTH when unset', () => {
    expect(readStoredNavbarWidth(fakeStorage())).toBe(DEFAULT_NAVBAR_WIDTH)
  })

  it('reads valid stored width', () => {
    const storage = fakeStorage({ [NAVBAR_WIDTH_STORAGE_KEY]: '320' })
    expect(readStoredNavbarWidth(storage)).toBe(320)
  })

  it('falls back to default on invalid or out-of-range width', () => {
    expect(readStoredNavbarWidth(fakeStorage({ [NAVBAR_WIDTH_STORAGE_KEY]: 'abc' }))).toBe(DEFAULT_NAVBAR_WIDTH)
    expect(readStoredNavbarWidth(fakeStorage({ [NAVBAR_WIDTH_STORAGE_KEY]: '50' }))).toBe(DEFAULT_NAVBAR_WIDTH)
    expect(readStoredNavbarWidth(fakeStorage({ [NAVBAR_WIDTH_STORAGE_KEY]: '9999' }))).toBe(DEFAULT_NAVBAR_WIDTH)
  })

  it('clamps width when storing', () => {
    const storage = fakeStorage()
    storeNavbarWidth(storage, 300)
    expect(readStoredNavbarWidth(storage)).toBe(300)

    storeNavbarWidth(storage, 100) // below min
    expect(readStoredNavbarWidth(storage)).toBe(MIN_NAVBAR_WIDTH)

    storeNavbarWidth(storage, 900) // above max
    expect(readStoredNavbarWidth(storage)).toBe(MAX_NAVBAR_WIDTH)
  })
})
