// src/store/git-store.ts
import { create } from 'zustand'
import {
  listWorktrees,
  getChangedFiles,
  getFileDiff,
  getCommitInfo,
  listBranches,
  getCommitHistory,
  type WorktreeInfo,
  type ChangedFile,
  type CommitInfo,
  type BranchInfo,
  type GitCommitLog
} from '@/tauri/git'

export type { WorktreeInfo, ChangedFile, CommitInfo, BranchInfo, GitCommitLog }

export type GitSubTab = 'changes' | 'history' | 'branches'
export type GitMode = 'files' | 'git' | 'orchestrapit' | 'browser' | 'warroom' | 'tasks'

interface GitStore {
  panelOpen: boolean
  mode: GitMode
  gitSubTab: GitSubTab
  currentCwd: string
  worktrees: WorktreeInfo[]
  selectedWorktreePath: string
  /** Changed-file count per worktree path. */
  worktreeCounts: Map<string, number>
  changedFiles: ChangedFile[]
  commitInfo: CommitInfo | null
  expandedFiles: Set<string>
  fileDiffs: Map<string, string>
  commitHistory: GitCommitLog[]
  branches: BranchInfo[]
  loading: boolean
  error: string | null

  setMode: (mode: 'files' | 'git' | 'orchestrapit' | 'browser' | 'warroom' | 'tasks') => void
  setGitSubTab: (tab: GitSubTab) => void
  setPanelOpen: (open: boolean) => void
  togglePanel: () => void
  selectWorktree: (path: string) => void
  toggleFileExpand: (filePath: string) => void
  fetchWorktrees: (cwd: string) => Promise<void>
  fetchFileDiff: (filePath: string) => Promise<void>
  fetchHistory: () => Promise<void>
  fetchBranches: () => Promise<void>
  refresh: () => void
}

export const useGitStore = create<GitStore>((set, get) => ({
  panelOpen: true,
  mode: 'files',
  gitSubTab: 'changes',
  currentCwd: '',
  worktrees: [],
  selectedWorktreePath: '',
  worktreeCounts: new Map(),
  changedFiles: [],
  commitInfo: null,
  expandedFiles: new Set(),
  fileDiffs: new Map(),
  commitHistory: [],
  branches: [],
  loading: false,
  error: null,

  setMode: (mode) => {
    set({ mode, panelOpen: true })
    if (mode === 'git') {
      const { currentCwd } = get()
      if (currentCwd) void get().fetchWorktrees(currentCwd)
    }
  },

  setGitSubTab: (tab) => {
    set({ gitSubTab: tab })
    if (tab === 'history') void get().fetchHistory()
    if (tab === 'branches') void get().fetchBranches()
  },

  setPanelOpen: (open) => set({ panelOpen: open }),

  togglePanel: () => {
    const open = !get().panelOpen
    set({ panelOpen: open })
    if (open && get().mode === 'git') {
      const { currentCwd } = get()
      if (currentCwd) void get().fetchWorktrees(currentCwd)
    }
  },

  selectWorktree: (path) => {
    set({
      selectedWorktreePath: path,
      changedFiles: [],
      commitInfo: null,
      expandedFiles: new Set(),
      fileDiffs: new Map(),
      commitHistory: [],
      loading: true,
      error: null
    })
    void (async () => {
      try {
        const [files, info] = await Promise.all([
          getChangedFiles(path),
          getCommitInfo(path)
        ])
        if (get().selectedWorktreePath !== path) return
        set({ changedFiles: files, commitInfo: info, loading: false })
        if (get().gitSubTab === 'history') void get().fetchHistory()
      } catch (e) {
        set({ error: String(e), loading: false })
      }
    })()
  },

  toggleFileExpand: (filePath) => {
    const { expandedFiles } = get()
    const next = new Set(expandedFiles)
    if (next.has(filePath)) {
      next.delete(filePath)
      set({ expandedFiles: next })
    } else {
      next.add(filePath)
      set({ expandedFiles: next })
      if (!get().fileDiffs.has(filePath)) {
        void get().fetchFileDiff(filePath)
      }
    }
  },

  fetchWorktrees: async (cwd) => {
    set({
      loading: true,
      error: null,
      currentCwd: cwd,
      worktrees: [],
      worktreeCounts: new Map(),
      changedFiles: [],
      commitInfo: null,
      expandedFiles: new Set(),
      fileDiffs: new Map()
    })
    try {
      const trees = await listWorktrees(cwd)
      if (get().currentCwd !== cwd) return
      if (trees.length === 0) {
        set({ worktrees: [], loading: false })
        return
      }
      const match = trees.find((t) => cwd.startsWith(t.path)) ?? trees[0]
      set({ worktrees: trees, loading: false })
      get().selectWorktree(match.path)
      for (const wt of trees) {
        void getChangedFiles(wt.path)
          .then((files) => {
            if (get().currentCwd !== cwd) return
            const next = new Map(get().worktreeCounts)
            next.set(wt.path, files.length)
            set({ worktreeCounts: next })
          })
          .catch(() => {})
      }
    } catch (e) {
      set({ error: String(e), loading: false })
    }
  },

  fetchFileDiff: async (filePath) => {
    const { selectedWorktreePath, fileDiffs } = get()
    if (!selectedWorktreePath) return
    try {
      const diff = await getFileDiff(selectedWorktreePath, filePath)
      const next = new Map(fileDiffs)
      next.set(filePath, diff)
      set({ fileDiffs: next })
    } catch {
      // Ignored
    }
  },

  fetchHistory: async () => {
    const { selectedWorktreePath } = get()
    if (!selectedWorktreePath) return
    try {
      const history = await getCommitHistory(selectedWorktreePath, 35)
      set({ commitHistory: history })
    } catch (e) {
      console.warn('Failed to fetch history:', e)
    }
  },

  fetchBranches: async () => {
    const { currentCwd, selectedWorktreePath } = get()
    const target = currentCwd || selectedWorktreePath
    if (!target) return
    try {
      const list = await listBranches(target)
      set({ branches: list })
    } catch (e) {
      console.warn('Failed to fetch branches:', e)
    }
  },

  refresh: () => {
    const { currentCwd, selectedWorktreePath } = get()
    if (selectedWorktreePath) {
      get().selectWorktree(selectedWorktreePath)
    } else if (currentCwd) {
      void get().fetchWorktrees(currentCwd)
    }
  }
}))
