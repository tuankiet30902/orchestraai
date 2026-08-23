import { useEffect, useRef, useState, type ReactElement } from 'react'
import { Check, Copy, LogIn, LogOut, MessagesSquare, Plug, Plus, Trash2 } from 'lucide-react'
import { useOrchestraPitStore } from '@/store/orchestra-pit-store'
import { useAppStore } from '@/store/app-store'
import { joinActiveWorkspaceToRoom } from '@/lib/orchestra-pit-join'
import { Button } from '@/components/ui/button'
import {
  formatTime,
  type TranscriptItem,
  type TranscriptMessage
} from '@/lib/orchestra-pit-transcript'
import { memberColor } from '@/lib/orchestra-pit-identity'
import { tokenizeMarkdown } from '@/lib/orchestra-pit-markdown'
import { cn } from '@/lib/utils'
import { Avatar, jumpToTerminal } from './Avatar'
import { ModeratorComposer } from './ModeratorComposer'

function CodeBlock({ code }: { code: string }): ReactElement {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-1.5 overflow-hidden rounded-md border border-border/80 bg-muted/40 font-mono text-[11px]">
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/70 px-2 py-0.5 text-[10px] text-muted-foreground">
        <span>Snippet</span>
        <button
          onClick={() => void handleCopy()}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-background hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-2 leading-relaxed">{code}</pre>
    </div>
  )
}

function Markdown({ text }: { text: string }): ReactElement {
  return (
    <>
      {tokenizeMarkdown(text).map((tok, i) => {
        if (tok.t === 'bold') return <strong key={i}>{tok.v}</strong>
        if (tok.t === 'code')
          return (
            <code key={i} className="rounded bg-muted px-1 font-mono text-[11px]">
              {tok.v}
            </code>
          )
        if (tok.t === 'codeblock')
          return <CodeBlock key={i} code={tok.v} />
        return <span key={i}>{tok.v}</span>
      })}
    </>
  )
}

const COLLAPSE_OVER_CHARS = 700

function MessageBody({ message }: { message: TranscriptMessage }): ReactElement {
  const [expanded, setExpanded] = useState(false)
  const long = message.content.length > COLLAPSE_OVER_CHARS
  const shown = long && !expanded ? message.content.slice(0, COLLAPSE_OVER_CHARS) : message.content

  const body = (
    <div className="whitespace-pre-wrap break-words text-xs leading-relaxed text-foreground">
      {message.toName !== null && message.mode === 'probe' && (
        <span className="mr-1 text-[10px] text-muted-foreground">→ {message.toName}</span>
      )}
      <Markdown text={shown} />
      {long && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="ml-1 text-[10px] text-[#00b0f4] hover:underline"
        >
          {expanded ? 'Show less' : `Show more (${message.content.length - COLLAPSE_OVER_CHARS} chars)`}
        </button>
      )}
    </div>
  )

  if (message.mode === 'execute') {
    return (
      <div className="my-0.5 rounded-r border-l-2 border-[#f97316] bg-[#f97316]/10 py-1 pl-2 pr-1">
        <div className="text-[10px] font-semibold text-[#f97316]">
          ⚡ EXECUTE{message.toName !== null ? ` → ${message.toName}` : ''}
        </div>
        {body}
      </div>
    )
  }
  return body
}

const SYSTEM_ICONS = {
  join: LogIn,
  leave: LogOut,
  connected: Plug
} as const

function SystemLine({ item }: { item: Extract<TranscriptItem, { kind: 'system' }> }): ReactElement {
  const Icon = SYSTEM_ICONS[item.icon]
  return (
    <div className="flex items-center gap-1.5 px-1 py-1 text-[11px] text-muted-foreground">
      <Icon className={cn('h-3 w-3', item.icon === 'connected' && 'text-[#57f287]')} />
      {item.text}
    </div>
  )
}

