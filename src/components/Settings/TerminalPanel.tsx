// src/components/Settings/TerminalPanel.tsx
import { useEffect, useState, type ReactElement } from 'react'
import { Check, Minus, Plus, Terminal } from 'lucide-react'
import { platformShells, type ShellId, type ShellMeta } from '@/lib/terminal-pref'
import {
  MONO_FONTS,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  LINE_HEIGHT_MIN,
  LINE_HEIGHT_MAX,
  customFontStack,
  primaryFamily,
  type TerminalTextPref
} from '@/lib/terminal-text'
import { useTerminalPrefStore } from '@/store/terminal-pref-store'
import { useTerminalTextStore } from '@/store/terminal-text-store'
import { useStatuslineStore } from '@/store/statusline-store'
import { useSettingsConfigStore } from '@/store/settings-config-store'
import { listAvailableShells, type AvailableShell } from '@/tauri/shell'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

/** The Terminal & Shell settings category */
export function TerminalPanel(): ReactElement {
  const shellId = useTerminalPrefStore((s) => s.shellId)
  const setShellId = useTerminalPrefStore((s) => s.setShellId)
  const [available, setAvailable] = useState<AvailableShell[] | null>(null)
  const [staleId, setStaleId] = useState<ShellId | null>(null)

  useEffect(() => {
    let cancelled = false
    listAvailableShells()
      .then((list) => {
        if (cancelled) return
        setAvailable(list)
        const match = list.find((s) => s.id === shellId)
        if (!match || !match.available) {
          setStaleId(shellId)
          setShellId('default')
        } else {
          setStaleId(null)
        }
      })
      .catch((err) => {
        if (cancelled) return
        console.error('[TerminalPanel] listAvailableShells failed', err)
        setAvailable([])
      })
    return () => {
      cancelled = true
    }
  }, [shellId, setShellId])

  return (
    <div className="space-y-8 font-sans">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Terminal & Shell Settings
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Customize terminal typography, font ligatures, default shell runtime, and scrollback buffer size.
        </p>
      </section>

      {/* 1. Typography & Text Rendering */}
      <TextSettings />

      {staleId && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          The previously selected shell <span className="font-mono font-semibold">{staleId}</span> is no longer available. Switched back to <span className="font-semibold">Default</span>.
        </div>
      )}

      {/* 2. Default Shell Selection */}
      <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Terminal className="h-4 w-4 text-foreground" />
            Default Shell Runtime
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Select the default shell used when spawning new terminal tabs and agent sessions.
          </p>
        </div>

        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] pt-1">
          {platformShells(
            Object.fromEntries((available ?? []).map((s) => [s.id, s.available]))
          ).map((meta) => {
            const probe = available?.find((s) => s.id === meta.id)
            const detected = probe?.available ?? meta.id === 'default'
            return (
              <ShellCard
                key={meta.id}
                meta={meta}
                detected={detected}
                detectedPath={probe?.detectedPath}
                active={meta.id === shellId}
                onSelect={() => detected && setShellId(meta.id)}
              />
            )
          })}
        </div>
      </section>

      {/* 3. Advanced Terminal Behaviors */}
      <TerminalBehaviorSettings />

      {/* 4. Claude Code Status Line */}
      <StatusLineSettings />
    </div>
  )
}

function StatusLineSettings(): ReactElement {
  const enabled = useStatuslineStore((s) => s.enabled)
  const setEnabled = useStatuslineStore((s) => s.setEnabled)

  return (
    <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">Claude Code Agent Status Line</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Display real-time context token usage, cost estimations, and Orchestron MCP connection status under the prompt.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 pt-1">
        <div>
          <span className="block text-xs font-semibold text-foreground">
            Manage Claude Code Statusline Integration
          </span>
          <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
            Automatically injects statusline hook into <span className="font-mono text-foreground">~/.claude/settings.json</span>.
          </span>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(v) => void setEnabled(v)}
          aria-label="Toggle Claude Code status line"
        />
      </div>
    </section>
  )
}

