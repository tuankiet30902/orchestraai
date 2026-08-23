// src/components/Snapshot/SnapshotManagerModal.tsx
import { useState, useEffect, type ReactElement } from 'react'
import { Bookmark, Download, Upload, Trash2, Play, Plus, X, Check, Clock } from 'lucide-react'
import { useAppStore, selectActiveWorkspace } from '@/store/app-store'
import { collectLeaves } from '@/lib/layout-tree'
import { type WorkspaceSnapshot, SNAPSHOT_VERSION } from '@/lib/snapshot-schema'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'orchestron_snapshots_v1'

interface SavedSnapshot {
  id: string
  name: string
  description: string
  createdAt: string
  snapshot: WorkspaceSnapshot
}

function loadLocalSnapshots(): SavedSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedSnapshot[]) : []
  } catch {
    return []
  }
}

function saveLocalSnapshots(list: SavedSnapshot[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // fallback
  }
}

interface SnapshotManagerModalProps {
  open: boolean
  onClose: () => void
}

export function SnapshotManagerModal({
  open,
  onClose
}: SnapshotManagerModalProps): ReactElement | null {
  const activeWorkspace = useAppStore(selectActiveWorkspace)
  const createWorkspace = useAppStore((s) => s.createWorkspace)

  const [snapshots, setSnapshots] = useState<SavedSnapshot[]>([])
  const [snapshotName, setSnapshotName] = useState('')
  const [snapshotDesc, setSnapshotDesc] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setSnapshots(loadLocalSnapshots())
      if (activeWorkspace) {
        setSnapshotName(`${activeWorkspace.name} - Checkpoint`)
      }
    }
  }, [open, activeWorkspace])

  if (!open) return null

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeWorkspace || !snapshotName.trim()) return

    const leaves = collectLeaves(activeWorkspace.layout)
    const snapshot: WorkspaceSnapshot = {
      version: SNAPSHOT_VERSION,
      name: snapshotName.trim(),
      description: snapshotDesc.trim(),
      createdAt: new Date().toISOString(),
      workspaces: [
        {
          name: activeWorkspace.name,
          cwd: activeWorkspace.cwd,
          worktreeMode: activeWorkspace.worktreeMode,
          panes: leaves.map((l) => ({
            leafId: l.id,
            agent: {
              agentId: l.agentId ?? null,
              shellId: l.shellId ?? 'default',
              cwd: l.cwd ?? activeWorkspace.cwd,
              worktreeBranch: l.worktreeBranch ?? null,
              initialPrompt: l.initialPrompt ?? null,
              resumeSessionId: l.resumeSessionId ?? null
            }
          })),
          orchestraPitRooms: []
        }
      ]
    }

    const newEntry: SavedSnapshot = {
      id: `snap-${Date.now().toString(36)}`,
      name: snapshotName.trim(),
      description: snapshotDesc.trim(),
      createdAt: new Date().toISOString(),
      snapshot
    }

    const updated = [newEntry, ...snapshots]
    setSnapshots(updated)
    saveLocalSnapshots(updated)
    setShowSaveForm(false)
    setSnapshotDesc('')
    setFeedbackMsg('Snapshot saved successfully!')
    setTimeout(() => setFeedbackMsg(null), 2500)
  }

  const handleRestore = (snap: SavedSnapshot) => {
    for (const ws of snap.snapshot.workspaces) {
      createWorkspace({
        cwd: ws.cwd,
        terminalCount: ws.panes.length,
        agentIds: ws.panes.map((p) => p.agent.agentId ?? 'terminal'),
        worktreeMode: ws.worktreeMode
      })
    }
    onClose()
  }

  const handleDelete = (id: string) => {
    const updated = snapshots.filter((s) => s.id !== id)
    setSnapshots(updated)
    saveLocalSnapshots(updated)
  }

  const handleExport = (snap: SavedSnapshot) => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(snap.snapshot, null, 2)
    )}`
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${snap.name.toLowerCase().replace(/\s+/g, '-')}.orchestra.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as WorkspaceSnapshot
        if (parsed && parsed.workspaces) {
          const newEntry: SavedSnapshot = {
            id: `snap-${Date.now().toString(36)}`,
            name: parsed.name || file.name.replace('.orchestra.json', ''),
            description: parsed.description || 'Imported snapshot',
            createdAt: parsed.createdAt || new Date().toISOString(),
            snapshot: parsed
          }
          const updated = [newEntry, ...snapshots]
          setSnapshots(updated)
          saveLocalSnapshots(updated)
          setFeedbackMsg('Snapshot imported successfully!')
          setTimeout(() => setFeedbackMsg(null), 2500)
        }
      } catch {
        setFeedbackMsg('Invalid snapshot JSON file')
        setTimeout(() => setFeedbackMsg(null), 2500)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-card shadow-2xl text-foreground font-sans overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted border border-border text-foreground">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Workspace Snapshots & Presets
              </h2>
              <p className="text-xs text-muted-foreground">
                Save, restore, and share entire multi-agent team layouts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 rounded-md border border-border bg-muted/40 hover:bg-muted text-xs px-2.5 py-1.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors font-medium">
              <Upload className="h-3.5 w-3.5" />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <Button
              size="sm"
              onClick={() => setShowSaveForm(!showSaveForm)}
              className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90 font-semibold gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Save Current</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {feedbackMsg && (
          <div className="flex items-center gap-2 bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2 text-xs text-emerald-400 font-medium">
            <Check className="h-3.5 w-3.5" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Save Snapshot Form */}
        {showSaveForm && (
          <form onSubmit={handleSaveCurrent} className="border-b border-border bg-muted/20 p-4 space-y-2.5 shrink-0">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Snapshot Name</label>
              <input
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder="e.g. Fullstack Sprint - 4 Agents"
                className="w-full rounded border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                required
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
              <input
                type="text"
                value={snapshotDesc}
                onChange={(e) => setSnapshotDesc(e.target.value)}
                placeholder="Notes about this session setup..."
                className="w-full rounded border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSaveForm(false)}
                className="h-7 text-xs text-muted-foreground"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-7 text-xs bg-primary text-primary-foreground font-semibold">
                Save Checkpoint
              </Button>
            </div>
          </form>
        )}

        {/* Snapshot List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {snapshots.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-xs text-muted-foreground">
              <Bookmark className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="font-semibold text-foreground">No snapshots saved yet</p>
              <p className="mt-1 text-[11px]">Save your current workspace layout or import a team preset.</p>
            </div>
          ) : (
            snapshots.map((snap) => (
              <div
                key={snap.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5 hover:border-primary/50 transition-all shadow-xs"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {snap.name}
                    </span>
                    <span className="rounded bg-primary/10 text-primary px-1.5 py-0.2 text-[10px] font-mono font-bold">
                      {snap.snapshot.workspaces[0]?.panes.length ?? 1} Agents
                    </span>
                  </div>
                  {snap.description && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {snap.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70 font-mono">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(snap.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-3">
                  <Button
                    size="sm"
                    onClick={() => handleRestore(snap)}
                    className="h-7 text-xs bg-foreground text-background hover:bg-foreground/90 font-medium gap-1"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Restore</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(snap)}
                    title="Export JSON"
                    className="h-7 w-7 p-0"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(snap.id)}
                    title="Delete snapshot"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
