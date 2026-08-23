// scripts/build-app-icon.mjs
import { Resvg } from '@resvg/resvg-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const masterPath = path.resolve(root, 'public/logo-master.png')
if (!fs.existsSync(masterPath) && fs.existsSync('/tmp/orig_logo.png')) {
  fs.copyFileSync('/tmp/orig_logo.png', masterPath)
}

const logoBase64 = fs.readFileSync(masterPath).toString('base64')
const dataUri = `data:image/png;base64,${logoBase64}`

/**
 * 1. Official Apple macOS Human Interface Guidelines Icon Template:
 * - Canvas: 1024 x 1024 px (transparent)
 * - Standard macOS App Squircle Tile: 824 x 824 px (centered at x=100, y=100)
 * - Corner Radius: 185 px (22.5% of 824px)
 * - Transparent Margin: 100 px on all 4 sides
 * - Drop Shadow: Standard macOS Dock elevation shadow
 * 
 * This ensures OrchestraAI has the EXACT same visual size as Safari, Xcode, Finder, VS Code, Notes on macOS Dock!
 */
const macOSAppIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <!-- macOS Standard Squircle Clip Path: 824x824 at (100, 100) with 185px radius -->
    <clipPath id="macos-squircle-clip">
      <rect x="100" y="100" width="824" height="824" rx="185" ry="185" />
    </clipPath>

    <!-- Subtle Inner Bevel / Highlight Stroke -->
    <linearGradient id="bevel-highlight" x1="512" y1="100" x2="512" y2="924" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.32" />
      <stop offset="0.25" stop-color="#ffffff" stop-opacity="0.1" />
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.02" />
    </linearGradient>

    <!-- Standard macOS Desktop & Dock Elevation Shadow -->
    <filter id="macos-dock-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="20" stdDeviation="24" flood-color="#000000" flood-opacity="0.5" />
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- macOS Dock Elevation Shadow Base -->
  <g filter="url(#macos-dock-shadow)">
    <rect x="100" y="100" width="824" height="824" rx="185" ry="185" fill="#09090b" />
  </g>

  <!-- Masked Master 3D Ribbon Art inside the 824x824 Apple Tile -->
  <g clip-path="url(#macos-squircle-clip)">
    <image href="${dataUri}" x="100" y="100" width="824" height="824" preserveAspectRatio="xMidYMid slice" />
  </g>

  <!-- Bevel Highlight Border -->
  <rect x="100" y="100" width="824" height="824" rx="185" ry="185" fill="none" stroke="url(#bevel-highlight)" stroke-width="2.5" />
</svg>`

console.log('Rendering 1024x1024 standard macOS Apple Grid app icon...')
const resvgAppIcon = new Resvg(macOSAppIconSvg, {
  fitTo: { mode: 'width', value: 1024 }
})
const appIconPngBuffer = resvgAppIcon.render().asPng()

// Write SVG and PNG sources for Tauri Desktop Bundler
fs.writeFileSync(path.resolve(root, 'src-tauri/icon-source.svg'), macOSAppIconSvg)
fs.writeFileSync(path.resolve(root, 'src-tauri/icon-source.png'), appIconPngBuffer)
fs.writeFileSync(path.resolve(root, 'public/favicon.svg'), macOSAppIconSvg)

// For in-app logo (`public/logo.png`), we also save this standard rounded squircle
fs.writeFileSync(path.resolve(root, 'public/logo.png'), appIconPngBuffer)

console.log('Generated standard 824x824 squircle icon-source.png.')

// 2. Build platform icon bundles (.icns, .ico, PNGs)
console.log('Generating platform app bundles (.icns, .ico, PNGs)...')
execSync('npx tauri icon src-tauri/icon-source.png', { cwd: root, stdio: 'inherit' })

console.log('Successfully regenerated all macOS and Windows app icons with standard Apple Dock sizing!')
