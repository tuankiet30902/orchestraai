/**
 * orchestra-pit-join.ts — Programmatic joining of terminals and workspaces into Orchestra Pit.
 */
import { useAppStore } from '@/store/app-store'
import { useWarRoomStore } from '@/store/war-room-store'
import { useTerminalTitleStore } from '@/store/terminal-title-store'
import { collectLeaves } from '@/lib/layout-tree'
import { resolvePaneTitle } from '@/lib/pane-title'
import { memberDisplayName } from '@/lib/war-room-drop'
import { buildIntroText } from '@/lib/war-room-nudge'
import { warRoomJoin } from '@/tauri/warroom'
import { DEFAULT_TEMPLATE_ID } from '@/lib/templates'

export async function joinActiveWorkspaceToRoom(roomId?: string): Promise<number> {
  const appState = useAppStore.getState()
  const warRoomState = useWarRoomStore.getState()
  const activeWorkspace = appState.workspaces.find((w) => w.id === appState.activeWorkspaceId)
  if (!activeWorkspace) return 0

  const targetRoomId = roomId ?? warRoomState.activeRoomId ?? warRoomState.rooms[0]?.roomId
  if (!targetRoomId) return 0

  const leaves = collectLeaves(activeWorkspace.layout)
  const roomName = warRoomState.rooms.find((r) => r.roomId === targetRoomId)?.name ?? 'Orchestra Pit'
  const titles = useTerminalTitleStore.getState().titles
  const customTitles = useTerminalTitleStore.getState().customTitles
  let joinedCount = 0

  for (const leaf of leaves) {
    const cwd = leaf.cwd ?? activeWorkspace.cwd
    const agentId = leaf.agentId
    const resolvedAgent = agentId ?? DEFAULT_TEMPLATE_ID
    const displayName = memberDisplayName(
      resolvePaneTitle(resolvedAgent, titles[leaf.terminalId], customTitles[leaf.terminalId]),
      cwd
    )
    const currentMembers = warRoomState.membersByRoom[targetRoomId] ?? []
    const peers = currentMembers.map((m) => m.name)

    try {
      await warRoomJoin({
        roomId: targetRoomId,
        terminalId: leaf.terminalId,
        agentId: agentId ?? undefined,
        cwd,
        displayName
      })
      if (agentId) {
        useWarRoomStore.getState().enqueueIntro(leaf.terminalId, buildIntroText(roomName, peers))
      }
      joinedCount++
    } catch (err) {
      console.warn('Failed to join leaf to room:', err)
    }
  }

  return joinedCount
}

export async function joinSingleTerminalToRoom(terminalId: string, roomId?: string): Promise<boolean> {
  const appState = useAppStore.getState()
  const warRoomState = useWarRoomStore.getState()
  const targetRoomId = roomId ?? warRoomState.activeRoomId ?? warRoomState.rooms[0]?.roomId
  if (!targetRoomId) return false

  let foundLeaf: { terminalId: string; agentId?: string; cwd?: string } | null = null
  let foundCwd = ''
  for (const ws of appState.workspaces) {
    for (const l of collectLeaves(ws.layout)) {
      if (l.terminalId === terminalId) {
        foundLeaf = l
        foundCwd = l.cwd ?? ws.cwd
        break
      }
    }
    if (foundLeaf) break
  }

  if (!foundLeaf) return false

  const titles = useTerminalTitleStore.getState().titles
  const customTitles = useTerminalTitleStore.getState().customTitles
  const resolvedAgent = foundLeaf.agentId ?? DEFAULT_TEMPLATE_ID
  const displayName = memberDisplayName(
    resolvePaneTitle(resolvedAgent, titles[foundLeaf.terminalId], customTitles[foundLeaf.terminalId]),
    foundCwd
  )
  const roomName = warRoomState.rooms.find((r) => r.roomId === targetRoomId)?.name ?? 'Orchestra Pit'
  const peers = (warRoomState.membersByRoom[targetRoomId] ?? []).map((m) => m.name)

  try {
    await warRoomJoin({
      roomId: targetRoomId,
      terminalId: foundLeaf.terminalId,
      agentId: foundLeaf.agentId,
      cwd: foundCwd,
      displayName
    })
    if (foundLeaf.agentId) {
      useWarRoomStore.getState().enqueueIntro(foundLeaf.terminalId, buildIntroText(roomName, peers))
    }
    return true
  } catch (err) {
    console.warn('Failed to join terminal:', err)
    return false
  }
}
