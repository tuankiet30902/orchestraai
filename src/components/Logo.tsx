// src/components/Logo.tsx
import type { ReactElement } from 'react'

/**
 * OrchestraAI Official 3D Ribbon Letter "O" Brand Mark.
 * Uses the standard Apple squircle rounded-corner app icon with drop shadow and crisp retina resolution.
 */
export function Logo({ className = 'h-5 w-5' }: { className?: string }): ReactElement {
  return (
    <img
      src="/logo.png"
      alt="OrchestraAI"
      className={`${className} object-contain rounded-md select-none shrink-0`}
      draggable={false}
    />
  )
}
