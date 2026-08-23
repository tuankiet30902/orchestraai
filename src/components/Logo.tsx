// src/components/Logo.tsx
import type { ReactElement } from 'react'

/**
 * OrchestraAI Official 3D Ribbon Letter "O" Brand Mark.
 * Renders the sleek origami-folded letter 'O' with high-precision vector gradients.
 */
export function Logo({ className = 'h-5 w-5', useImage = false }: { className?: string; useImage?: boolean }): ReactElement {
  if (useImage) {
    return (
      <img
        src="/logo.png"
        alt="OrchestraAI"
        className={`${className} object-contain rounded-md`}
        draggable={false}
      />
    )
  }

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Top-left folding ribbon gradient */}
        <linearGradient id="o-fold-grad" x1="32" y1="25" x2="52" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#e2e8f0" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>

        {/* Main body ribbon gradient */}
        <linearGradient id="o-body-grad" x1="32" y1="35" x2="68" y2="75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#f8fafc" />
          <stop offset="0.8" stopColor="#cbd5e1" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>

        {/* Bottom fold depth shadow gradient */}
        <linearGradient id="o-bottom-shadow" x1="40" y1="55" x2="58" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#475569" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="#94a3b8" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 1. Main Right & Bottom Continuous Loop */}
      <path
        d="M41 38 C41 38 48 32.5 53 32.5 C60 32.5 61 40 61 50 C61 60 56 65.5 50 65.5 C43.5 65.5 39 58 39 52 L32 52 C32 63 39 74.5 50 74.5 C62 74.5 69 64 69 50 C69 36 61 25.5 49 25.5 C44 25.5 38.5 28 35 32 L41 38 Z"
        fill="url(#o-body-grad)"
      />

      {/* 2. Top-Left Folding Ribbon Flap */}
      <path
        d="M32 42.5 L41.5 34 C43.5 32.2 46.5 30.5 50 30 C45 27 39 27.5 35 31 C32 34 31.5 38 32 42.5 Z"
        fill="url(#o-fold-grad)"
      />

      {/* 3. Outer Left Stem to Top-Left Arch */}
      <path
        d="M32 42.5 C31.8 36.5 34 30.5 39 27 C44 23.5 51 24 56 26.5 C50 25.5 43 27 38.5 31 C34.5 34.5 32.5 38.5 32 42.5 Z"
        fill="#ffffff"
      />

      {/* 4. Bottom Depth Crease Shadow */}
      <path
        d="M40 54 C40 62 45 66 50 66 C55 66 60 62 60 52 C60 62 55 72 49 72 C43 72 38 65 38 56 L40 54 Z"
        fill="url(#o-bottom-shadow)"
      />

      {/* 5. Left Notch Cutout Line */}
      <path
        d="M31.5 43 L41.5 34"
        stroke="#09090b"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
