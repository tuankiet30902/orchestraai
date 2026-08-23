// src/components/Logo.tsx
import type { ReactElement } from 'react'

/**
 * OrchestraAI Master Brand Emblem:
 * A high-precision geometric Letter 'O' featuring concentric multi-agent orbits
 * and a central conductor spark.
 */
export function Logo({ className = 'h-5 w-5' }: { className?: string }): ReactElement {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer Main Letter 'O' Ring */}
      <circle
        cx="16"
        cy="16"
        r="12.5"
        stroke="currentColor"
        strokeWidth="2.75"
      />

      {/* Inner Concentric Orchestration Orbit */}
      <circle
        cx="16"
        cy="16"
        r="7.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeDasharray="3 2"
        strokeOpacity="0.6"
      />

      {/* Central Conductor Core & Star Spark */}
      <circle cx="16" cy="16" r="2.2" fill="currentColor" />
      <path
        d="M16 10.5V21.5M10.5 16H21.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />

      {/* 4 Agent Cardinal Nodes around the 'O' Ring */}
      <circle cx="16" cy="3.5" r="1.5" fill="currentColor" />
      <circle cx="28.5" cy="16" r="1.5" fill="currentColor" />
      <circle cx="16" cy="28.5" r="1.5" fill="currentColor" />
      <circle cx="3.5" cy="16" r="1.5" fill="currentColor" />
    </svg>
  )
}
