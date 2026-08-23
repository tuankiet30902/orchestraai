// src/components/Settings/AppearancePanel.tsx
import { type ReactElement } from 'react'
import { Check, Columns, Palette, ZoomIn, RotateCcw } from 'lucide-react'
import { useAppearanceStore } from '@/store/appearance-store'
import { useNavbarVisibilityStore } from '@/store/navbar-visibility-store'
import { type Style, DEFAULT_ZOOM } from '@/lib/appearance'
import { cn } from '@/lib/utils'

interface ThemeDefinition {
  id: Style
  label: string
  description: string
  accentColor: string
}

const DARK_THEMES: ThemeDefinition[] = [
  { id: 'orchestra-amber', label: 'Orchestra Amber (Default)', description: 'Warm amber accent on obsidian dark', accentColor: 'bg-amber-500' },
  { id: 'vscode-dark', label: 'VS Code Blue', description: 'Classic developer modern dark with blue focus', accentColor: 'bg-blue-500' },
  { id: 'tokyo-night', label: 'Tokyo Cyan', description: 'Vibrant neon cyan accents with deep navy contrast', accentColor: 'bg-cyan-400' },
  { id: 'emerald-dark', label: 'Emerald Green', description: 'Clean emerald highlights on charcoal background', accentColor: 'bg-emerald-500' },
  { id: 'violet-dark', label: 'Violet Purple', description: 'Sleek amethyst purple accent on midnight surface', accentColor: 'bg-violet-500' },
  { id: 'rose-dark', label: 'Rose Pink', description: 'Subtle rose pink tones for high visual contrast', accentColor: 'bg-rose-500' }
]

const ZOOM_PRESETS = [
  { value: 0.8, label: '80%' },
  { value: 0.9, label: '90%' },
  { value: 1.0, label: '100%' },
  { value: 1.1, label: '110%' },
  { value: 1.25, label: '125%' },
  { value: 1.5, label: '150%' }
]

export function AppearancePanel(): ReactElement {
  const style = useAppearanceStore((s) => s.style)
  const setStyle = useAppearanceStore((s) => s.setStyle)
  const zoom = useAppearanceStore((s) => s.zoom)
  const setZoom = useAppearanceStore((s) => s.setZoom)
  const resetZoom = useAppearanceStore((s) => s.resetZoom)

  const sidebarWidth = useNavbarVisibilityStore((s) => s.width)
  const setSidebarWidth = useNavbarVisibilityStore((s) => s.setWidth)
  const resetSidebarWidth = useNavbarVisibilityStore((s) => s.resetWidth)

  const isDefaultZoom = Math.abs(zoom - DEFAULT_ZOOM) < 0.01

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Appearance & Display
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Customize UI scaling, color themes, and primary layout dimensions for your workspace.
        </p>
      </section>

      {/* 1. Interface Zoom & UI Scaling */}
      <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ZoomIn className="h-4 w-4 text-foreground" />
              Interface Zoom & Scaling
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Scale the entire application interface, typography, buttons, and panels proportionally.
            </p>
          </div>

          {!isDefaultZoom && (
            <button
              type="button"
              onClick={resetZoom}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset ({Math.round(DEFAULT_ZOOM * 100)}%)</span>
            </button>
          )}
        </div>

        {/* Zoom Slider and Preset Chips */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0.8}
              max={1.5}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              aria-label="UI Scale Slider"
              className="flex-1 accent-foreground h-1.5 bg-muted rounded-lg cursor-pointer"
            />
            <span className="font-mono text-xs font-semibold text-foreground bg-muted px-3 py-1.5 rounded-md border border-border min-w-[60px] text-center shadow-2xs">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-muted-foreground font-medium mr-1">Presets:</span>
            {ZOOM_PRESETS.map((preset) => {
              const active = Math.abs(zoom - preset.value) < 0.02
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setZoom(preset.value)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-mono transition-colors border',
                    active
                      ? 'bg-foreground text-background border-foreground font-semibold shadow-xs'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                  )}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* 2. Color Themes */}
      <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Palette className="h-4 w-4 text-foreground" />
            Theme & Accent Color
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Select your preferred dark accent palette for the active workspace.
          </p>
        </div>

        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] pt-1">
          {DARK_THEMES.map((opt) => (
            <ThemeCard
              key={opt.id}
              option={opt}
              active={opt.id === style}
              onSelect={() => setStyle(opt.id)}
            />
          ))}
        </div>
      </section>

      {/* 3. Primary Sidebar Width */}
      <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Columns className="h-4 w-4 text-foreground" />
              Primary Sidebar Width
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Default width for the left activity sidebar (Explorer, Git, Orchestra Pit).
            </p>
          </div>

          <button
            type="button"
            onClick={resetSidebarWidth}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Reset (260px)
          </button>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <input
            type="range"
            min={180}
            max={450}
            step={10}
            value={sidebarWidth}
            onChange={(e) => setSidebarWidth(parseInt(e.target.value, 10))}
            aria-label="Sidebar Width Slider"
            className="flex-1 accent-foreground h-1.5 bg-muted rounded-lg cursor-pointer"
          />
          <span className="font-mono text-xs text-foreground bg-muted px-3 py-1.5 rounded-md border border-border min-w-[60px] text-center shadow-2xs">
            {sidebarWidth}px
          </span>
        </div>
      </section>
    </div>
  )
}

interface ThemeCardProps {
  option: ThemeDefinition
  active: boolean
  onSelect: () => void
}

function ThemeCard({ option, active, onSelect }: ThemeCardProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        'flex items-center justify-between rounded-xl border p-3.5 text-left transition-colors',
        active
          ? 'border-foreground bg-muted/60 ring-1 ring-foreground shadow-xs'
          : 'border-border bg-card/60 hover:bg-muted/30 hover:border-foreground/30'
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn('h-4 w-4 rounded-full shrink-0 shadow-xs', option.accentColor)} />
        <div>
          <div className="text-xs font-semibold text-foreground">{option.label}</div>
          <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{option.description}</div>
        </div>
      </div>
      {active && <Check className="h-4 w-4 text-foreground shrink-0 ml-2" strokeWidth={2.5} />}
    </button>
  )
}
