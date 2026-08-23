/**
 * terminate-guard.ts — Checks if a terminal pane or workspace has actively running AI agents or processes.
 *
 * Used to guard against accidental closure while an agent is generating code or running commands.
 */
import type { Workspace } from '@/store/app-store'
import { collectLeaves } from '@/lib/layout-tree'
import type { AgentPaneState } from '@/lib/agent-state/rollup'
import { resolvePaneTitle } from '@/lib/pane-title'

export interface BusyCheckResult {
  isBusy: boolean
  busyAgents: string[]
}

/**
 * Checks if a specific terminal is busy (working, blocked on user input, or producing output).
 */
export function isTerminalActive(
  agentState: AgentPaneState | undefined,
  outputActive: boolean | undefined
): boolean {
  if (agentState) {
    if (agentState.state === 'working' || agentState.state === 'blocked') {
      return true
    }
  }
  return outputActive === true
}

/**
 * Evaluates whether a workspace contains any actively running agents or busy terminal panes.
 */
export function getWorkspaceBusyInfo(
  workspace: Workspace,
  agentStates: Record<string, AgentPaneState | undefined>,
  activity: Record<string, boolean | undefined>,
  titles: Record<string, string>,
  customTitles: Record<string, string>
): BusyCheckResult {
  const leaves = collectLeaves(workspace.layout)
  const busyAgents: string[] = []

  for (const leaf of leaves) {
    const tid = leaf.terminalId
    const isBusy = isTerminalActive(agentStates[tid], activity[tid])
    if (isBusy) {
      const agentId = leaf.agentId ?? 'terminal'
      const title = resolvePaneTitle(agentId, titles[tid], customTitles[tid])
      busyAgents.push(title)
    }
  }

  return {
    isBusy: busyAgents.length > 0,
    busyAgents
  }
}
