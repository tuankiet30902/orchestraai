import { describe, it, expect, beforeEach } from 'vitest'
import { useTerminalTitleStore } from './terminal-title-store'

describe('terminal-title-store', () => {
  beforeEach(() => useTerminalTitleStore.setState({ titles: {}, customTitles: {} }))

  it('sets a title for a terminal', () => {
    useTerminalTitleStore.getState().setTitle('t1', 'Fix login bug')
    expect(useTerminalTitleStore.getState().titles.t1).toBe('Fix login bug')
  })

  it('overwrites an existing title', () => {
    const { setTitle } = useTerminalTitleStore.getState()
    setTitle('t1', 'first')
    setTitle('t1', 'second')
    expect(useTerminalTitleStore.getState().titles.t1).toBe('second')
  })

  it('clears a title', () => {
    useTerminalTitleStore.getState().setTitle('t1', 'x')
    useTerminalTitleStore.getState().clearTitle('t1')
    expect('t1' in useTerminalTitleStore.getState().titles).toBe(false)
  })

  it('clearTitle on an unknown id is a no-op (same reference)', () => {
    const before = useTerminalTitleStore.getState().titles
    useTerminalTitleStore.getState().clearTitle('missing')
    expect(useTerminalTitleStore.getState().titles).toBe(before)
  })

  it('sets and clears a custom title', () => {
    const { setCustomTitle, clearCustomTitle } = useTerminalTitleStore.getState()
    setCustomTitle('t1', 'Backend Server')
    expect(useTerminalTitleStore.getState().customTitles.t1).toBe('Backend Server')

    clearCustomTitle('t1')
    expect('t1' in useTerminalTitleStore.getState().customTitles).toBe(false)
  })

  it('setting empty custom title clears it', () => {
    const { setCustomTitle } = useTerminalTitleStore.getState()
    setCustomTitle('t1', 'Backend')
    expect(useTerminalTitleStore.getState().customTitles.t1).toBe('Backend')

    setCustomTitle('t1', '   ')
    expect('t1' in useTerminalTitleStore.getState().customTitles).toBe(false)
  })
})
