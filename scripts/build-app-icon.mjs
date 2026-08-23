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

// 1. Full-bleed Apple Squircle (1024x1024 with rx=230) for pristine in-app UI and favicon
const inAppSquircleSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <clipPath id="tile-clip">
      <rect width="1024" height="1024" rx="230.4" ry="230.4" />
    </clipPath>
    <linearGradient id="highlight-border" x1="512" y1="0" x2="512" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.3" />
      <stop offset="0.3" stop-color="#ffffff" stop-opacity="0.08" />
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.02" />
    </linearGradient>
  </defs>

  <!-- Masked High-Resolution Original Art -->
  <g clip-path="url(#tile-clip)">
    <image href="${dataUri}" x="0" y="0" width="1024" height="1024" preserveAspectRatio="xMidYMid slice" />
    <rect width="1024" height="1024" rx="230.4" ry="230.4" fill="none" stroke="url(#highlight-border)" stroke-width="4" />
  </g>
</svg>`

console.log('Rendering 1024x1024 in-app logo and favicon...')
const resvgInApp = new Resvg(inAppSquircleSvg, {
  fitTo: { mode: 'width', value: 1024 }
})
const inAppPngBuffer = resvgInApp.render().asPng()

// Write in-app assets
fs.writeFileSync(path.resolve(root, 'public/logo.png'), inAppPngBuffer)
fs.writeFileSync(path.resolve(root, 'public/favicon.svg'), inAppSquircleSvg)
fs.writeFileSync(path.resolve(root, 'src-tauri/icon-source.svg'), inAppSquircleSvg)
fs.writeFileSync(path.resolve(root, 'src-tauri/icon-source.png'), inAppPngBuffer)

console.log('Generated public/logo.png, public/favicon.svg, and src-tauri/icon-source.png.')

// 2. Build platform icon bundles (.icns, .ico, PNGs)
console.log('Generating platform app bundles (.icns, .ico, PNGs)...')
execSync('npx tauri icon src-tauri/icon-source.png', { cwd: root, stdio: 'inherit' })

console.log('Successfully generated all app icons!')
