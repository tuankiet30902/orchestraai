// src/components/AgentIcon.tsx
import type { ReactElement } from 'react'
import { Terminal } from 'lucide-react'
import { templateById, type WorkspaceTemplate } from '@/lib/templates'
import { cn } from '@/lib/utils'

interface AgentIconProps {
  template?: WorkspaceTemplate
  agentId?: string | null
  className?: string
}

/**
 * The brand logo for an agent template, or a clean terminal glyph for plain shells.
 */
export function AgentIcon({ template, agentId, className = 'h-3.5 w-3.5' }: AgentIconProps): ReactElement {
  const resolved = template ?? templateById(agentId ?? 'terminal')
  if (resolved.icon) {
    return (
      <img
        src={resolved.icon}
        alt={resolved.name}
        aria-hidden="true"
        className={cn('rounded-[3px] object-contain shrink-0 select-none', className)}
        draggable={false}
      />
    )
  }
  return <Terminal aria-hidden="true" className={cn('text-muted-foreground shrink-0', className)} />
}
