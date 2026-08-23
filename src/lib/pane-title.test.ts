import { describe, it, expect } from 'vitest'
import { resolvePaneTitle, cleanTerminalTitle } from './pane-title'

describe('cleanTerminalTitle', () => {
  it('strips leading asterisk and whitespace', () => {
    expect(cleanTerminalTitle('* Claude Code')).toBe('Claude Code')
    expect(cleanTerminalTitle('* Claude Code (working)')).toBe('Claude Code (working)')
  })

  it('strips unicode asterisk and braille spinner artifacts', () => {
    expect(cleanTerminalTitle('✳ Claude Code')).toBe('Claude Code')
    expect(cleanTerminalTitle('⠋ Claude Code')).toBe('Claude Code')
    expect(cleanTerminalTitle('✶ Antigravity')).toBe('Antigravity')
    expect(cleanTerminalTitle('● Server running')).toBe('Server running')
  })

  it('preserves clean titles', () => {
    expect(cleanTerminalTitle('Claude Code')).toBe('Claude Code')
    expect(cleanTerminalTitle('Antigravity')).toBe('Antigravity')
    expect(cleanTerminalTitle('npm run dev')).toBe('npm run dev')
  })
})

describe('resolvePaneTitle', () => {
  it('uses the custom title over dynamic title and agent name', () => {
    expect(resolvePaneTitle('claude-code', 'Dynamic Title', 'My Custom Pane')).toBe('My Custom Pane')
  })

  it('strips leading asterisk artifact on dynamic titles', () => {
    expect(resolvePaneTitle('claude-code', '* Claude Code', undefined)).toBe('Claude Code')
    expect(resolvePaneTitle('claude-code', '✳ Claude Code', undefined)).toBe('Claude Code')
  })

  it('uses the dynamic title when custom title is undefined or whitespace', () => {
    expect(resolvePaneTitle('claude-code', 'Fixing the parser', undefined)).toBe('Fixing the parser')
    expect(resolvePaneTitle('claude-code', 'Fixing the parser', '   ')).toBe('Fixing the parser')
  })

  it('trims surrounding whitespace on the dynamic and custom titles', () => {
    expect(resolvePaneTitle('claude-code', '  Building  ', undefined)).toBe('Building')
    expect(resolvePaneTitle('claude-code', undefined, '  Custom Build  ')).toBe('Custom Build')
  })

  it('falls back to the agent name when both titles are undefined or blank', () => {
    expect(resolvePaneTitle('claude-code', undefined, undefined)).toBe('Claude Code')
    expect(resolvePaneTitle('terminal', '   ', '')).toBe('Terminal')
    expect(resolvePaneTitle('antigravity', undefined, undefined)).toBe('Antigravity')
  })

  it('resolves an unknown agent id via the default template', () => {
    expect(resolvePaneTitle('no-such-agent', undefined, undefined)).toBe('Terminal')
  })
})
