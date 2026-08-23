/**
 * command-detector.ts — Auto-detects running AI agent tools and commands from typed terminal input.
 *
 * When a user types `agy` or `claude` or `codex` in a plain terminal, this module identifies
 * the agent and produces its canonical template ID and human-friendly title.
 */

export interface DetectedAgent {
  agentId: string
  title: string
}

/** Map of command names / executable basenames to agent definitions. */
const COMMAND_TO_AGENT: Record<string, { agentId: string; title: string }> = {
  agy: { agentId: 'antigravity', title: 'Antigravity' },
  antigravity: { agentId: 'antigravity', title: 'Antigravity' },
  claude: { agentId: 'claude-code', title: 'Claude Code' },
  'claude-code': { agentId: 'claude-code', title: 'Claude Code' },
  codex: { agentId: 'codex', title: 'Codex' },
  opencode: { agentId: 'opencode', title: 'OpenCode' },
  grok: { agentId: 'grok', title: 'Grok' },
  deepseek: { agentId: 'deepseek', title: 'DeepSeek' }
}

/**
 * Parses a submitted command line and extracts the primary command executable.
 * Handles prefixes like `npx`, `bun x`, `pnpm dlx`, `sudo`, `env`, or path basenames (`/usr/local/bin/agy`).
 */
export function extractPrimaryCommand(commandLine: string): string {
  const trimmed = commandLine.trim()
  if (!trimmed) return ''

  // Split by whitespace while respecting basic CLI tokens
  const tokens = trimmed.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return ''

  // Skip common runner wrappers like `sudo`, `env`, `npx`, `bun x`, `pnpm dlx`
  let index = 0
  while (index < tokens.length) {
    const token = tokens[index]
    if (token === 'sudo' || token === 'env') {
      index++
      continue
    }
    if (token === 'npx' || token === 'pnpm dlx' || token === 'yarn dlx') {
      index++
      continue
    }
    if (token === 'bun' && index + 1 < tokens.length && tokens[index + 1] === 'x') {
      index += 2
      continue
    }
    break
  }

  const rawCmd = tokens[index] ?? tokens[0]
  // Extract basename if full path (e.g. /usr/local/bin/agy -> agy, ./bin/claude -> claude)
  const basename = rawCmd.split(/[/\\]/).pop() ?? rawCmd
  return basename.toLowerCase()
}

/**
 * Detects if a command line executes a known AI agent tool.
 * Returns the matching agentId and display title, or null.
 */
export function detectAgentFromCommandLine(commandLine: string): DetectedAgent | null {
  const primary = extractPrimaryCommand(commandLine)
  if (!primary) return null

  const match = COMMAND_TO_AGENT[primary]
  if (match) return match

  // Check scoped package names (e.g. @anthropic-ai/claude-code -> claude-code)
  if (primary.includes('claude-code') || primary.includes('@anthropic-ai/claude')) {
    return { agentId: 'claude-code', title: 'Claude Code' }
  }
  if (primary.includes('antigravity') || primary.includes('agy')) {
    return { agentId: 'antigravity', title: 'Antigravity' }
  }

  return null
}
