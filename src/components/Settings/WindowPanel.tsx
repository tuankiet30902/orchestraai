// src/components/Settings/WindowPanel.tsx
import { useState, type ReactElement } from 'react'
import { RotateCcw } from 'lucide-react'
import { useAppearanceStore } from '@/store/appearance-store'
import { cn } from '@/lib/utils'

// VS Code zoomLevel options (-2 to 3)
const ZOOM_LEVEL_OPTIONS: Array<{ level: number; label: string; percent: string }> = [
  { level: -2, label: '-2 (60%)', percent: '60%' },
  { level: -1.5, label: '-1.5 (70%)', percent: '70%' },
  { level: -1, label: '-1 (80%)', percent: '80%' },
  { level: -0.5, label: '-0.5 (90%)', percent: '90%' },
  { level: 0, label: '0 (100% - Default)', percent: '100%' },
  { level: 0.5, label: '0.5 (110%)', percent: '110%' },
  { level: 1, label: '1 (120%)', percent: '120%' },
  { level: 1.5, label: '1.5 (130%)', percent: '130%' },
  { level: 2, label: '2 (140%)', percent: '140%' },
  { level: 2.5, label: '2.5 (150%)', percent: '150%' },
  { level: 3, label: '3 (160%)', percent: '160%' }
]

export function WindowPanel(): ReactElement {
  const zoom = useAppearanceStore((s) => s.zoom)
  const setZoom = useAppearanceStore((s) => s.setZoom)
  const resetZoom = useAppearanceStore((s) => s.resetZoom)

  // Convert zoom scale (0.6 - 2.0) to VS Code zoomLevel (-2.0 to 3.0)
  // zoomScale = 1.0 + (zoomLevel * 0.2)
  const currentZoomLevel = Math.round(((zoom - 1.0) / 0.2) * 100) / 100
  const isDefault = Math.abs(zoom - 1.0) < 0.01

  const handleZoomLevelChange = (level: number) => {
    const scale = Math.round((1.0 + level * 0.2) * 100) / 100
    setZoom(scale)
  }

  const [restoreWindows, setRestoreWindows] = useState<'all' | 'folders' | 'none'>('all')
  const [zoomWithWheel, setZoomWithWheel] = useState(true)

  return (
    <div className="space-y-8 font-sans">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Window & Display
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Configure window zoom level, display scaling, multi-monitor behavior, and layout restoration.
        </p>
      </section>

      {/* VS Code Style Setting: window.zoomLevel */}
      <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Window: Zoom Level</h2>
              <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                window.zoomLevel
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              Adjust the zoom level of the window. The original size is <code>0</code> (100%) and each increment above (e.g. <code>1</code>) or below (e.g. <code>-1</code>) represents 20% larger or smaller. You can also enter decimals or choose from standard presets.
            </p>
          </div>

          {!isDefault && (
            <button
              type="button"
              onClick={resetZoom}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 shrink-0"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Setting Input & Presets Dropdown (VS Code Standard) */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-3">
            {/* Dropdown Select */}
            <select
              value={currentZoomLevel}
              onChange={(e) => handleZoomLevelChange(parseFloat(e.target.value))}
              aria-label="Window zoom level"
              className="h-8 rounded-md border border-border bg-card px-3 text-xs text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-foreground"
            >
              {ZOOM_LEVEL_OPTIONS.map((opt) => (
                <option key={opt.level} value={opt.level}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Stepper / Slider Input */}
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <input
                type="range"
                min={-2}
                max={3}
                step={0.5}
                value={currentZoomLevel}
                onChange={(e) => handleZoomLevelChange(parseFloat(e.target.value))}
                className="flex-1 accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 font-mono text-xs text-foreground bg-muted px-2.5 py-1 rounded border border-border">
              <span className="font-semibold">{Math.round(zoom * 100)}%</span>
              <span className="text-[10px] text-muted-foreground">({currentZoomLevel > 0 ? `+${currentZoomLevel}` : currentZoomLevel})</span>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-xs text-muted-foreground mr-1">Quick Select:</span>
            {[-1, -0.5, 0, 0.5, 1, 2].map((lvl) => {
              const active = Math.abs(currentZoomLevel - lvl) < 0.05
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleZoomLevelChange(lvl)}
                  className={cn(
                    'rounded px-2 py-0.5 text-[11px] font-mono transition-colors border',
                    active
                      ? 'bg-foreground text-background border-foreground font-bold shadow-xs'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                  )}
                >
                  {lvl === 0 ? '0 (100%)' : lvl > 0 ? `+${lvl} (${Math.round((1 + lvl * 0.2) * 100)}%)` : `${lvl} (${Math.round((1 + lvl * 0.2) * 100)}%)`}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* VS Code Style Setting: window.zoomWithWheel */}
      <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Mouse Wheel & Trackpad Zoom</h2>
              <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                window.zoomWithWheel
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Zoom the font and UI of the window when holding <kbd className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono border border-border">Ctrl</kbd> or <kbd className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono border border-border">⌘</kbd> while scrolling the mouse wheel.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={zoomWithWheel}
            onClick={() => setZoomWithWheel(!zoomWithWheel)}
            className={cn(
              'relative h-5 w-9 shrink-0 rounded-full transition-colors',
              zoomWithWheel ? 'bg-foreground' : 'bg-muted'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform',
                zoomWithWheel ? 'translate-x-4' : 'translate-x-0.5'
              )}
            />
          </button>
        </div>
      </section>

      {/* VS Code Style Setting: window.restoreWindows */}
      <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Restore Workspaces on Startup</h2>
            <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              window.restoreWindows
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Controls how workspaces and terminal layout sessions are reopened when OrchestraAI starts up.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          {[
            { id: 'all', label: 'all', desc: 'Reopen all workspaces and restore split panes' },
            { id: 'folders', label: 'folders', desc: 'Reopen only active workspace folders' },
            { id: 'none', label: 'none', desc: 'Start with clean welcome screen' }
          ].map((item) => (
            <label
              key={item.id}
              onClick={() => setRestoreWindows(item.id as 'all' | 'folders' | 'none')}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                restoreWindows === item.id
                  ? 'border-foreground bg-muted/40'
                  : 'border-border hover:bg-muted/20'
              )}
            >
              <input
                type="radio"
                name="restoreWindows"
                checked={restoreWindows === item.id}
                onChange={() => {}}
                className="accent-foreground"
              />
              <div>
                <div className="text-xs font-mono font-medium text-foreground">{item.label}</div>
                <div className="text-[11px] text-muted-foreground">{item.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </section>
    </div>
  )
}
