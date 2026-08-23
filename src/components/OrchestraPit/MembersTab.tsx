import { useState, type ReactElement } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Plus, Users, X } from 'lucide-react'
import { useOrchestraPitStore, type OrchestraPitMember } from '@/store/orchestra-pit-store'
import { useTerminalActivityStore } from '@/store/terminal-activity-store'
import { useTerminalTypingStore } from '@/store/terminal-typing-store'
import { useAgentStateStore } from '@/store/agent-state-store'
import { useAppStore } from '@/store/app-store'
import { displayState, paneDot } from '@/lib/agent-state/rollup'
import { warRoomLeave } from '@/tauri/orchestrapit'
import { MEMBER_DRAG_PREFIX } from '@/lib/orchestra-pit-drop'
import { memberColor } from '@/lib/orchestra-pit-identity'
import { joinActiveWorkspaceToRoom } from '@/lib/orchestra-pit-join'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ActivityDot } from '@/components/ActivityDot'
import { StateDot } from '@/components/StateDot'
import { Avatar, jumpToTerminal } from './Avatar'

const MANUAL_HINT =
  'To connect this agent to Orchestra Pit MCP, ensure it points to $ORCHESTRAAI_MCP_URL with ' +
  'Authorization: Bearer $ORCHESTRAAI_SESSION.'

function MemberRow({ member }: { member: OrchestraPitMember }): ReactElement {
  const active = useTerminalActivityStore((s) => s.active[member.terminalId] ?? false)
  const agentState = useAgentStateStore((s) => s.byId[member.terminalId])
  const dot = paneDot(displayState(agentState), active)
  const heldCount = useOrchestraPitStore((s) =>
    s.held[member.terminalId] === true ? (s.queues[member.terminalId]?.length ?? 0) : 0
  )
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: `${MEMBER_DRAG_PREFIX}${member.terminalId}`
  })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      tabIndex={-1}
      onClick={() => jumpToTerminal(member.terminalId)}
      title={member.cwd}
      className={cn(
        'group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/40 transition-colors',
        isDragging && 'opacity-40'
      )}
    >
      <Avatar terminalId={member.terminalId} agentId={member.agentId} />
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-xs font-medium"
          style={{ color: memberColor(member.terminalId) }}
        >
          {member.name}
        </div>
        <div className="truncate text-[10px] text-muted-foreground">{member.cwd}</div>
      </div>
      {member.connected ? (
        dot !== null ? (
          dot === 'activity' ? (
            <ActivityDot className="h-1.5 w-1.5" />
          ) : (
            <StateDot state={dot} className="h-1.5 w-1.5" />
          )
        ) : (
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
            title="Connected to Orchestra Pit"
          />
        )
      ) : (
        <span
          className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-amber-400 font-mono"
          title={
            'Waiting for agent MCP call. Moderator can still execute commands directly.' +
            (member.agentId === null ? ` ${MANUAL_HINT}` : '')
          }
        >
          ready
        </span>
      )}
      {heldCount > 0 && (
        <button
          data-no-dnd
          onClick={(e) => {
            e.stopPropagation()
            useTerminalTypingStore.getState().clearTyping(member.terminalId)
          }}
          title="Held — click to deliver"
          className="shrink-0 rounded bg-[#f97316]/15 px-1 py-0.5 text-[10px] text-[#f97316]"
        >
          ⏸ {heldCount}
        </button>
      )}
      <button
        data-no-dnd
        onClick={(e) => {
          e.stopPropagation()
          void warRoomLeave(member.terminalId)
        }}
        className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        aria-label={`Remove ${member.name} from the Orchestra Pit`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

export function MembersTab({ members }: { members: OrchestraPitMember[] }): ReactElement {
  const [joining, setJoining] = useState(false)
  const activeWorkspace = useAppStore((s) => s.workspaces.find((w) => w.id === s.activeWorkspaceId))

  const handleJoinWorkspace = async (): Promise<void> => {
    setJoining(true)
    try {
      await joinActiveWorkspaceToRoom()
    } finally {
      setJoining(false)
    }
  }

  if (members.length === 0) {
    return (
      <div className="m-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-6 text-center">
        <Users className="mb-2 h-7 w-7 text-muted-foreground/60" />
        <h3 className="text-xs font-semibold text-foreground">No Members in Room</h3>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground max-w-xs">
          Add terminal panes to this room so agents can collaborate, share tasks, and exchange code.
        </p>

        {activeWorkspace && (
          <Button
            size="sm"
            onClick={() => void handleJoinWorkspace()}
            disabled={joining}
            className="mt-4 gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{joining ? 'Adding...' : `Add all panes from "${activeWorkspace.name}"`}</span>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="p-1 space-y-1">
      <div className="flex items-center justify-between px-2 py-1 border-b border-border/40 mb-1">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Active Members ({members.length})
        </span>
        {activeWorkspace && (
          <button
            type="button"
            onClick={() => void handleJoinWorkspace()}
            disabled={joining}
            className="flex items-center gap-1 text-[11px] text-primary hover:underline"
          >
            <Plus className="h-3 w-3" />
            Add workspace panes
          </button>
        )}
      </div>
      {members.map((m) => (
        <MemberRow key={m.terminalId} member={m} />
      ))}
    </div>
  )
}
