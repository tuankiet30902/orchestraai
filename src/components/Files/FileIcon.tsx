import type { ReactElement } from 'react'
import {
  File,
  FileCode,
  FileJson,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  Image,
  Layers,
  Settings,
  Terminal
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
      <FolderOpen className={`${className} text-primary shrink-0`} />
    ) : (
      <Folder className={`${className} text-primary/80 shrink-0`} />
    )
  }

  const lower = name.toLowerCase()
  const ext = lower.split('.').pop() ?? ''

  // Special exact names
  if (lower === 'dockerfile' || lower.startsWith('docker-compose')) {
    return <Layers className={`${className} text-blue-400 shrink-0`} />
  }
  if (lower.startsWith('.env')) {
    return <Settings className={`${className} text-yellow-400 shrink-0`} />
  }

  switch (ext) {
    case 'ts':
    case 'tsx':
      return <FileCode className={`${className} text-blue-400 shrink-0`} />
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return <FileCode className={`${className} text-amber-300 shrink-0`} />
    case 'rs':
      return <FileCode className={`${className} text-orange-400 shrink-0`} />
    case 'py':
      return <FileCode className={`${className} text-emerald-400 shrink-0`} />
    case 'go':
      return <FileCode className={`${className} text-cyan-400 shrink-0`} />
    case 'html':
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return <FileCode className={`${className} text-purple-400 shrink-0`} />
    case 'json':
      return <FileJson className={`${className} text-yellow-300 shrink-0`} />
    case 'md':
    case 'markdown':
    case 'txt':
    case 'log':
      return <FileText className={`${className} text-muted-foreground shrink-0`} />
    case 'toml':
    case 'yaml':
    case 'yml':
    case 'ini':
    case 'xml':
      return <Settings className={`${className} text-rose-400 shrink-0`} />
    case 'sh':
    case 'bash':
    case 'zsh':
    case 'fish':
      return <Terminal className={`${className} text-emerald-400 shrink-0`} />
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
    case 'ico':
      return <Image className={`${className} text-pink-400 shrink-0`} />
    case 'csv':
    case 'tsv':
      return <FileSpreadsheet className={`${className} text-emerald-300 shrink-0`} />
    default:
      return <File className={`${className} text-muted-foreground/70 shrink-0`} />
  }
}
