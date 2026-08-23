// src/components/Git/VisualDiffViewer.tsx
import { useState, type ReactElement } from 'react'
import { Copy, Check, Columns, AlignJustify, X } from 'lucide-react'
import { parseDiff } from '@/lib/git-diff'
import { Button } from '@/components/ui/button'

interface VisualDiffViewerProps {
  open: boolean
  filePath: string
  rawDiff: string
  onClose: () => void
}

export function VisualDiffViewer({
  open,
  filePath,
  rawDiff,
  onClose
}: VisualDiffViewerProps): ReactElement | null {
  const [copied, setCopied] = useState(false)
  const [splitMode, setSplitMode] = useState(false)

  if (!open) return null

  const lines = parseDiff(rawDiff)
  const additions = lines.filter((l) => l.type === 'added').length
  const deletions = lines.filter((l) => l.type === 'removed').length

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawDiff)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // fallback
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[85vh] w-full max-w-5xl flex-col rounded-xl border border-border bg-card shadow-2xl overflow-hidden font-sans text-foreground"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-sm font-semibold text-foreground truncate">
              {filePath}
            </span>
            <div className="flex items-center gap-2 text-xs font-mono shrink-0">
              {additions > 0 && (
                <span className="rounded bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 font-bold">
                  +{additions}
                </span>
              )}
              {deletions > 0 && (
                <span className="rounded bg-rose-500/20 text-rose-400 px-1.5 py-0.5 font-bold">
                  -{deletions}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-border bg-muted/60 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSplitMode(false)}
                className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${
                  !splitMode ? 'bg-background text-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Unified View"
              >
                <AlignJustify className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Unified</span>
              </button>
              <button
                type="button"
                onClick={() => setSplitMode(true)}
                className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${
                  splitMode ? 'bg-background text-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Split View"
              >
                <Columns className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Split</span>
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleCopy()}
              className="h-8 gap-1.5 text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Diff Body */}
        <div className="flex-1 overflow-auto bg-canvas p-2 font-mono text-xs select-text">
          {lines.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No diff content to display.
            </div>
          ) : (
            <div className="space-y-0.5">
              {lines.map((line, i) => {
                if (line.type === 'hunk') {
                  return (
                    <div
                      key={i}
                      className="my-1 rounded bg-muted/40 px-3 py-1 font-mono text-[11px] font-semibold text-muted-foreground"
                    >
                      {line.content}
                    </div>
                  )
                }

                if (line.type === 'added') {
                  return (
                    <div
                      key={i}
                      className="flex w-max min-w-full items-center rounded-xs bg-emerald-500/10 px-2 py-0.5 text-emerald-400 hover:bg-emerald-500/15 transition-colors"
                    >
                      <span className="w-10 shrink-0 select-none text-right pr-2 text-[10px] text-muted-foreground/40">
                        {line.oldLineNo ?? ''}
                      </span>
                      <span className="w-10 shrink-0 select-none text-right pr-2 text-[10px] font-bold text-emerald-500/70">
                        {line.newLineNo ?? ''}
                      </span>
                      <span className="mr-2 select-none font-bold text-emerald-400">+</span>
                      <span className="whitespace-pre font-mono leading-relaxed">{line.content}</span>
                    </div>
                  )
                }

                if (line.type === 'removed') {
                  return (
                    <div
                      key={i}
                      className="flex w-max min-w-full items-center rounded-xs bg-rose-500/10 px-2 py-0.5 text-rose-400 hover:bg-rose-500/15 transition-colors"
                    >
                      <span className="w-10 shrink-0 select-none text-right pr-2 text-[10px] font-bold text-rose-500/70">
                        {line.oldLineNo ?? ''}
                      </span>
                      <span className="w-10 shrink-0 select-none text-right pr-2 text-[10px] text-muted-foreground/40">
                        {line.newLineNo ?? ''}
                      </span>
                      <span className="mr-2 select-none font-bold text-rose-400">-</span>
                      <span className="whitespace-pre font-mono leading-relaxed">{line.content}</span>
                    </div>
                  )
                }

                return (
                  <div
                    key={i}
                    className="flex w-max min-w-full items-center px-2 py-0.5 text-muted-foreground hover:bg-accent/30 transition-colors"
                  >
                    <span className="w-10 shrink-0 select-none text-right pr-2 text-[10px] text-muted-foreground/40">
                      {line.oldLineNo ?? ''}
                    </span>
                    <span className="w-10 shrink-0 select-none text-right pr-2 text-[10px] text-muted-foreground/40">
                      {line.newLineNo ?? ''}
                    </span>
                    <span className="mr-2 select-none text-transparent"> </span>
                    <span className="whitespace-pre font-mono leading-relaxed text-foreground/90">{line.content}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
