import { type ReactElement } from 'react'
import { Check, Columns, Palette, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { useAppearanceStore } from '@/store/appearance-store'
import { useNavbarVisibilityStore } from '@/store/navbar-visibility-store'
import { type Style } from '@/lib/appearance'
import { cn } from '@/lib/utils'

interface ThemeDefinition {
  id: Style
  label: string
  surface: string
  accentColor: string
}

const DARK_THEMES: ThemeDefinition[] = [
  { id: 'orchestra-amber', label: 'Orchestra Amber (Default)', surface: 'True Neutral Dark', accentColor: 'bg-amber-500' },
  { id: 'vscode-dark', label: 'VS Code Blue', surface: 'True Neutral Dark', accentColor: 'bg-blue-500' },
  { id: 'tokyo-night', label: 'Tokyo Cyan', surface: 'True Neutral Dark', accentColor: 'bg-cyan-400' },
  { id: 'emerald-dark', label: 'Emerald Green', surface: 'True Neutral Dark', accentColor: 'bg-emerald-500' },
  { id: 'violet-dark', label: 'Violet Purple', surface: 'True Neutral Dark', accentColor: 'bg-violet-500' },
  { id: 'rose-dark', label: 'Rose Pink', surface: 'True Neutral Dark', accentColor: 'bg-rose-500' }
]

const ZOOM_PRESETS = [0.75, 0.9, 1.0, 1.1, 1.25, 1.5]

export function AppearancePanel(): ReactElement {
  const style = useAppearanceStore((s) => s.style)
  const setStyle = useAppearanceStore((s) => s.setStyle)
  const zoom = useAppearanceStore((s) => s.zoom)
  const setZoom = useAppearanceStore((s) => s.setZoom)
  const zoomIn = useAppearanceStore((s) => s.zoomIn)
  const zoomOut = useAppearanceStore((s) => s.zoomOut)
  const resetZoom = useAppearanceStore((s) => s.resetZoom)

  const sidebarWidth = useNavbarVisibilityStore((s) => s.width)
  const setSidebarWidth = useNavbarVisibilityStore((s) => s.setWidth)
  const resetSidebarWidth = useNavbarVisibilityStore((s) => s.resetWidth)

  const zoomPercent = Math.round(zoom * 100)

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Appearance & Display
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Customise OrchestraAI's theme, application zoom scaling, and workspace layout dimensions.
        </p>
      </section>

      {/* Application Zoom & Scaling */}
      <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ZoomIn className="h-4 w-4 text-primary" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">Application Zoom & Scaling</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Scale the whole application UI larger or smaller. Use <kbd className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono border border-border">⌘+</kbd>, <kbd className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono border border-border">⌘-</kbd>, or <kbd className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono border border-border">⌘0</kbd> anytime.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetZoom}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset (100%)</span>
          </button>
        </div>

        {/* Zoom Controls & Slider */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={zoomOut}
            title="Zoom Out (⌘-)"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <input
            type="range"
            min={0.6}
            max={2.0}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
          />

          <button
            type="button"
            onClick={zoomIn}
            title="Zoom In (⌘+)"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <span className="font-mono text-xs font-semibold text-foreground bg-muted px-3 py-1.5 rounded-lg border border-border min-w-[70px] text-center">
            {zoomPercent}%
          </span>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <span className="text-xs text-muted-foreground mr-1">Presets:</span>
          {ZOOM_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setZoom(preset)}
              className={cn(
                'rounded px-2.5 py-1 text-xs font-mono transition-colors border',
                Math.abs(zoom - preset) < 0.01
                  ? 'bg-foreground text-background border-foreground font-semibold'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted'
              )}
            >
              {Math.round(preset * 100)}%
            </button>
          ))}
        </div>
      </section>

      {/* Dark Theme Accent Presets */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Dark Theme Accents (Pure Neutral Black)
          </h2>
        </div>

        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
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

      {/* Sidebar Dimensions */}
      <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Columns className="h-4 w-4 text-primary" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">Left Sidebar Width</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Default expanded width for the left navigation rail. (You can also drag the sidebar border in real-time).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetSidebarWidth}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <input
            type="range"
            min={180}
            max={500}
            step={10}
            value={sidebarWidth}
            onChange={(e) => setSidebarWidth(parseInt(e.target.value, 10))}
            className="flex-1 accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
          />
          <span className="font-mono text-xs text-foreground bg-muted px-2.5 py-1 rounded border border-border min-w-[65px] text-center">
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
        'flex flex-col gap-2.5 rounded-lg border bg-card p-3 text-left transition-colors',
        active
          ? 'border-primary/60 ring-2 ring-primary/20 bg-primary/5'
          : 'border-pane-border hover:border-pane-border/80 hover:bg-muted/40'
      )}
    >
      <div className="relative">
        <TerminalPreview active={active} accentColor={option.accentColor} />
        {active && (
          <span
            aria-hidden
            className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="flex items-center justify-between px-0.5">
        <div>
          <div className="text-xs font-semibold text-foreground">{option.label}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {option.surface}
          </div>
        </div>
      </div>
    </button>
  )
}

function TerminalPreview({ active, accentColor }: { active: boolean; accentColor: string }): ReactElement {
  return (
    <div
      className={cn(
        'h-20 rounded-md border border-pane-border bg-canvas p-2 font-mono text-[10px] leading-tight text-foreground/80 overflow-hidden',
        active && 'border-primary/40'
      )}
    >
      <div className="flex items-center justify-between border-b border-border/50 pb-1 text-[9px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className={cn('h-1.5 w-1.5 rounded-full', accentColor)} />
          <span>terminal 1</span>
        </div>
        <span>zsh</span>
      </div>
      <div className="pt-2 text-muted-foreground space-y-1">
        <div className="flex items-center gap-1">
          <span className="text-primary font-bold">~</span>
          <span className="text-foreground/90">orchestraai dev</span>
        </div>
        <div className="text-emerald-400">ready on localhost:1420</div>
      </div>
    </div>
  )
}