function TerminalBehaviorSettings(): ReactElement {
  const terminal = useSettingsConfigStore((s) => s.settings.terminalAdvanced)
  const updateTerminal = useSettingsConfigStore((s) => s.updateTerminalAdvanced)

  return (
    <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Cursor & Scrollback Behavior</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Configure terminal cursor rendering, scrollback line limit, and clipboard selection behavior.
        </p>
      </div>

      {/* Cursor Style */}
      <div className="pt-1">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Cursor Shape</label>
        <div className="grid grid-cols-3 gap-2 max-w-sm">
          {(['block', 'underline', 'bar'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => updateTerminal({ cursorStyle: c })}
              className={cn(
                'py-1.5 px-3 rounded-lg text-xs font-medium border capitalize transition-colors',
                terminal.cursorStyle === c
                  ? 'border-foreground bg-muted/60 text-foreground font-semibold shadow-xs ring-1 ring-foreground'
                  : 'border-border bg-card/60 text-muted-foreground hover:bg-muted/30 hover:text-foreground'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Cursor Blink */}
      <div className="flex items-center justify-between py-2.5 border-t border-border">
        <div>
          <span className="text-xs font-medium text-foreground">Cursor Blinking</span>
          <span className="block text-[11px] text-muted-foreground">Smoothly pulse cursor in focused terminal panes</span>
        </div>
        <Switch
          checked={terminal.cursorBlink}
          onCheckedChange={(v) => updateTerminal({ cursorBlink: v })}
          aria-label="Cursor Blinking"
        />
      </div>

      {/* Scrollback Limit */}
      <div className="flex items-center justify-between py-2.5 border-t border-border">
        <div>
          <span className="text-xs font-medium text-foreground">Scrollback Buffer Size</span>
          <span className="block text-[11px] text-muted-foreground">Maximum output history preserved in memory per pane</span>
        </div>
        <select
          value={terminal.scrollbackLimit}
          onChange={(e) => updateTerminal({ scrollbackLimit: parseInt(e.target.value, 10) })}
          aria-label="Scrollback Buffer Size"
          className="rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-foreground"
        >
          <option value={5000}>5,000 lines</option>
          <option value={10000}>10,000 lines</option>
          <option value={25000}>25,000 lines</option>
          <option value={50000}>50,000 lines</option>
        </select>
      </div>

      {/* Copy on Selection */}
      <div className="flex items-center justify-between py-2.5 border-t border-border">
        <div>
          <span className="text-xs font-medium text-foreground">Copy on Selection</span>
          <span className="block text-[11px] text-muted-foreground">Automatically copy highlighted terminal text to system clipboard</span>
        </div>
        <Switch
          checked={terminal.copyOnSelect}
          onCheckedChange={(v) => updateTerminal({ copyOnSelect: v })}
          aria-label="Copy on Selection"
        />
      </div>
    </section>
  )
}

interface ShellCardProps {
  meta: ShellMeta
  detected: boolean
  detectedPath?: string
  active: boolean
  onSelect: () => void
}

function ShellCard({
  meta,
  detected,
  detectedPath,
  active,
  onSelect
}: ShellCardProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!detected}
      aria-pressed={active}
      aria-disabled={!detected}
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-card/60 p-3.5 text-left transition-colors',
        !detected && 'cursor-not-allowed opacity-40',
        detected && active && 'border-foreground bg-muted/60 ring-1 ring-foreground shadow-xs',
        detected && !active && 'border-border hover:bg-muted/30 hover:border-foreground/30'
      )}
    >
      <div className="relative">
        <ShellPreview promptSample={meta.promptSample} active={active} />
        {active && detected && (
          <span
            aria-hidden
            className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background shadow-xs"
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="min-w-0 px-0.5">
        <div className="text-xs font-semibold text-foreground">{meta.label}</div>
        {detected ? (
          <>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{meta.family}</div>
            {detectedPath && (
              <div className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground/80">
                {detectedPath}
              </div>
            )}
          </>
        ) : (
          <div className="mt-0.5 text-[11px] text-muted-foreground/70">Not installed in PATH</div>
        )}
      </div>
    </button>
  )
}

interface ShellPreviewProps {
  promptSample: string
  active: boolean
}

function ShellPreview({ promptSample, active }: ShellPreviewProps): ReactElement {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-canvas shadow-2xs">
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-2.5 py-1.5">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <span className="ml-1.5 font-mono text-[10px] text-muted-foreground/70">shell</span>
      </div>
      <div className="flex flex-col gap-1 px-3 py-3 font-mono text-[10px] leading-tight">
        <div className="text-foreground/85">{promptSample}</div>
        <div className="flex items-center pt-0.5">
          <span className="text-muted-foreground/60">{promptSample.slice(0, 1) || '$'}</span>
          <span
            className={cn(
              'ml-1.5 inline-block h-2.5 w-1.5 bg-foreground/80',
              active && 'animate-pulse'
            )}
            aria-hidden
          />
        </div>
      </div>
    </div>
  )
}

