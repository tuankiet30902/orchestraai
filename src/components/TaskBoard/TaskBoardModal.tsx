// src/components/TaskBoard/TaskBoardModal.tsx
import { type ReactElement } from 'react'
import { CheckSquare, X } from 'lucide-react'
import { TaskBoard } from './TaskBoard'

interface TaskBoardModalProps {
  open: boolean
  onClose: () => void
}

export function TaskBoardModal({ open, onClose }: TaskBoardModalProps): ReactElement | null {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[85vh] w-full max-w-5xl flex-col rounded-xl border border-border bg-card shadow-2xl text-foreground font-sans overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted border border-border text-foreground">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Interactive Task & Kanban Board
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage project tasks or drag cards into terminal panes to instruct agents
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Full Task Board */}
        <div className="flex-1 overflow-hidden">
          <TaskBoard isModal />
        </div>
      </div>
    </div>
  )
}
