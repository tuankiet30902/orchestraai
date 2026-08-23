import { useState, useEffect, type ReactElement } from 'react'
import {
  ExternalLink,
  Eye,
  EyeOff,
  Folder,
  FolderOpen,
  RefreshCw,
  Search,
  X
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { fsReadDir, type FileEntry } from '@/tauri/fs'
import { findAvailableEditor, openInEditor, revealInFileManager } from '@/tauri/links'
import { buildEditorCommand, EDITOR_PRIORITY, type EditorId } from '@/lib/editor-command'
import { FileTreeNode } from './FileTreeNode'
import { cn } from '@/lib/utils'

export function FilesPanel(): ReactElement {
  const workspaces = useAppStore((s) => s.workspaces)
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId)
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId)

  const rootPath = activeWorkspace?.cwd ?? ''
  const projectName = rootPath.split(/[/\\]/).filter(Boolean).pop() ?? 'Project'

  const [entries, setEntries] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showHidden, setShowHidden] = useState(false)

  const loadFiles = async (): Promise<void> => {
    if (!rootPath) return
    setLoading(true)
    try {
      const items = await fsReadDir(rootPath, showHidden)
      setEntries(items)
    } catch (err) {
      console.warn('Failed to load project files:', err)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadFiles()
  }, [rootPath, showHidden])

  const handleOpenProjectInEditor = async (): Promise<void> => {
    if (!rootPath) return
    try {
      const editor = await findAvailableEditor(EDITOR_PRIORITY)
      if (editor) {
        const cmd = buildEditorCommand(editor as EditorId, rootPath)
        await openInEditor(cmd.bin, cmd.args)
      } else {
        await revealInFileManager(rootPath)
      }
    } catch {
      await revealInFileManager(rootPath)
    }
  }

  const filtered = entries.filter((e) =>
    search === '' ? true : e.name.toLowerCase().includes(search.toLowerCase())
  )

  if (!activeWorkspace || !rootPath) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground">
        <Folder className="mb-2 h-8 w-8 text-muted-foreground/40" />
        <p className="font-semibold text-foreground">No Workspace Open</p>
        <p className="mt-1 text-[11px]">Open or select a workspace to view its files.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/80 px-3 py-2 shrink-0 bg-muted/20">
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground truncate">
            <FolderOpen className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">{projectName}</span>
          </div>
          <div className="truncate text-[10px] text-muted-foreground font-mono mt-0.5" title={rootPath}>
            {rootPath}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowHidden((prev) => !prev)}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded transition-colors',
              showHidden
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            title={showHidden ? 'Hide dotfiles' : 'Show dotfiles'}
          >
            {showHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => void loadFiles()}
            disabled={loading}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Refresh files"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </button>
          <button
            type="button"
            onClick={() => void handleOpenProjectInEditor()}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Open folder in external editor"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Search / Filter bar */}
      <div className="border-b border-border/60 px-2 py-1.5 shrink-0 bg-card/40">
        <div className="relative flex items-center">
          <Search className="absolute left-2 h-3 w-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter files…"
            className="w-full rounded bg-muted/50 py-1 pl-7 pr-6 text-xs text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary/60 border border-border/50"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Tree list content */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-1">
        {loading && entries.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-xs text-muted-foreground">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading project files…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            {search ? `No files matching "${search}"` : 'Directory is empty'}
          </div>
        ) : (
          <div className="space-y-0.5">
            {filtered.map((entry) => (
              <FileTreeNode
                key={entry.path}
                entry={entry}
                rootPath={rootPath}
                showHidden={showHidden}
                searchQuery={search}
                depth={0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between border-t border-border/60 px-3 py-1 text-[10px] font-mono text-muted-foreground shrink-0 bg-muted/20">
        <span>{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</span>
        <span className="opacity-70">Click file to open in editor</span>
      </div>
    </div>
  )
}
