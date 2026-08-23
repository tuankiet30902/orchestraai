/** How the worktree chip renders at a given header width. */
export type WorktreeDisplay = 'full' | 'name-trunc' | 'icon' | 'hidden'

export interface HeaderLevel {
  /** false → the folder trigger collapses to an icon (no path label). */
  showFolderPath: boolean
  /** false → the shell trigger collapses to an icon (no shell label). */
  showShellLabel: boolean
  /** false → hide token usage badge on narrow widths to avoid clipping title. */
  showTokenBar: boolean
  worktree: WorktreeDisplay
}

/**
 * Resolve which header chips render at full detail for a given header width.
 *
 * Priority — survives longest as the pane narrows: title > actions > folder > shell > token > worktree.
 */
export function resolveHeaderLevel(widthPx: number, hasWorktree: boolean): HeaderLevel {
  const showFolderPath = widthPx >= 180
  const showShellLabel = widthPx >= 220
  const showTokenBar = widthPx >= 260

  let worktree: WorktreeDisplay = 'hidden'
  if (hasWorktree) {
    if (widthPx >= 320) worktree = 'full'
    else if (widthPx >= 260) worktree = 'name-trunc'
    else worktree = 'icon'
  }

  return { showFolderPath, showShellLabel, showTokenBar, worktree }
}

/** Compact folder label for the header — the trailing path segment only. */
export function shortenPath(path: string): string {
  const parts = path.split(/[/\\]+/).filter(Boolean)
  return parts[parts.length - 1] ?? path
}