/** Typography & Font Settings */
function TextSettings(): ReactElement {
  const text = useTerminalTextStore((s) => s.text)
  const setFontFamily = useTerminalTextStore((s) => s.setFontFamily)
  const setFontSize = useTerminalTextStore((s) => s.setFontSize)
  const setLineHeight = useTerminalTextStore((s) => s.setLineHeight)
  const setLigatures = useTerminalTextStore((s) => s.setLigatures)
  const reset = useTerminalTextStore((s) => s.reset)

  const matched = MONO_FONTS.find((f) => f.stack === text.fontFamily)
  const [customMode, setCustomMode] = useState(!matched)
  const [customDraft, setCustomDraft] = useState(matched ? '' : primaryFamily(text.fontFamily))

  const isCustom = customMode || !matched
  const selectValue = isCustom ? 'custom' : matched!.id

  function onSelectFont(id: string): void {
    if (id === 'custom') {
      setCustomMode(true)
      setCustomDraft(primaryFamily(text.fontFamily))
      return
    }
    setCustomMode(false)
    const font = MONO_FONTS.find((f) => f.id === id)
    if (font) setFontFamily(font.stack)
  }

  function onCustomChange(value: string): void {
    setCustomDraft(value)
    setFontFamily(customFontStack(value))
  }

  function onReset(): void {
    setCustomMode(false)
    setCustomDraft('')
    reset()
  }

  return (
    <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Typography & Font Rendering</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Configure font family, font size, line spacing, and font ligatures across all terminal panes.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
        >
          Reset to default
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 pt-1">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Font Family</span>
            <select
              value={selectValue}
              onChange={(e) => onSelectFont(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
            >
              {MONO_FONTS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label} ({f.platform})
                  {f.ligatures ? ' · Ligatures' : ''}
                </option>
              ))}
              <option value="custom">Custom font stack...</option>
            </select>
          </label>

          {isCustom && (
            <input
              type="text"
              value={customDraft}
              placeholder="e.g. JetBrains Mono, Fira Code"
              onChange={(e) => onCustomChange(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-foreground"
            />
          )}

          <Stepper
            label="Font Size"
            value={`${text.fontSize} px`}
            onDec={() => setFontSize(text.fontSize - 1)}
            onInc={() => setFontSize(text.fontSize + 1)}
            atMin={text.fontSize <= FONT_SIZE_MIN}
            atMax={text.fontSize >= FONT_SIZE_MAX}
          />

          <Stepper
            label="Line Spacing"
            value={text.lineHeight.toFixed(1)}
            onDec={() => setLineHeight(text.lineHeight - 0.1)}
            onInc={() => setLineHeight(text.lineHeight + 0.1)}
            atMin={text.lineHeight <= LINE_HEIGHT_MIN}
            atMax={text.lineHeight >= LINE_HEIGHT_MAX}
          />

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
            <div>
              <span className="block text-xs font-medium text-foreground">Font Ligatures</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                Requires ligature fonts (Cascadia Code, JetBrains Mono, Fira Code).
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={text.ligatures}
              aria-label="Toggle ligatures"
              onClick={() => setLigatures(!text.ligatures)}
              className={cn(
                'relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none cursor-pointer',
                text.ligatures ? 'bg-foreground' : 'bg-muted'
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform',
                  text.ligatures ? 'translate-x-4' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>
        </div>

        <TextPreview text={text} />
      </div>
    </section>
  )
}

interface StepperProps {
  label: string
  value: string
  onDec: () => void
  onInc: () => void
  atMin: boolean
  atMax: boolean
}

function Stepper({ label, value, onDec, onInc, atMin, atMax }: StepperProps): ReactElement {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon-sm" onClick={onDec} disabled={atMin} aria-label={`Decrease ${label}`}>
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-14 text-center text-xs font-mono font-medium tabular-nums text-foreground">{value}</span>
        <Button variant="outline" size="icon-sm" onClick={onInc} disabled={atMax} aria-label={`Increase ${label}`}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

const PREVIEW_CODE = 'const ok = (a >= b) => a !== b;'
const PREVIEW_GLYPHS = '// 0O 1lI -> |> == === !='

function TextPreview({ text }: { text: TerminalTextPref }): ReactElement {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-canvas shadow-2xs flex flex-col">
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <span className="ml-1.5 font-mono text-[10px] text-muted-foreground/70">typography preview</span>
      </div>
      <div
        className="flex flex-1 flex-col justify-center gap-1 px-4 py-4"
        style={{
          fontFamily: text.fontFamily,
          fontSize: `${text.fontSize}px`,
          lineHeight: text.lineHeight,
          fontFeatureSettings: text.ligatures ? '"liga" 1, "calt" 1' : 'normal'
        }}
      >
        <span className="text-foreground/90 font-medium">{PREVIEW_CODE}</span>
        <span className="text-muted-foreground font-medium">{PREVIEW_GLYPHS}</span>
      </div>
    </div>
  )
}
