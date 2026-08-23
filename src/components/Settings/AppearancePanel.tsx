// src/components/Settings/AppearancePanel.tsx
import { type ReactElement } from 'react'
import { Check, Columns, Palette, ZoomIn, RotateCcw } from 'lucide-react'
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

  const isDefaultZoom = Math.abs(zoom - 1.0) < 0.01

  return (
    <div className="space-y-6 font-sans">
      <section>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Giao diện & Hiển thị
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Tùy chỉnh chủ đề màu sắc, tỉ lệ phóng to/thu nhỏ và kích thước layout ứng dụng.
        </p>
      </section>

      {/* 1. Tỉ lệ phóng to / thu nhỏ giao diện (Simple & Clean) */}
      <section className="rounded-xl border border-border bg-card/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ZoomIn className="h-4 w-4 text-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Tỉ lệ giao diện (Zoom)</h2>
          </div>

          {!isDefaultZoom && (
            <button
              type="button"
              onClick={resetZoom}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Khôi phục 100%</span>
            </button>
          )}
        </div>

        {/* Thanh trượt & Nút chọn nhanh */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0.8}
              max={1.5}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-foreground h-1.5 bg-muted rounded-lg cursor-pointer"
            />
            <span className="font-mono text-xs font-semibold text-foreground bg-muted px-2.5 py-1 rounded border border-border min-w-[55px] text-center">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {ZOOM_PRESETS.map((preset) => {
              const active = Math.abs(zoom - preset.value) < 0.02
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setZoom(preset.value)}
                  className={cn(
                    'rounded px-2.5 py-1 text-xs font-mono transition-colors border',
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

      {/* 2. Chủ đề màu sắc (Themes) */}
      <section className="rounded-xl border border-border bg-card/40 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Chủ đề màu sắc</h2>
        </div>

        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
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

      {/* 3. Độ rộng Sidebar */}
      <section className="rounded-xl border border-border bg-card/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Columns className="h-4 w-4 text-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Độ rộng Sidebar bên trái</h2>
          </div>

          <button
            type="button"
            onClick={resetSidebarWidth}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Mặc định (260px)
          </button>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <input
            type="range"
            min={180}
            max={450}
            step={10}
            value={sidebarWidth}
            onChange={(e) => setSidebarWidth(parseInt(e.target.value, 10))}
            className="flex-1 accent-foreground h-1.5 bg-muted rounded-lg cursor-pointer"
          />
          <span className="font-mono text-xs text-foreground bg-muted px-2.5 py-1 rounded border border-border min-w-[55px] text-center">
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
        'flex items-center justify-between rounded-lg border p-2.5 text-left transition-colors',
        active
          ? 'border-foreground bg-muted/50 ring-1 ring-foreground'
          : 'border-border hover:bg-muted/30'
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className={cn('h-3.5 w-3.5 rounded-full shrink-0', option.accentColor)} />
        <span className="text-xs font-medium text-foreground">{option.label}</span>
      </div>
      {active && <Check className="h-3.5 w-3.5 text-foreground shrink-0" strokeWidth={2.5} />}
    </button>
  )
}
