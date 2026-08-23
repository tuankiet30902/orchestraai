import { type ReactElement } from 'react'
import { getShortcutGroups } from '@/lib/keybindings'
import { isMacPlatform } from '@/lib/platform'

// Platform never changes at runtime; compute the display groups once instead
// of re-reading navigator and reallocating on every render.
const groups = getShortcutGroups(isMacPlatform())

export function KeyboardShortcutsPanel(): ReactElement {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Keyboard Shortcuts
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Default keybindings for OrchestraAI. Shortcuts cannot be rebound yet.
        </p>
      </section>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-1.5 pr-8 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground w-2/3">
              Action
            </th>
            <th className="pb-1.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Keybinding
            </th>
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group.id}>
            <tr>
              <td
                colSpan={2}
                className="pt-6 pb-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/80"
              >
                {group.label}
              </td>
            </tr>
            {group.entries.map((entry) => (
              <tr
                key={entry.description}
                className="border-b border-border/40 transition-colors hover:bg-muted/30"
              >
                <td className="py-2.5 pr-8 text-foreground/90 text-xs">{entry.description}</td>
                <td className="py-2.5">
                  <span className="flex items-center gap-1">
                    {entry.keys.map((token, i) => (
                      token.startsWith('+')
                        ? <span key={i} className="text-xs text-muted-foreground">{token}</span>
                        : <kbd
                            key={i}
                            className="inline-flex items-center rounded border border-border bg-card px-2 py-0.5 font-mono text-[11px] text-foreground shadow-xs"
                          >
                            {token}
                          </kbd>
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  )
}
