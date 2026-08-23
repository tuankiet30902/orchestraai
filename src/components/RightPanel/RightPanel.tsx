// src/components/RightPanel/RightPanel.tsx
import type { ReactElement } from 'react'
import { BrowserColumn } from '@/components/Browser/BrowserColumn'

export function RightPanel(): ReactElement {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-l border-border bg-background">
      <BrowserColumn />
    </div>
  )
}
