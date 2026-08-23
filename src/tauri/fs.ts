import { invoke } from '@tauri-apps/api/core'

export interface FileEntry {
  name: string
  path: string
  isDir: boolean
  size: number
  extension?: string
}

export function fsReadDir(path: string, showHidden = false): Promise<FileEntry[]> {
  return invoke<FileEntry[]>('fs_read_dir', { path, showHidden })
}
