/**
 * snapshot-schema.ts — Types for workspace snapshot (save/restore).
 *
 * A snapshot captures the workspace configuration at the moment of saving.
 * PTY sessions are NOT preserved (impossible to serialize shell state);
 * restoring re-launches agents with the same config as if you started fresh.
 */

export const SNAPSHOT_VERSION = 1;

export interface SnapshotAgent {
  /** Agent CLI id, or null for plain terminal */
  agentId: string | null;
  /** Shell id */
  shellId: string;
  /** Working directory */
  cwd: string;
  /** Worktree branch, if any */
  worktreeBranch: string | null;
  /** Initial prompt to send on restore */
  initialPrompt: string | null;
  /** Session id for resume, if any */
  resumeSessionId: string | null;
}

export interface SnapshotPane {
  leafId: string;
  agent: SnapshotAgent;
}

export interface SnapshotWorkspace {
  name: string;
  cwd: string;
  panes: SnapshotPane[];
  worktreeMode: boolean;
  /** Orchestra Pit room assignments: terminalIndex → roomName */
  orchestraPitRooms: Array<{ paneIndex: number; roomName: string }>;
}

export interface WorkspaceSnapshot {
  version: typeof SNAPSHOT_VERSION;
  name: string;
  description: string;
  createdAt: string; // ISO 8601
  workspaces: SnapshotWorkspace[];
}

/** Validate that an object looks like a WorkspaceSnapshot (basic check). */
export function isValidSnapshot(obj: unknown): obj is WorkspaceSnapshot {
  if (!obj || typeof obj !== 'object') return false;
  const s = obj as Record<string, unknown>;
  return s['version'] === SNAPSHOT_VERSION
    && typeof s['name'] === 'string'
    && Array.isArray(s['workspaces']);
}
