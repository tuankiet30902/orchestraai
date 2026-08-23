// src/components/RightPanel/RightPanel.tsx
import type { ReactElement } from 'react'
import { FolderTree, GitBranch, MessagesSquare, RotateCw } from 'lucide-react'
import { useGitStore } from '@/store/git-store'
import { FilesPanel } from '@/components/Files/FilesPanel'
import { GitPanel } from '@/components/Git/GitPanel'
import { OrchestraPitPanel } from '@/components/OrchestraPit/OrchestraPitPanel'

function RefreshButton(): ReactElement {
  const refresh = useGitStore((s) => s.refresh)
  return (
    <button
      onClick={refresh}
      className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      aria-label="Refresh"
      title="Refresh git"
    >
      <RotateCw className="h-3.5 w-3.5" />
    </button>
  )
}

export function RightPanel(): ReactElement {
  const mode = useGitStore((s) => s.mode)
  const setMode = useGitStore((s) => s.setMode)

  function handleFilesTab(): void {
    setMode('files')
  }

  function handleGitTab(): void {
    setMode('git')
  }

  function handleOrchestraPitTab(): void {
    setMode('orchestrapit')
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-l border-border bg-background">
      {/* Mode tab strip with ergonomic collapse button */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 pr-1.5 overflow-hidden">
        {/* Left: Tabs */}
        <div className="flex items-stretch overflow-x-auto no-scrollbar min-w-0 flex-1">
          <button
            onClick={handleFilesTab}
            className={[
              'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs transition-colors font-medium whitespace-nowrap shrink-0',
              mode === 'files' || mode === 'browser'
                ? 'border-b-2 border-foreground bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            <FolderTree className="h-4 w-4 shrink-0" />
            <span>Files</span>
          </button>
          <button
            onClick={handleGitTab}
            className={[
              'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs transition-colors font-medium whitespace-nowrap shrink-0',
              mode === 'git'
                ? 'border-b-2 border-foreground bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            <GitBranch className="h-4 w-4 shrink-0" />
            <span>Git</span>
          </button>
          <button
            onClick={handleOrchestraPitTab}
            className={[
              'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs transition-colors font-medium whitespace-nowrap shrink-0',
              mode === 'orchestrapit' || mode === 'warroom'
                ? 'border-b-2 border-foreground bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            <MessagesSquare className="h-4 w-4 shrink-0" />
            <span>Team Pit</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {mode === 'git' && <RefreshButton />}
        </div>
      </div>

      {/* Mode content */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {(mode === 'files' || mode === 'browser') && <FilesPanel />}
        {mode === 'git' && <GitPanel />}
        {(mode === 'orchestrapit' || mode === 'warroom') && <OrchestraPitPanel />}
      </div>
    </div>
  )
}
