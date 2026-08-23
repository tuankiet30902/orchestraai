import { templateById } from '@/lib/templates'

/**
 * Strips OSC spinner prefixes, asterisks, bullet dots, and braille spinner artifacts
 * (e.g. `* Claude Code`, `✳ Claude Code`, `⠋ Claude Code`) so the displayed title is clean human text.
 */
export function cleanTerminalTitle(rawTitle: string): string {
  if (!rawTitle) return ''
  const cleaned = rawTitle
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/^[\u2733\u2734\u2735\u2736\u2800-\u28FF\u25D0-\u25D3*✻✶✳·●•\s\-_–—|]+/u, '')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned
}

/**
 * Resolves the display label for a terminal pane:
 * 1. User-customized title (`customTitle`), if manually set.
 * 2. Dynamic agent/command-set title (`dynamicTitle` / OSC / auto-detected).
 * 3. Default agent template name (`templateById(agentId).name`).
 */
export function resolvePaneTitle(
  agentId: string,
  dynamicTitle?: string,
  customTitle?: string
): string {
  const customCleaned = customTitle ? cleanTerminalTitle(customTitle) : ''
  if (customCleaned) return customCleaned

  const dynamicCleaned = dynamicTitle ? cleanTerminalTitle(dynamicTitle) : ''
  if (dynamicCleaned) return dynamicCleaned

  return templateById(agentId).name
}
