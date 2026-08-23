import { type ReactElement } from 'react'
import { Check, Columns, Palette } from 'lucide-react'
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

export function AppearancePanel(): ReactElement {
  const style = useAppearanceStore((s) => s.style)
  const setStyle = useAppearanceStore((s) => s.setStyle)

  const sidebarWidth = useNavbarVisibilityStore((s) => s.width)
  const setSidebarWidth = useNavbarVisibilityStore((s) => s.setWidth)
  const resetSidebarWidth = useNavbarVisibilityStore((s) => s.resetWidth)

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Appearance & Themes
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Customise OrchestraAI's dark IDE theme with clean neutral backgrounds and your preferred accent palette.
        </p>
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
        <span className={cn('h-3 w-3 rounded-full', option.accentColor)} />
      </div>
    </button>
  )
}

function TerminalPreview({
  active,
  accentColor
}: {
  active: boolean
  accentColor: string
}): ReactElement {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-canvas text-foreground">
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-2.5 py-1.5">
        <span className="h-2 w-2 rounded-full bg-red-400/80" />
        <span className="h-2 w-2 rounded-full bg-amber-400/80" />
        <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
        <span className="ml-1.5 font-mono text-[9px] text-muted-foreground/70">
          orchestra
        </span>
      </div>
      <div className="flex flex-col gap-1 px-3 py-2.5 font-mono text-[9px] leading-tight">
        <div>
          <span className="text-muted-foreground/60">$</span>
          <span className="ml-1 font-medium text-foreground/85">agy start</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className={cn('h-1.5 w-1.5 rounded-full', accentColor)} />
          <span>agents active</span>
        </div>
        <div className="flex items-center pt-0.5">
          <span className="text-muted-foreground/60">$</span>
          <span
            className={cn(
              'ml-1 inline-block h-2.5 w-1.5 bg-foreground/80',
              active && 'animate-pulse'
            )}
            aria-hidden
          />
        </div>
      </div>
    </div>
  )
}
