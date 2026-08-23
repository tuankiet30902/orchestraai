/**
 * Rules for the Moderator composer, kept out of the component so they can be
 * unit-tested. These MIRROR the server rules in src-tauri/src/warroom.rs
 * (`WarRoom::send`) so the UI can disable a send and say why without a round
 * trip — the server stays authoritative.
 */
import type { WarRoomMode } from '@/tauri/warroom'

/** Sentinel for the broadcast row; sent to Rust as `to: null`. */
export const EVERYONE = '__everyone__'

/** Structural shape of a roster entry */
export interface ComposerMember {
  terminalId: string
  name: string
  agentId: string | null
  connected: boolean
}

export interface ComposerTarget {
  id: string
  label: string
  /** Non-null = the row is disabled and this is the reason (shown as its tooltip). */
  disabled: string | null
}

export function composerTargets(members: ComposerMember[], mode: WarRoomMode): ComposerTarget[] {
  const rows: ComposerTarget[] = members.map((m) => ({
    id: m.terminalId,
    label: m.name,
    disabled: null
  }))
  if (mode === 'execute') return rows
  return [{ id: EVERYONE, label: 'Everyone', disabled: null }, ...rows]
}

export type ComposerValidation = { ok: true } | { ok: false; reason: string }

export function validateComposer(input: {
  text: string
  targetId: string
  mode: WarRoomMode
  members: ComposerMember[]
}): ComposerValidation {
  if (input.text.trim() === '') return { ok: false, reason: 'Message is empty.' }
  if (input.targetId === EVERYONE) {
    if (input.mode === 'execute') {
      return { ok: false, reason: 'Execute needs one target — a prompt runs in exactly one terminal.' }
    }
    if (input.members.length === 0) {
      return { ok: false, reason: 'No members in the Orchestra Pit yet.' }
    }
    return { ok: true }
  }
  const target = composerTargets(input.members, input.mode).find((t) => t.id === input.targetId)
  if (target === undefined) return { ok: false, reason: 'That member is no longer in the Orchestra Pit.' }
  if (target.disabled !== null) return { ok: false, reason: target.disabled }
  return { ok: true }
}

/**
 * Keep the selection valid as membership changes or the mode flips.
 */
export function reconcileTarget(
  targetId: string,
  members: ComposerMember[],
  mode: WarRoomMode
): string {
  const rows = composerTargets(members, mode)
  const current = rows.find((t) => t.id === targetId)
  if (current !== undefined && current.disabled === null) return targetId
  return rows.find((t) => t.disabled === null)?.id ?? EVERYONE
}
