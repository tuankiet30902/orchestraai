import { describe, expect, it } from 'vitest'
import {
  EVERYONE,
  composerTargets,
  reconcileTarget,
  validateComposer,
  type ComposerMember
} from './war-room-composer'

const agent = (terminalId: string, name: string): ComposerMember => ({
  terminalId, name, agentId: 'claude-code', connected: true
})
const shell = (terminalId: string, name: string): ComposerMember => ({
  terminalId, name, agentId: null, connected: true
})
const pending = (terminalId: string, name: string): ComposerMember => ({
  terminalId, name, agentId: 'codex', connected: false
})

describe('composerTargets', () => {
  it('offers Everyone plus every member for probe', () => {
    const rows = composerTargets([agent('t1', 'Claude'), pending('t2', 'Codex')], 'probe')
    expect(rows.map((r) => r.id)).toEqual([EVERYONE, 't1', 't2'])
    expect(rows[0].disabled).toBeNull()
    expect(rows[1].disabled).toBeNull()
  })

  it('offers members for execute', () => {
    const rows = composerTargets([agent('t1', 'Claude'), shell('t2', 'bash')], 'execute')
    expect(rows.map((r) => r.id)).toEqual(['t1', 't2'])
    expect(rows[0].disabled).toBeNull()
  })
})

describe('validateComposer', () => {
  const members = [agent('t1', 'Claude'), shell('t2', 'bash'), pending('t3', 'Codex')]

  it('rejects blank and whitespace-only text', () => {
    expect(validateComposer({ text: '   \n ', targetId: EVERYONE, mode: 'probe', members })).toEqual({
      ok: false, reason: 'Message is empty.'
    })
  })

  it('accepts a probe broadcast when members exist', () => {
    expect(validateComposer({ text: 'hi', targetId: EVERYONE, mode: 'probe', members }).ok).toBe(true)
  })

  it('rejects a broadcast into a room with nobody', () => {
    const r = validateComposer({ text: 'hi', targetId: EVERYONE, mode: 'probe', members: [] })
    expect(r).toEqual({ ok: false, reason: 'No members in the Orchestra Pit yet.' })
  })

  it('rejects an execute broadcast', () => {
    const r = validateComposer({ text: 'hi', targetId: EVERYONE, mode: 'execute', members })
    expect(r.ok).toBe(false)
  })

  it('accepts targets in the room', () => {
    expect(validateComposer({ text: 'hi', targetId: 't1', mode: 'probe', members }).ok).toBe(true)
    expect(validateComposer({ text: 'hi', targetId: 't2', mode: 'execute', members }).ok).toBe(true)
  })
})

describe('reconcileTarget', () => {
  const members = [agent('t1', 'Claude')]

  it('keeps a still-valid selection', () => {
    expect(reconcileTarget('t1', members, 'probe')).toBe('t1')
  })

  it('falls back to Everyone when the selected member leaves a probe', () => {
    expect(reconcileTarget('gone', members, 'probe')).toBe(EVERYONE)
  })

  it('falls back to the first usable agent when switching to execute', () => {
    expect(reconcileTarget(EVERYONE, members, 'execute')).toBe('t1')
  })
})