function MessageGroup({ item }: { item: Extract<TranscriptItem, { kind: 'group' }> }): ReactElement {
  // The sender may have left — colors derive from the id, so history keeps
  // its identity; the agent icon falls back via the (possibly gone) roster.
  const agentId = useOrchestraPitStore(
    (s) =>
      Object.values(s.membersByRoom)
        .flat()
        .find((m) => m.terminalId === item.fromId)?.agentId ?? null
  )
  return (
    <div className="rounded px-1 py-1 hover:bg-muted/30">
      <div className="flex items-center gap-2">
        <Avatar
          terminalId={item.fromId}
          agentId={agentId}
          onClick={() => jumpToTerminal(item.fromId)}
        />
        <button
          data-no-dnd
          tabIndex={-1}
          onClick={() => jumpToTerminal(item.fromId)}
          className="truncate text-xs font-semibold hover:underline"
          style={{ color: memberColor(item.fromId) }}
        >
          {item.fromName}
        </button>
        <span className="shrink-0 text-[10px] text-muted-foreground">{formatTime(item.firstTs)}</span>
      </div>
      <div className="ml-8 flex flex-col gap-0.5">
        {item.messages.map((m) => (
          <MessageBody key={m.seq} message={m} />
        ))}
      </div>
    </div>
  )
}

export function ClearButton({ roomId }: { roomId: string }): ReactElement {
  const [arming, setArming] = useState(false)
  useEffect(() => {
    if (!arming) return
    const t = setTimeout(() => setArming(false), 3000)
    return () => clearTimeout(t)
  }, [arming])
  if (arming) {
    return (
      <button
        onClick={() => {
          useOrchestraPitStore.getState().clearTranscript(roomId)
          setArming(false)
        }}
        className="rounded bg-[#ed4245]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#ed4245]"
      >
        Clear all?
      </button>
    )
  }
  return (
    <button
      onClick={() => setArming(true)}
      className="text-muted-foreground hover:text-foreground"
      title="Clear the discussion history (members stay)"
      aria-label="Clear discussion"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}

export function DiscussionTab({ items }: { items: TranscriptItem[] }): ReactElement {
  // Auto-follow: only snap to the new bottom when the user was already there,
  // so scrolling up to re-read history isn't yanked away.
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const nearBottomRef = useRef(true)
  const last = items[items.length - 1]
  const lastSeq =
    last === undefined
      ? undefined
      : last.kind === 'group'
        ? last.messages[last.messages.length - 1]?.seq
        : last.seq

  function handleScroll(): void {
    const el = scrollRef.current
    if (!el) return
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  useEffect(() => {
    if (nearBottomRef.current) bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [lastSeq])

  const activeWorkspace = useAppStore((s) => s.workspaces.find((w) => w.id === s.activeWorkspaceId))
  const activeRoomId = useOrchestraPitStore((s) => s.activeRoomId)
  const memberCount = useOrchestraPitStore((s) =>
    activeRoomId !== null ? (s.membersByRoom[activeRoomId]?.length ?? 0) : 0
  )
  const [joining, setJoining] = useState(false)

  const handleJoin = async (): Promise<void> => {
    setJoining(true)
    try {
      await joinActiveWorkspaceToRoom()
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {items.length === 0 ? (
        <div className="m-3 flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 p-6 text-center text-xs text-muted-foreground">
          <MessagesSquare className="mb-2 h-7 w-7 text-muted-foreground/50" />
          <h3 className="text-xs font-semibold text-foreground">Team Pit Discussion</h3>
          <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-muted-foreground">
            {memberCount === 0
              ? 'No terminals in this room yet. Add your workspace panes below to start conducting agents.'
              : 'Room is ready! Send a message below or let connected AI agents converse.'}
          </p>
          {memberCount === 0 && activeWorkspace && (
            <Button
              size="sm"
              onClick={() => void handleJoin()}
              disabled={joining}
              className="mt-3 gap-1.5 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{joining ? 'Adding...' : `Add all panes from "${activeWorkspace.name}"`}</span>
            </Button>
          )}
        </div>
      ) : (
        <div ref={scrollRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto p-1">
          {items.map((item) =>
            item.kind === 'system' ? (
              <SystemLine key={item.seq} item={item} />
            ) : (
              <MessageGroup key={item.firstSeq} item={item} />
            )
          )}
          <div ref={bottomRef} />
        </div>
      )}
      <ModeratorComposer />
    </div>
  )
}
