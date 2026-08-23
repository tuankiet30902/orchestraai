// src/components/Git/ChangedFileList.tsx
import type { ReactElement } from 'react'
import { Check } from 'lucide-react'
import { useGitStore, type ChangedFile } from '@/store/git-store'
import { InlineDiff } from './InlineDiff'

const STATUS_COLOR: Record<string, string> = {
  M: 'text-[#4ec994]',
  A: 'text-[#e2c08d]',
  D: 'text-[#f14c4c]',
  R: 'text-[#4ec994]',
  '?': 'text-muted-foreground'
}

function FileRow({ file }: { file: ChangedFile }): ReactElement {
  const expandedFiles = useGitStore((s) => s.expandedFiles)
  const fileDiffs = useGitStore((s) => s.fileDiffs)
  const toggleFileExpand = useGitStore((s) => s.toggleFileExpand)

  const isExpanded = expandedFiles.has(file.path)
  const diff = fileDiffs.get(file.path) ?? ''
  const basename = file.path.split('/').pop() ?? file.path

  return (
    <div className="border-b border-border/20">
      <div
        className="group flex cursor-pointer items-center gap-1.5 px-2 py-1 hover:bg-accent/50 transition-colors"
        title={file.path}
        onClick={() => toggleFileExpand(file.path)}
      >
        <span className="w-3 shrink-0 text-[10px] text-muted-foreground/60">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className={`w-3 shrink-0 text-[10px] font-bold font-mono ${STATUS_COLOR[file.status] ?? 'text-muted-foreground'}`}>
          {file.status}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs text-foreground font-mono">
          {basename}
        </span>

        {(file.added > 0 || file.removed > 0) && (
          <span className="shrink-0 text-[10px] font-mono">
            {file.added > 0 && <span className="text-[#4ec94e]">+{file.added}</span>}
            {file.added > 0 && file.removed > 0 && <span className="text-muted-foreground"> </span>}
            {file.removed > 0 && <span className="text-[#f14c4c]">-{file.removed}</span>}
          </span>
        )}
      </div>
      {isExpanded && <InlineDiff raw={diff} />}
    </div>
  )
}

export function ChangedFileList(): ReactElement {
  const changedFiles = useGitStore((s) => s.changedFiles)
  const loading = useGitStore((s) => s.loading)
  const error = useGitStore((s) => s.error)

  const tracked = changedFiles.filter((f) => f.status !== '?')
  const untracked = changedFiles.filter((f) => f.status === '?')

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-8 text-xs text-muted-foreground">
        Loading changes…
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-3 py-4 text-xs text-destructive">
        {error}
      </div>
    )
  }

  if (changedFiles.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground">
        <Check className="mb-2 h-6 w-6 text-emerald-400/60" />
        <p className="font-semibold text-foreground">Working tree clean</p>
        <p className="mt-1 text-[11px]">No uncommitted changes in this worktree.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {tracked.length > 0 && (
        <div>
          <div className="flex items-center justify-between px-2 pb-1 pt-2 border-b border-border/40 bg-muted/20">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              Changes
            </span>
            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[10px] font-mono text-emerald-400 font-semibold">
              {tracked.length}
            </span>
          </div>
          {tracked.map((f) => (
            <FileRow key={f.path} file={f} />
          ))}
        </div>
      )}

      {untracked.length > 0 && (
        <div>
          <div className="flex items-center justify-between border-t border-b border-border/40 px-2 pb-1 pt-2 bg-muted/20">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              Untracked Files
            </span>
            <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
              {untracked.length}
            </span>
          </div>
          {untracked.map((f) => (
            <FileRow key={f.path} file={f} />
          ))}
        </div>
      )}
    </div>
  )
}
