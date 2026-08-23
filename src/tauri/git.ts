import { invoke } from '@tauri-apps/api/core'

export interface WorktreeInfo {
  path: string
  branch: string
  head: string
  isMain: boolean
}

export interface ChangedFile {
  path: string
  status: 'M' | 'A' | 'D' | 'R' | '?' | string
  added: number
  removed: number
}

export interface CommitInfo {
  headSha: string
  branch: string
  ahead: number | null
  behind: number | null
}

export interface CreatedWorktree {
  path: string
  branch: string
}

export interface MergeOutcome {
  success: boolean
  message: string
  conflicts: string[]
}

export interface BranchInfo {
  name: string
  isCurrent: boolean
  isRemote: boolean
  headSha: string
  upstream?: string
}

export interface GitCommitLog {
  hash: string
  shortHash: string
  authorName: string
  authorEmail: string
  timestamp: number
  message: string
}

export function listWorktrees(cwd: string): Promise<WorktreeInfo[]> {
  return invoke('git_list_worktrees', { cwd })
}

export function getChangedFiles(worktreePath: string): Promise<ChangedFile[]> {
  return invoke('git_get_changed_files', { worktreePath })
}

export function getFileDiff(worktreePath: string, file: string): Promise<string> {
  return invoke('git_get_file_diff', { worktreePath, file })
}

export function getCommitInfo(worktreePath: string): Promise<CommitInfo> {
  return invoke('git_get_commit_info', { worktreePath })
}

export function createWorktree(repoRoot: string, branch: string): Promise<CreatedWorktree> {
  return invoke('git_create_worktree', { repoRoot, branch })
}

export function branchUnmergedCount(repoRoot: string, branch: string): Promise<number> {
  return invoke('git_branch_unmerged_count', { repoRoot, branch })
}

export function clearWorktree(
  repoRoot: string,
  worktreePath: string,
  branch: string
): Promise<void> {
  return invoke('git_clear_worktree', { repoRoot, worktreePath, branch })
}

export async function ensureRepoWithCommit(path: string): Promise<void> {
  return invoke<void>('ensure_repo_with_commit', { path })
}

export function stageFile(worktreePath: string, file: string): Promise<void> {
  return invoke('git_stage_file', { worktreePath, file })
}

export function unstageFile(worktreePath: string, file: string): Promise<void> {
  return invoke('git_unstage_file', { worktreePath, file })
}

export function stageAll(worktreePath: string): Promise<void> {
  return invoke('git_stage_all', { worktreePath })
}

export function unstageAll(worktreePath: string): Promise<void> {
  return invoke('git_unstage_all', { worktreePath })
}

export function commitChanges(worktreePath: string, message: string): Promise<string> {
  return invoke('git_commit', { worktreePath, message })
}

export function mergeBranch(
  repoCwd: string,
  sourceBranch: string,
  targetBranch?: string
): Promise<MergeOutcome> {
  return invoke('git_merge_branch', { repoCwd, sourceBranch, targetBranch })
}

export function listBranches(repoCwd: string): Promise<BranchInfo[]> {
  return invoke('git_list_branches', { repoCwd })
}

export function checkoutBranch(
  worktreePath: string,
  branch: string,
  createNew = false
): Promise<void> {
  return invoke('git_checkout_branch', { worktreePath, branch, createNew })
}

export function getCommitHistory(
  worktreePath: string,
  maxCount = 30
): Promise<GitCommitLog[]> {
  return invoke('git_get_commit_history', { worktreePath, maxCount })
}

export function revertCommit(worktreePath: string, commitHash: string): Promise<void> {
  return invoke('git_revert_commit', { worktreePath, commitHash })
}

export function gitPush(worktreePath: string): Promise<string> {
  return invoke('git_push', { worktreePath })
}

export function gitPull(worktreePath: string): Promise<string> {
  return invoke('git_pull', { worktreePath })
}

export function discardFile(worktreePath: string, file: string): Promise<void> {
  return invoke('git_discard_file', { worktreePath, file })
}

export function discardAll(worktreePath: string): Promise<void> {
  return invoke('git_discard_all', { worktreePath })
}
