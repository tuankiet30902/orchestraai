// src/components/OrchestraPit/MembersTab.tsx
import { useState, type ReactElement } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Plus, Users, X, ChevronDown } from 'lucide-react'
import { useOrchestraPitStore, type OrchestraPitMember } from '@/store/orchestra-pit-store'
import { useTerminalActivityStore } from '@/store/terminal-activity-store'
import { useTerminalTypingStore } from '@/store/terminal-typing-store'
import { useTerminalTitleStore } from '@/store/terminal-title-store'
import { useAgentStateStore } from '@/store/agent-state-store'
import { useAppStore } from '@/store/app-store'
import { collectLeaves } from '@/lib/layout-tree'
import { resolvePaneTitle } from '@/lib/pane-title'
import { DEFAULT_TEMPLATE_ID } from '@/lib/templates'
import { displayState, paneDot } from '@/lib/agent-state/rollup'
import { warRoomLeave, warRoomJoin } from '@/tauri/orchestrapit'
import { MEMBER_DRAG_PREFIX, memberDisplayName } from '@/lib/orchestra-pit-drop'
import { memberColor } from '@/lib/orchestra-pit-identity'
import { joinActiveWorkspaceToRoom } from '@/lib/orchestra-pit-join'
import { buildIntroText } from '@/lib/orchestra-pit-nudge'
import { getTerminalCwd } from '@/lib/terminal-registry'
import { Button } from '@/components/ui/button'
import { AgentIcon } from '@/components/AgentIcon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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
        'group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/60',
        isDragging && 'opacity-40'
      )}
    >
      <Avatar terminalId={member.terminalId} agentId={member.agentId} />
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-xs font-semibold"
          style={{ color: memberColor(member.terminalId) }}
        >
          {member.name}
        </div>
        <div className="truncate text-[10px] font-mono text-muted-foreground">{member.cwd}</div>
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
            className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-xs"
            title="Connected to Orchestra Pit"
          />
        )
      ) : (
        <span
          className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-amber-400 font-mono font-medium"
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
          className="shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-500 font-mono font-semibold"
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
        className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 p-1"
        aria-label={`Remove ${member.name} from the Orchestra Pit`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function MembersTab({ members }: { members: OrchestraPitMember[] }): ReactElement {
  const [joining, setJoining] = useState(false)
  const workspaces = useAppStore((s) => s.workspaces)
  const activeWorkspace = useAppStore((s) => s.workspaces.find((w) => w.id === s.activeWorkspaceId))
  const activeRoomId = useOrchestraPitStore((s) => s.activeRoomId)
  const titles = useTerminalTitleStore((s) => s.titles)
  const customTitles = useTerminalTitleStore((s) => s.customTitles)

  const handleJoinWorkspace = async (): Promise<void> => {
    setJoining(true)
    try {
      await joinActiveWorkspaceToRoom()
    } finally {
      setJoining(false)
    }
  }

  const handleJoinSinglePane = async (
    terminalId: string,
    rawAgentId: string | null | undefined,
    rawCwd: string
  ): Promise<void> => {
    if (!activeRoomId) return
    const resolvedAgent = rawAgentId ?? DEFAULT_TEMPLATE_ID
    const agentId = resolvedAgent === DEFAULT_TEMPLATE_ID ? undefined : resolvedAgent
    const cwd = getTerminalCwd(terminalId) ?? rawCwd
    const displayName = memberDisplayName(
      resolvePaneTitle(resolvedAgent, titles[terminalId], customTitles[terminalId]),
      cwd
    )
    const st = useOrchestraPitStore.getState()
    const peers = (st.membersByRoom[activeRoomId] ?? []).filter((m) => m.terminalId !== terminalId).map((m) => m.name)
    const roomName = st.rooms.find((r) => r.roomId === activeRoomId)?.name ?? 'Orchestra Pit'

    await warRoomJoin({ roomId: activeRoomId, terminalId, agentId, cwd, displayName })
    if (agentId) {
      useOrchestraPitStore.getState().enqueueIntro(terminalId, buildIntroText(roomName, peers))
    }
  }

  // Find all available terminal panes not already joined to this room
  const availablePanes = workspaces.flatMap((ws) =>
    collectLeaves(ws.layout)
      .filter((leaf) => !members.some((m) => m.terminalId === leaf.terminalId))
      .map((leaf) => {
        const agentId = leaf.agentId ?? DEFAULT_TEMPLATE_ID
        const title = resolvePaneTitle(agentId, titles[leaf.terminalId], customTitles[leaf.terminalId])
        return {
          leafId: leaf.id,
          terminalId: leaf.terminalId,
          agentId: leaf.agentId,
          title,
          wsName: ws.name,
          cwd: leaf.cwd ?? ws.cwd
        }
      })
  )

  if (members.length === 0) {
    return (
      <div className="m-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-6 text-center">
        <Users className="mb-2 h-7 w-7 text-muted-foreground/60" />
        <h3 className="text-xs font-semibold text-foreground">No Members in Room</h3>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground max-w-xs">
          Drag & drop terminal panes here or click below to add agents to this collaboration room.
        </p>

        <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
          {activeWorkspace && (
            <Button
              size="sm"
              onClick={() => void handleJoinWorkspace()}
              disabled={joining}
              className="w-full gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{joining ? 'Adding...' : `Add all panes from "${activeWorkspace.name}"`}</span>
            </Button>
          )}

          {availablePanes.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs cursor-pointer">
                  <span>Pick individual terminal...</span>
                  <ChevronDown className="h-3 w-3 ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64">
                {availablePanes.map((p) => (
                  <DropdownMenuItem
                    key={p.terminalId}
                    onSelect={() => void handleJoinSinglePane(p.terminalId, p.agentId, p.cwd)}
                    className="flex items-center gap-2 text-xs"
                  >
                    <AgentIcon agentId={p.agentId} className="h-3.5 w-3.5" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{p.title}</div>
                      <div className="truncate text-[10px] text-muted-foreground">{p.wsName}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-1 space-y-1">
      <div className="flex items-center justify-between px-2 py-1 border-b border-border/40 mb-1">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Active Members ({members.length})
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              Add pane
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {activeWorkspace && (
              <>
                <DropdownMenuItem
                  onSelect={() => void handleJoinWorkspace()}
                  disabled={joining}
                  className="text-xs font-medium"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add all from "{activeWorkspace.name}"
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {availablePanes.length > 0 ? (
              availablePanes.map((p) => (
                <DropdownMenuItem
                  key={p.terminalId}
                  onSelect={() => void handleJoinSinglePane(p.terminalId, p.agentId, p.cwd)}
                  className="flex items-center gap-2 text-xs"
                >
                  <AgentIcon agentId={p.agentId} className="h-3.5 w-3.5" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{p.title}</div>
                    <div className="truncate text-[10px] text-muted-foreground">{p.wsName}</div>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="py-2 px-3 text-center text-xs text-muted-foreground italic">
                All open terminals are in this room
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {members.map((m) => (
        <MemberRow key={m.terminalId} member={m} />
      ))}
    </div>
  )
}
