import { useState, useEffect, type ReactElement } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, FileCode, Copy } from 'lucide-react'
import { fsReadDir, type FileEntry } from '@/tauri/fs'
import { findAvailableEditor, openInEditor, revealInFileManager } from '@/tauri/links'
import { buildEditorCommand, EDITOR_PRIORITY, type EditorId } from '@/lib/editor-command'
import { writeClipboard } from '@/tauri/clipboard'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { FileIcon } from './FileIcon'
import { cn } from '@/lib/utils'

interface FileTreeNodeProps {
  entry: FileEntry
  rootPath: string
  showHidden: boolean
  searchQuery: string
  depth?: number
  defaultExpanded?: boolean
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function FileTreeNode({
  entry,
  rootPath,
  showHidden,
  searchQuery,
  depth = 0,
  defaultExpanded = false
}: FileTreeNodeProps): ReactElement | null {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [children, setChildren] = useState<FileEntry[] | null>(null)
  const [loading, setLoading] = useState(false)

  // Load children when expanded
  useEffect(() => {
    if (entry.isDir && expanded && children === null && !loading) {
      setLoading(true)
      fsReadDir(entry.path, showHidden)
        .then((items) => {
          setChildren(items)
          setLoading(false)
        })
        .catch((err) => {
          console.warn('Failed to read dir:', entry.path, err)
          setChildren([])
          setLoading(false)
        })
    }
  }, [entry.isDir, entry.path, expanded, children, loading, showHidden])

  // Reload when showHidden changes and folder is expanded
  useEffect(() => {
    if (entry.isDir && expanded) {
      fsReadDir(entry.path, showHidden)
        .then(setChildren)
        .catch(() => setChildren([]))
    }
  }, [showHidden])

  const handleOpen = async (): Promise<void> => {
    if (entry.isDir) {
      setExpanded((prev) => !prev)
      return
    }

    try {
      const editor = await findAvailableEditor(EDITOR_PRIORITY)
      if (editor) {
        const cmd = buildEditorCommand(editor as EditorId, entry.path)
        await openInEditor(cmd.bin, cmd.args)
      } else {
        await revealInFileManager(entry.path)
      }
    } catch (e) {
      console.warn('Failed to open file:', e)
      await revealInFileManager(entry.path)
    }
  }

  const handleCopyPath = (): void => {
    void writeClipboard(entry.path)
  }

  const handleCopyRelativePath = (): void => {
    const rel = entry.path.startsWith(rootPath)
      ? entry.path.slice(rootPath.length).replace(/^[/\\]+/, '')
      : entry.name
    void writeClipboard(rel)
  }

  const handleReveal = (): void => {
    void revealInFileManager(entry.path)
  }

  // Filter check
  const matchesSearch =
    searchQuery === '' || entry.name.toLowerCase().includes(searchQuery.toLowerCase())

  return (
    <div className="select-none">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            onClick={() => void handleOpen()}
            style={{ paddingLeft: `${depth * 14 + 6}px` }}
            className={cn(
              'group flex cursor-pointer items-center gap-1.5 py-1 pr-2 text-xs transition-colors hover:bg-accent/40 rounded-sm',
              matchesSearch ? 'text-foreground' : 'text-muted-foreground opacity-60'
            )}
            title={entry.path}
          >
            {/* Expand / Collapse Icon */}
            {entry.isDir ? (
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-muted-foreground">
                {expanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </span>
            ) : (
              <span className="w-3.5 shrink-0" />
            )}

            {/* File/Folder Icon */}
            <FileIcon name={entry.name} isDir={entry.isDir} expanded={expanded} />

            {/* Name */}
            <span className="flex-1 truncate font-mono text-[11px] leading-tight">
              {entry.name}
            </span>

            {/* File size / meta */}
            {!entry.isDir && entry.size > 0 && (
              <span className="text-[10px] tabular-nums font-mono text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatBytes(entry.size)}
              </span>
            )}
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuItem onSelect={() => void handleOpen()}>
            <FileCode className="h-3.5 w-3.5 mr-1" />
            <span>{entry.isDir ? 'Open Folder' : 'Open in Editor'}</span>
          </ContextMenuItem>
          <ContextMenuItem onSelect={handleReveal}>
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            <span>Reveal in Finder / Explorer</span>
          </ContextMenuItem>
          <ContextMenuItem onSelect={handleCopyPath}>
            <Copy className="h-3.5 w-3.5 mr-1" />
            <span>Copy Absolute Path</span>
          </ContextMenuItem>
          <ContextMenuItem onSelect={handleCopyRelativePath}>
            <Copy className="h-3.5 w-3.5 mr-1" />
            <span>Copy Relative Path</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Children list */}
      {entry.isDir && expanded && (
        <div className="relative">
          {/* Tree guide line */}
          <div
            className="absolute bottom-0 top-0 border-l border-border/50"
            style={{ left: `${depth * 14 + 12}px` }}
          />

          {loading ? (
            <div
              style={{ paddingLeft: `${(depth + 1) * 14 + 6}px` }}
              className="py-1 text-[10px] text-muted-foreground font-mono italic"
            >
              Loading...
            </div>
          ) : children && children.length > 0 ? (
            children.map((child) => (
              <FileTreeNode
                key={child.path}
                entry={child}
                rootPath={rootPath}
                showHidden={showHidden}
                searchQuery={searchQuery}
                depth={depth + 1}
              />
            ))
          ) : (
            <div
              style={{ paddingLeft: `${(depth + 1) * 14 + 6}px` }}
              className="py-1 text-[10px] text-muted-foreground/60 font-mono italic"
            >
              (empty)
            </div>
          )}
        </div>
      )}
    </div>
  )
}
