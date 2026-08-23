// src/tauri/window.ts
import { getCurrentWindow } from '@tauri-apps/api/window'
import { getCurrentWebview } from '@tauri-apps/api/webview'

function getAppWindow() {
  if (typeof window === 'undefined') return null
  try {
    return getCurrentWindow()
  } catch {
    return null
  }
}

export const minimize = (): Promise<void> => getAppWindow()?.minimize() ?? Promise.resolve()
export const toggleMaximize = (): Promise<void> => getAppWindow()?.toggleMaximize() ?? Promise.resolve()
export const closeWindow = (): Promise<void> => getAppWindow()?.close() ?? Promise.resolve()
export const showWindow = (): Promise<void> => getAppWindow()?.show() ?? Promise.resolve()

/** Set native WebKit / WebView zoom factor (same as Electron / VS Code webFrame zoom). */
export async function setWebviewZoom(scaleFactor: number): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const webview = getCurrentWebview()
    await webview.setZoom(scaleFactor)
  } catch (err) {
    // Non-tauri browser fallback (e.g. during unit tests or web-only preview)
    console.debug('Native webview zoom not available in this context:', err)
  }
}

/** Invoke `cb` with the current maximized state now and on every resize.
 *  Returns an unlisten function. */
export async function onMaximizedChanged(
  cb: (maximized: boolean) => void
): Promise<() => void> {
  const win = getAppWindow()
  if (!win) return () => {}
  cb(await win.isMaximized())
  return win.onResized(async () => {
    const currentWin = getAppWindow()
    if (currentWin) cb(await currentWin.isMaximized())
  })
}

/** Invoke `cb` with the current full-screen state now and on every resize.
 *
 *  Tauri exposes no dedicated full-screen event, but entering/leaving native
 *  macOS full screen always resizes the window, so piggy-backing on `onResized`
 *  catches every transition — including the ones we don't drive ourselves
 *  (green traffic light, ⌃⌘F, Mission Control).
 *  Returns an unlisten function. */
export async function onFullscreenChanged(
  cb: (fullscreen: boolean) => void
): Promise<() => void> {
  const win = getAppWindow()
  if (!win) return () => {}
  cb(await win.isFullscreen())
  return win.onResized(async () => {
    const currentWin = getAppWindow()
    if (currentWin) cb(await currentWin.isFullscreen())
  })
}
