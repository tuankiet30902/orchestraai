import { useState, type ReactElement } from 'react'
import { GitMerge, Check, AlertTriangle, X, Loader2 } from 'lucide-react'
import { mergeBranch, type MergeOutcome } from '@/tauri/git'
import { Button } from '@/components/ui/button'

interface MergeBranchDialogProps {
  open: boolean
  repoCwd: string
  sourceBranch: string
  targetBranch?: string
  onClose: () => void
  onSuccess: () => void
}

export function MergeBranchDialog({
  open,
  repoCwd,
  sourceBranch,
  targetBranch = 'main',
  onClose,
  onSuccess
}: MergeBranchDialogProps): ReactElement | null {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<MergeOutcome | null>(null)

  if (!open) return null

  const handleMerge = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const res = await mergeBranch(repoCwd, sourceBranch, targetBranch)
      setOutcome(res)
      if (res.success) {
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1200)
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl text-foreground font-sans"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <GitMerge className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Merge Worktree Branch
            </h2>
            <p className="text-xs text-muted-foreground">
              Integrate agent changes into {targetBranch}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between text-muted-foreground">
              <span>Source:</span>
              <span className="text-foreground font-medium">{sourceBranch}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Target:</span>
              <span className="text-foreground font-medium">{targetBranch}</span>
            </div>
          </div>

          {outcome?.success && (
            <div className="flex items-center gap-2 rounded-md bg-emerald-500/15 border border-emerald-500/30 p-2.5 text-xs text-emerald-400">
              <Check className="h-4 w-4 shrink-0" />
              <span>{outcome.message || 'Branch merged successfully!'}</span>
            </div>
          )}

          {outcome && !outcome.success && (
            <div className="space-y-1.5 rounded-md bg-destructive/15 border border-destructive/30 p-2.5 text-xs text-destructive">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Merge conflicts detected</span>
              </div>
              <p className="text-[11px] opacity-90">{outcome.message}</p>
              {outcome.conflicts.length > 0 && (
                <ul className="list-disc pl-4 text-[10px] space-y-0.5 mt-1 font-mono">
                  {outcome.conflicts.map((file, i) => (
                    <li key={i}>{file}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/15 border border-destructive/30 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-3.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="h-8 text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleMerge()}
            disabled={loading || outcome?.success}
            className="h-8 text-xs bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Merging…
              </>
            ) : (
              <>
                <GitMerge className="mr-1.5 h-3.5 w-3.5" />
                Merge Branch
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
