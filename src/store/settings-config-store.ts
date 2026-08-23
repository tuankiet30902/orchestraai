import { create } from 'zustand'
import {
  type AppSettingsConfig,
  type AgentCliConfig,
  type GeneralSettings,
  type GitSettings,
  type OrchestraPitSettings,
  type TerminalAdvancedSettings,
  DEFAULT_APP_SETTINGS,
  loadSettings,
  saveSettings
} from '@/lib/settings-config'

export interface SettingsConfigState {
  settings: AppSettingsConfig
  updateGeneral: (partial: Partial<GeneralSettings>) => void
  updateGit: (partial: Partial<GitSettings>) => void
  updateOrchestraPit: (partial: Partial<OrchestraPitSettings>) => void
  updateTerminalAdvanced: (partial: Partial<TerminalAdvancedSettings>) => void
  updateAgent: (agentId: string, partial: Partial<AgentCliConfig>) => void
  resetToDefaults: () => void
}

export const useSettingsConfigStore = create<SettingsConfigState>((set, get) => {
  const initial =
    typeof window === 'undefined'
      ? DEFAULT_APP_SETTINGS
      : loadSettings(window.localStorage)

  return {
    settings: initial,
    updateGeneral: (partial) => {
      const current = get().settings
      const updated: AppSettingsConfig = {
        ...current,
        general: { ...current.general, ...partial }
      }
      if (typeof window !== 'undefined') saveSettings(window.localStorage, updated)
      set({ settings: updated })
    },
    updateGit: (partial) => {
      const current = get().settings
      const updated: AppSettingsConfig = {
        ...current,
        git: { ...current.git, ...partial }
      }
      if (typeof window !== 'undefined') saveSettings(window.localStorage, updated)
      set({ settings: updated })
    },
    updateOrchestraPit: (partial) => {
      const current = get().settings
      const updated: AppSettingsConfig = {
        ...current,
        orchestraPit: { ...current.orchestraPit, ...partial }
      }
      if (typeof window !== 'undefined') saveSettings(window.localStorage, updated)
      set({ settings: updated })
    },
    updateTerminalAdvanced: (partial) => {
      const current = get().settings
      const updated: AppSettingsConfig = {
        ...current,
        terminalAdvanced: { ...current.terminalAdvanced, ...partial }
      }
      if (typeof window !== 'undefined') saveSettings(window.localStorage, updated)
      set({ settings: updated })
    },
    updateAgent: (agentId, partial) => {
      const current = get().settings
      const agent = current.agents[agentId]
      if (!agent) return
      const updated: AppSettingsConfig = {
        ...current,
        agents: {
          ...current.agents,
          [agentId]: { ...agent, ...partial }
        }
      }
      if (typeof window !== 'undefined') saveSettings(window.localStorage, updated)
      set({ settings: updated })
    },
    resetToDefaults: () => {
      if (typeof window !== 'undefined') saveSettings(window.localStorage, DEFAULT_APP_SETTINGS)
      set({ settings: DEFAULT_APP_SETTINGS })
    }
  }
})
