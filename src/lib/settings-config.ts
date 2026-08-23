/**
 * settings-config.ts — Comprehensive application settings model and persistence.
 */

export interface AgentCliConfig {
  id: string
  name: string
  binaryName: string
  customPath: string
  defaultArgs: string
  enabled: boolean
}

export interface GeneralSettings {
  autoCheckUpdates: boolean
  restorePreviousSession: boolean
  confirmBeforeClosingPane: boolean
  telemetryEnabled: boolean
}

export interface GitSettings {
  worktreeBranchPrefix: string
  autoCleanupWorktrees: boolean
  diffViewMode: 'unified' | 'split'
  autoFetchIntervalMin: number
}

export interface OrchestraPitSettings {
  autoNudgeIdleAgents: boolean
  nudgeIntervalSec: number
  soundOnMessage: boolean
  maxHistoryMessages: number
  defaultRoomName: string
}

export interface TerminalAdvancedSettings {
  cursorStyle: 'block' | 'underline' | 'bar'
  cursorBlink: boolean
  scrollbackLimit: number
  copyOnSelect: boolean
  enableAudioBell: boolean
}

export interface AppSettingsConfig {
  general: GeneralSettings
  git: GitSettings
  orchestraPit: OrchestraPitSettings
  terminalAdvanced: TerminalAdvancedSettings
  agents: Record<string, AgentCliConfig>
}

export const DEFAULT_AGENT_CONFIGS: Record<string, AgentCliConfig> = {
  'antigravity': {
    id: 'antigravity',
    name: 'Google Antigravity',
    binaryName: 'agy',
    customPath: '',
    defaultArgs: '',
    enabled: true
  },
  'claude-code': {
    id: 'claude-code',
    name: 'Claude Code',
    binaryName: 'claude',
    customPath: '',
    defaultArgs: '',
    enabled: true
  },
  'codex': {
    id: 'codex',
    name: 'OpenAI Codex',
    binaryName: 'codex',
    customPath: '',
    defaultArgs: '',
    enabled: true
  },
  'opencode': {
    id: 'opencode',
    name: 'OpenCode',
    binaryName: 'opencode',
    customPath: '',
    defaultArgs: '',
    enabled: true
  },
  'grok': {
    id: 'grok',
    name: 'xAI Grok',
    binaryName: 'grok',
    customPath: '',
    defaultArgs: '',
    enabled: true
  },
  'deepseek': {
    id: 'deepseek',
    name: 'DeepSeek CLI',
    binaryName: 'deepseek',
    customPath: '',
    defaultArgs: '',
    enabled: true
  }
}

export const DEFAULT_APP_SETTINGS: AppSettingsConfig = {
  general: {
    autoCheckUpdates: true,
    restorePreviousSession: true,
    confirmBeforeClosingPane: false,
    telemetryEnabled: false
  },
  git: {
    worktreeBranchPrefix: 'orchestra/',
    autoCleanupWorktrees: false,
    diffViewMode: 'unified',
    autoFetchIntervalMin: 5
  },
  orchestraPit: {
    autoNudgeIdleAgents: true,
    nudgeIntervalSec: 15,
    soundOnMessage: true,
    maxHistoryMessages: 500,
    defaultRoomName: 'Main Pit'
  },
  terminalAdvanced: {
    cursorStyle: 'block',
    cursorBlink: true,
    scrollbackLimit: 10000,
    copyOnSelect: true,
    enableAudioBell: false
  },
  agents: DEFAULT_AGENT_CONFIGS
}

export const SETTINGS_STORAGE_KEY = 'orchestraai-app-settings-v1'

export interface StorageSurface {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem?: (key: string) => void
}

export function loadSettings(storage: StorageSurface): AppSettingsConfig {
  try {
    const raw = storage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_APP_SETTINGS
    const parsed = JSON.parse(raw) as Partial<AppSettingsConfig>
    return {
      general: { ...DEFAULT_APP_SETTINGS.general, ...(parsed.general ?? {}) },
      git: { ...DEFAULT_APP_SETTINGS.git, ...(parsed.git ?? {}) },
      orchestraPit: { ...DEFAULT_APP_SETTINGS.orchestraPit, ...(parsed.orchestraPit ?? {}) },
      terminalAdvanced: { ...DEFAULT_APP_SETTINGS.terminalAdvanced, ...(parsed.terminalAdvanced ?? {}) },
      agents: { ...DEFAULT_AGENT_CONFIGS, ...(parsed.agents ?? {}) }
    }
  } catch {
    return DEFAULT_APP_SETTINGS
  }
}

export function saveSettings(storage: StorageSurface, config: AppSettingsConfig): void {
  try {
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(config))
  } catch (err) {
    console.error('Failed to save settings to storage', err)
  }
}
