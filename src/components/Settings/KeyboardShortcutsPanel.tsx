// src/components/Settings/KeyboardShortcutsPanel.tsx
import { useState, useMemo, type ReactElement } from 'react'
import { Search, X } from 'lucide-react'
import { getShortcutGroups } from '@/lib/keybindings'
import { isMacPlatform } from '@/lib/platform'

// Platform never changes at runtime; compute the display groups once
const groups = getShortcutGroups(isMacPlatform())

export function KeyboardShortcutsPanel(): ReactElement {
  const [filterQuery, setFilterQuery] = useState('')

  const filteredGroups = useMemo(() => {
    if (!filterQuery.trim()) return groups
    const q = filterQuery.toLowerCase().trim()

    return groups
      .map((g) => ({
        ...g,
        entries: g.entries.filter(
          (e) =>
            e.description.toLowerCase().includes(q) ||
            e.keys.some((k) => k.toLowerCase().includes(q))
        )
      }))
      .filter((g) => g.entries.length > 0)
  }, [filterQuery])

  return (
    <div className="space-y-8 font-sans">
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Keyboard Shortcuts
            </h1>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
              Quick reference guide for global application hotkeys, split layout controls, and navigation.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Shortcuts */}
      <section className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter shortcuts (split, close, zoom)..."
            className="w-full h-8 rounded-lg border border-input bg-card pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-1 focus:ring-foreground transition-all"
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Shortcuts Table */}
        <div className="rounded-xl border border-border bg-card/40 overflow-hidden shadow-2xs">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="py-2.5 px-4 text-left font-semibold uppercase tracking-wider text-[10px] w-3/5">
                  Command / Action
                </th>
                <th className="py-2.5 px-4 text-right font-semibold uppercase tracking-wider text-[10px]">
                  Keybinding
                </th>
              </tr>
            </thead>
            {filteredGroups.map((group) => (
              <tbody key={group.id} className="divide-y divide-border/40">
                <tr className="bg-muted/20">
                  <td
                    colSpan={2}
                    className="py-2 px-4 text-[11px] font-bold uppercase tracking-wider text-foreground/80"
                  >
                    {group.label}
                  </td>
                </tr>
                {group.entries.map((entry) => (
                  <tr
                    key={entry.description}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="py-2.5 px-4 text-foreground/90 font-medium">{entry.description}</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 justify-end">
                        {entry.keys.map((token, i) =>
                          token.startsWith('+') ? (
                            <span key={i} className="text-xs text-muted-foreground font-mono">
                              {token}
                            </span>
                          ) : (
                            <kbd
                              key={i}
                              className="inline-flex items-center rounded-md border border-border bg-card px-2 py-0.5 font-mono text-[11px] font-medium text-foreground shadow-2xs"
                            >
                              {token}
                            </kbd>
                          )
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}

            {filteredGroups.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={2} className="py-8 text-center text-xs text-muted-foreground italic">
                    No matching keyboard shortcuts found
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </section>
    </div>
  )
}
