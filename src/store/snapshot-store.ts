/**
 * snapshot-store.ts — Manages available snapshots (list, save, restore).
 * Actual file I/O goes through Tauri IPC (implemented in Phase 2c).
 * This store holds the UI state: available snapshots, save/load dialog state.
 */
import { create } from 'zustand';
import type { WorkspaceSnapshot } from '@/lib/snapshot-schema';

export interface SnapshotMeta {
  /** Filename without directory */
  filename: string;
  name: string;
  description: string;
  createdAt: string;
  workspaceCount: number;
  paneCount: number;
}

interface SnapshotState {
  /** Available snapshots on disk */
  available: SnapshotMeta[];
  /** Loading state */
  loading: boolean;
  /** Last error */
  error: string | null;
  /** Currently pending snapshot data (for save dialog) */
  pendingSave: WorkspaceSnapshot | null;
}

interface SnapshotActions {
  setAvailable(list: SnapshotMeta[]): void;
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  setPendingSave(snapshot: WorkspaceSnapshot | null): void;
  removeAvailable(filename: string): void;
}

export const useSnapshotStore = create<SnapshotState & SnapshotActions>(set => ({
  available: [],
  loading: false,
  error: null,
  pendingSave: null,

  setAvailable: list => set({ available: list, error: null }),
  setLoading: loading => set({ loading }),
  setError: error => set({ error, loading: false }),
  setPendingSave: pendingSave => set({ pendingSave }),
  removeAvailable: filename => set(s => ({
    available: s.available.filter(a => a.filename !== filename),
  })),
}));
