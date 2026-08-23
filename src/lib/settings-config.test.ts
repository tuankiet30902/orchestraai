import { describe, it, expect } from 'vitest'
import {
  DEFAULT_APP_SETTINGS,
  SETTINGS_STORAGE_KEY,
  loadSettings,
  saveSettings,
  type StorageSurface
} from './settings-config'

function fakeStorage(initial: Record<string, string> = {}): StorageSurface {
  const map: Record<string, string> = { ...initial }
  return {
    getItem: (key) => (key in map ? map[key] : null),
    setItem: (key, val) => {
      map[key] = val
    },
    removeItem: (key) => {
      delete map[key]
    }
  }
}

describe('settings-config', () => {
  it('returns default settings when storage is empty', () => {
    const storage = fakeStorage()
    const settings = loadSettings(storage)
    expect(settings).toEqual(DEFAULT_APP_SETTINGS)
  })

  it('saves and reloads settings correctly', () => {
    const storage = fakeStorage()
    const custom = {
      ...DEFAULT_APP_SETTINGS,
      git: {
        ...DEFAULT_APP_SETTINGS.git,
        worktreeBranchPrefix: 'custom-prefix/'
      }
    }
    saveSettings(storage, custom)
    const loaded = loadSettings(storage)
    expect(loaded.git.worktreeBranchPrefix).toBe('custom-prefix/')
  })

  it('falls back gracefully on invalid json in storage', () => {
    const storage = fakeStorage({ [SETTINGS_STORAGE_KEY]: 'invalid json here' })
    const loaded = loadSettings(storage)
    expect(loaded).toEqual(DEFAULT_APP_SETTINGS)
  })
})
