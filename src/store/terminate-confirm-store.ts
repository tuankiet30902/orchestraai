import { create } from 'zustand'
import { isTerminalActive, getWorkspaceBusyInfo } from '@/lib/terminate-guard'
import { useAgentStateStore } from '@/store/agent-state-store'
import { useTerminalActivityStore } from '@/store/terminal-activity-store'
import { useTerminalTitleStore } from '@/store/terminal-title-store'
import type { Workspace } from '@/store/app-store'

export interface TerminateConfirmModalState {
  isOpen: boolean
  title: string
  description: string
  busyAgents: string[]
  onConfirm: () => void
}

export interface TerminateConfirmStore extends TerminateConfirmModalState {
  requestPaneClose: (terminalId: string, paneTitle: string, proceed: () => void) => void
  requestWorkspaceClose: (workspace: Workspace, proceed: () => void) => void
  closeDialog: () => void
}

export const useTerminateConfirmStore = create<TerminateConfirmStore>((set) => ({
  isOpen: false,
  title: '',
  description: '',
  busyAgents: [],
  onConfirm: () => {},

  requestPaneClose: (terminalId, paneTitle, proceed) => {
    const agentState = useAgentStateStore.getState().byId[terminalId]
    const activity = useTerminalActivityStore.getState().active[terminalId]
    const busy = isTerminalActive(agentState, activity)

    if (!busy) {
      proceed()
      return
    }

    set({
      isOpen: true,
      title: 'Terminate Running Agent?',
      description: `"${paneTitle}" is currently executing a task. Closing this terminal will terminate the process and abort any running operations.`,
      busyAgents: [paneTitle],
      onConfirm: () => {
        set({ isOpen: false })
        proceed()
      }
    })
  },

  requestWorkspaceClose: (workspace, proceed) => {
    const agentStates = useAgentStateStore.getState().byId
    const activity = useTerminalActivityStore.getState().active
    const titles = useTerminalTitleStore.getState().titles
    const customTitles = useTerminalTitleStore.getState().customTitles

    const busyInfo = getWorkspaceBusyInfo(workspace, agentStates, activity, titles, customTitles)

    if (!busyInfo.isBusy) {
      proceed()
      return
    }

    const agentListStr = busyInfo.busyAgents.join(', ')
    set({
      isOpen: true,
      title: 'Terminate Active Workspace?',
      description: `Workspace "${workspace.name}" contains running agent(s) (${agentListStr}). Closing this workspace will terminate all active agent sessions.`,
      busyAgents: busyInfo.busyAgents,
      onConfirm: () => {
        set({ isOpen: false })
        proceed()
      }
    })
  },

  closeDialog: () => set({ isOpen: false })
}))
