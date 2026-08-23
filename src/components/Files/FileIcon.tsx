// src/components/Files/FileIcon.tsx
import type { ReactElement } from 'react'
import {
  File,
  FileCode2,
  FileJson2,
  FileSpreadsheet,
  FileText,
  FileImage,
  FolderGit2,
  FolderOpen,
  Layers,
  Settings2,
  SquareTerminal
} from 'lucide-react'

interface FileIconProps {
  name: string
  isDir: boolean
  expanded?: boolean
  className?: string
}

export function FileIcon({ name, isDir, expanded = false, className = 'h-3.5 w-3.5' }: FileIconProps): ReactElement {
  if (isDir) {
    return expanded ? (
      <FolderOpen className={`${className} text-foreground/90 shrink-0`} />
    ) : (
      <FolderGit2 className={`${className} text-muted-foreground shrink-0`} />
    )
  }

  const lower = name.toLowerCase()
  const ext = lower.split('.').pop() ?? ''

  // Special exact names
  if (lower === 'dockerfile' || lower.startsWith('docker-compose')) {
    return <Layers className={`${className} text-sky-400 shrink-0`} />
  }
  if (lower.startsWith('.env') || lower.startsWith('.git')) {
    return <Settings2 className={`${className} text-amber-400 shrink-0`} />
  }

  switch (ext) {
    case 'ts':
    case 'tsx':
      return <FileCode2 className={`${className} text-sky-400 shrink-0`} />
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return <FileCode2 className={`${className} text-amber-300 shrink-0`} />
    case 'rs':
      return <FileCode2 className={`${className} text-orange-400 shrink-0`} />
    case 'py':
      return <FileCode2 className={`${className} text-emerald-400 shrink-0`} />
    case 'go':
      return <FileCode2 className={`${className} text-cyan-400 shrink-0`} />
    case 'html':
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return <FileCode2 className={`${className} text-purple-400 shrink-0`} />
    case 'json':
      return <FileJson2 className={`${className} text-amber-400 shrink-0`} />
    case 'md':
    case 'markdown':
    case 'txt':
    case 'log':
      return <FileText className={`${className} text-emerald-400 shrink-0`} />
    case 'toml':
    case 'yaml':
    case 'yml':
    case 'ini':
    case 'xml':
      return <Settings2 className={`${className} text-rose-400 shrink-0`} />
    case 'sh':
    case 'bash':
    case 'zsh':
    case 'fish':
      return <SquareTerminal className={`${className} text-emerald-400 shrink-0`} />
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
    case 'ico':
      return <FileImage className={`${className} text-pink-400 shrink-0`} />
    case 'csv':
    case 'tsv':
      return <FileSpreadsheet className={`${className} text-emerald-300 shrink-0`} />
    default:
      return <File className={`${className} text-muted-foreground/70 shrink-0`} />
  }
}
