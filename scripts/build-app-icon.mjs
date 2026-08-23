// scripts/build-app-icon.mjs
import { Resvg } from '@resvg/resvg-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

// Save permanent master reference
if (fs.existsSync('/tmp/orig_logo.png')) {
  fs.copyFileSync('/tmp/orig_logo.png', path.resolve(root, 'public/logo-master.png'))
}

const masterPath = path.resolve(root, 'public/logo-master.png')
const logoBase64 = fs.readFileSync(masterPath).toString('base64')
const dataUri = `data:image/png;base64,${logoBase64}`

const squircleSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <!-- Standard Apple macOS App Icon Squircle: 824x824 on 1024x1024 canvas with 185px corner radius -->
    <clipPath id="squircle-clip">
      <rect x="100" y="100" width="824" height="824" rx="185" ry="185" />
    </clipPath>

    <!-- Subtle Inner Bevel / Highlight Border -->
    <linearGradient id="border-grad" x1="512" y1="100" x2="512" y2="924" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.3" />
      <stop offset="0.3" stop-color="#ffffff" stop-opacity="0.1" />
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.03" />
    </linearGradient>

    <!-- macOS Desktop & Dock Drop Shadow -->
    <filter id="app-shadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#000000" flood-opacity="0.65" />
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Drop Shadow Floor -->
  <g filter="url(#app-shadow)">
    <rect x="100" y="100" width="824" height="824" rx="185" ry="185" fill="#000000" />
  </g>

  <!-- Masked Pristine Original Art inside the Apple Squircle -->
  <g clip-path="url(#squircle-clip)">
    <image href="${dataUri}" x="100" y="100" width="824" height="824" preserveAspectRatio="xMidYMid slice" />
  </g>

  <!-- Inner Highlight Border on top of the mask -->
  <rect x="100" y="100" width="824" height="824" rx="185" ry="185" fill="none" stroke="url(#border-grad)" stroke-width="2.5" />
</svg>`

console.log('Rendering 1024x1024 Apple Squircle rounded icon...')
const resvg = new Resvg(squircleSvg, {
  fitTo: { mode: 'width', value: 1024 }
})
const pngData = resvg.render()
const pngBuffer = pngData.asPng()

// Write SVG and PNG icon sources
fs.writeFileSync(path.resolve(root, 'src-tauri/icon-source.svg'), squircleSvg)
fs.writeFileSync(path.resolve(root, 'src-tauri/icon-source.png'), pngBuffer)
fs.writeFileSync(path.resolve(root, 'public/logo.png'), pngBuffer)
fs.writeFileSync(path.resolve(root, 'public/favicon.svg'), squircleSvg)

console.log('Generated rounded icon-source.png and public/logo.png.')

// Generate all platform icons with tauri CLI
console.log('Generating platform app bundles (.icns, .ico, PNGs)...')
execSync('npx tauri icon src-tauri/icon-source.png', { cwd: root, stdio: 'inherit' })

console.log('Successfully generated all rounded macOS squircle app icons!')
