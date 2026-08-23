// src/components/Logo.tsx
import type { ReactElement } from 'react'

/**
 * Modern OrchestraAI Brand Mark:
 * A sleek, high-precision developer terminal badge with AI prompt and conductor spark.
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
      <rect
        x="2.5"
        y="2.5"
        width="27"
        height="27"
        rx="7"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      {/* Terminal prompt symbol */}
      <path
        d="M9.5 11L14.5 16L9.5 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Terminal cursor line */}
      <path
        d="M17 21H22.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* AI agent conductor spark */}
      <circle cx="21" cy="11.5" r="1.75" fill="currentColor" />
    </svg>
  )
}
