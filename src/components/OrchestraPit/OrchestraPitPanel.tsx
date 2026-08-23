// src/components/OrchestraPit/OrchestraPitPanel.tsx
import { useState, type ReactElement, type ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { MessagesSquare, Sparkles } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useOrchestraPitStore } from '@/store/orchestra-pit-store'
import { WAR_ROOM_DROP_ID } from '@/lib/orchestra-pit-drop'
import { groupTranscript } from '@/lib/orchestra-pit-transcript'
import { MembersTab } from './MembersTab'
import { ClearButton, DiscussionTab } from './DiscussionTab'
import { RoomTabs } from './RoomTabs'
import { cn } from '@/lib/utils'

export function OrchestraPitPanel(): ReactElement {
  const rooms = useOrchestraPitStore((s) => s.rooms)
  const activeRoomId = useOrchestraPitStore((s) => s.activeRoomId)
  const members = useOrchestraPitStore((s) =>
    s.activeRoomId !== null ? (s.membersByRoom[s.activeRoomId] ?? []) : []
  )
  const transcript = useOrchestraPitStore((s) =>
    s.activeRoomId !== null ? (s.transcriptByRoom[s.activeRoomId] ?? []) : []
  )
  const [tab, setTab] = useState<'members' | 'discussion'>('discussion')
  const { setNodeRef, isOver } = useDroppable({ id: WAR_ROOM_DROP_ID })

  const heldByRoom = useOrchestraPitStore(
    useShallow((s) => {
      const out: Record<string, number> = {}
      for (const [roomId, ms] of Object.entries(s.membersByRoom)) {
        let n = 0
        for (const m of ms) if (s.held[m.terminalId]) n += s.queues[m.terminalId]?.length ?? 0
        if (n > 0) out[roomId] = n
      }
      return out
    })
  )
  const heldTotal = heldByRoom[activeRoomId ?? ''] ?? 0

  const memberCountByRoom = useOrchestraPitStore(
    useShallow((s) => {
      const out: Record<string, number> = {}
      for (const [roomId, ms] of Object.entries(s.membersByRoom)) out[roomId] = ms.length
      return out
    })
  )

  const subTab = (key: 'members' | 'discussion', label: ReactNode): ReactElement => (
    <button
      onClick={() => setTab(key)}
      className={cn(
        'rounded-md px-2 py-0.5 text-xs transition-colors font-medium',
        tab === key ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
    </button>
  )

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative flex h-full w-full flex-col overflow-hidden transition-all',
        isOver && 'ring-2 ring-inset ring-amber-500 bg-amber-500/5'
      )}
    >
      {/* Drop Target Visual Overlay */}
      {isOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/85 backdrop-blur-xs border-2 border-dashed border-amber-500 rounded-lg m-2 p-4 text-center select-none pointer-events-none animate-in fade-in-0 duration-150">
          <Sparkles className="h-8 w-8 text-amber-400 animate-bounce mb-2" />
          <span className="text-xs font-semibold text-foreground">Drop terminal here to join Orchestra Pit</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">The agent will connect and collaborate in this room</span>
        </div>
      )}

      <RoomTabs
        rooms={rooms}
        activeRoomId={activeRoomId}
        heldByRoom={heldByRoom}
        memberCountByRoom={memberCountByRoom}
        onSelect={(id) => useOrchestraPitStore.getState().setActiveRoom(id)}
      />
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1.5">
        <MessagesSquare className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
        {subTab(
          'members',
          <>
            {`Members · ${members.length}`}
            {heldTotal > 0 && <span className="ml-1 text-amber-500">⏸{heldTotal}</span>}
          </>
        )}
        {subTab('discussion', 'Discussion')}
        <div className="ml-auto flex items-center">
          {tab === 'discussion' && activeRoomId !== null && <ClearButton roomId={activeRoomId} />}
        </div>
      </div>

      {tab === 'members' ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <MembersTab members={members} />
        </div>
      ) : (
        <DiscussionTab items={groupTranscript(transcript)} />
      )}
    </div>
  )
}
