import { useEffect, type ReactElement } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useTerminateConfirmStore } from '@/store/terminate-confirm-store'
import { Button } from '@/components/ui/button'

export function TerminateConfirmModal(): ReactElement | null {
  const isOpen = useTerminateConfirmStore((s) => s.isOpen)
  const title = useTerminateConfirmStore((s) => s.title)
  const description = useTerminateConfirmStore((s) => s.description)
  const busyAgents = useTerminateConfirmStore((s) => s.busyAgents)
  const onConfirm = useTerminateConfirmStore((s) => s.onConfirm)
  const closeDialog = useTerminateConfirmStore((s) => s.closeDialog)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeDialog()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        onConfirm()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeDialog, onConfirm])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terminate-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-2xl text-foreground"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeDialog}
          className="absolute right-3.5 top-3.5 rounded-sm p-1 text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
          title="Cancel"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-destructive/15 text-destructive border border-destructive/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 id="terminate-modal-title" className="text-sm font-semibold text-foreground">
              {title}
            </h2>
            <p className="text-xs text-muted-foreground">Action requires confirmation</p>
          </div>
        </div>

        {/* Body */}
        <div className="mt-3.5">
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>

          {busyAgents.length > 1 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {busyAgents.map((agent, i) => (
                <span
                  key={i}
                  className="rounded border border-destructive/30 bg-destructive/10 px-2 py-0.5 font-mono text-[10px] text-destructive-foreground font-medium"
                >
                  {agent}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-border/80 pt-3.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={closeDialog}
            className="h-7 text-xs px-3"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            className="h-7 text-xs px-3 font-semibold shadow-xs"
          >
            Terminate
          </Button>
        </div>
      </div>
    </div>
  )
}
