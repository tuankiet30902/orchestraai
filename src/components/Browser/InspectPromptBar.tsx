// src/components/Browser/InspectPromptBar.tsx
import { useState, type ReactElement } from 'react'
import { Crosshair, Send, X, Check } from 'lucide-react'
import { writeTerminal } from '@/tauri/terminal'
import { Button } from '@/components/ui/button'

interface InspectPromptBarProps {
  terminalId: string | null
  url: string
  open: boolean
  onClose: () => void
}

export function InspectPromptBar({
  terminalId,
  url,
  open,
  onClose
}: InspectPromptBarProps): ReactElement | null {
  const [elementSelector, setElementSelector] = useState('#main-cta-button')
  const [instruction, setInstruction] = useState('')
  const [sent, setSent] = useState(false)

  if (!open || !terminalId) return null

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault()
    if (!instruction.trim()) return

    const promptMessage = `[UI Annotation from ${url}]\nTarget Element: ${elementSelector.trim()}\nInstruction: ${instruction.trim()}\nPlease update the frontend components accordingly.\n`
    void writeTerminal(terminalId, promptMessage)

    setSent(true)
    setTimeout(() => {
      setSent(false)
      setInstruction('')
      onClose()
    }, 1200)
  }

  return (
    <div className="border-b border-border bg-card p-3 shadow-lg animate-in slide-in-from-top-2 duration-150 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Crosshair className="h-4 w-4 text-muted-foreground" />
          <span>Visual UI Inspector & Annotation</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <form onSubmit={handleSendPrompt} className="mt-2 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-muted-foreground shrink-0">Element:</span>
          <input
            type="text"
            value={elementSelector}
            onChange={(e) => setElementSelector(e.target.value)}
            placeholder="e.g. button.primary-btn, #navbar, .card-title..."
            className="flex-1 rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-muted-foreground shrink-0">Prompt:</span>
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Describe the UI change (e.g. Change color and add hover scale)..."
            className="flex-1 rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
            autoFocus
          />
          <Button
            type="submit"
            size="sm"
            disabled={!instruction.trim() || sent}
            className="h-7 text-xs bg-foreground text-background hover:bg-foreground/90 font-semibold shrink-0 gap-1"
          >
            {sent ? (
              <>
                <Check className="h-3.5 w-3.5 text-foreground" />
                <span>Dispatched</span>
              </>
            ) : (
              <>
                <Send className="h-3 w-3" />
                <span>Send to Agent</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
