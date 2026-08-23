import { describe, expect, it } from 'vitest'
import { extractPrimaryCommand, detectAgentFromCommandLine } from './command-detector'

describe('command-detector', () => {
  describe('extractPrimaryCommand', () => {
    it('handles simple commands', () => {
      expect(extractPrimaryCommand('agy')).toBe('agy')
      expect(extractPrimaryCommand('claude')).toBe('claude')
      expect(extractPrimaryCommand('codex start')).toBe('codex')
    })

    it('strips paths', () => {
      expect(extractPrimaryCommand('/opt/homebrew/bin/agy')).toBe('agy')
      expect(extractPrimaryCommand('./bin/claude --dangerously-skip-permissions')).toBe('claude')
      expect(extractPrimaryCommand('C:\\Users\\bin\\opencode.exe')).toBe('opencode.exe')
    })

    it('handles wrappers like sudo, env, npx', () => {
      expect(extractPrimaryCommand('sudo agy')).toBe('agy')
      expect(extractPrimaryCommand('npx @anthropic-ai/claude-code')).toBe('claude-code')
      expect(extractPrimaryCommand('bun x agy')).toBe('agy')
    })
  })

  describe('detectAgentFromCommandLine', () => {
    it('detects agy / antigravity', () => {
      expect(detectAgentFromCommandLine('agy')).toEqual({ agentId: 'antigravity', title: 'Antigravity' })
      expect(detectAgentFromCommandLine('agy start --workspace .')).toEqual({ agentId: 'antigravity', title: 'Antigravity' })
      expect(detectAgentFromCommandLine('/usr/local/bin/antigravity')).toEqual({ agentId: 'antigravity', title: 'Antigravity' })
    })

    it('detects claude', () => {
      expect(detectAgentFromCommandLine('claude')).toEqual({ agentId: 'claude-code', title: 'Claude Code' })
      expect(detectAgentFromCommandLine('claude --dangerously-skip-permissions')).toEqual({ agentId: 'claude-code', title: 'Claude Code' })
      expect(detectAgentFromCommandLine('npx @anthropic-ai/claude-code')).toEqual({ agentId: 'claude-code', title: 'Claude Code' })
    })

    it('detects codex, opencode, grok, deepseek', () => {
      expect(detectAgentFromCommandLine('codex')).toEqual({ agentId: 'codex', title: 'Codex' })
      expect(detectAgentFromCommandLine('opencode')).toEqual({ agentId: 'opencode', title: 'OpenCode' })
      expect(detectAgentFromCommandLine('grok')).toEqual({ agentId: 'grok', title: 'Grok' })
      expect(detectAgentFromCommandLine('deepseek')).toEqual({ agentId: 'deepseek', title: 'DeepSeek' })
    })

    it('returns null for generic shell commands', () => {
      expect(detectAgentFromCommandLine('ls -la')).toBeNull()
      expect(detectAgentFromCommandLine('git status')).toBeNull()
      expect(detectAgentFromCommandLine('cargo test')).toBeNull()
    })
  })
})
