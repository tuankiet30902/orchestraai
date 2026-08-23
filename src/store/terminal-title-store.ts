import { create } from 'zustand'

/**
 * Per-terminal header titles, keyed by terminalId.
 * - `titles`: dynamic/OSC titles emitted by running tools or auto-detected from commands.
 * - `customTitles`: user-manually customized/pinned titles (overrides dynamic titles).
 */
export interface TerminalTitleStore {
  titles: Record<string, string>
  customTitles: Record<string, string>
  setTitle: (terminalId: string, title: string) => void
  clearTitle: (terminalId: string) => void
  setCustomTitle: (terminalId: string, title: string) => void
  clearCustomTitle: (terminalId: string) => void
}

export const useTerminalTitleStore = create<TerminalTitleStore>((set) => ({
  titles: {},
  customTitles: {},

  setTitle: (terminalId, title) =>
    set((s) => ({ titles: { ...s.titles, [terminalId]: title } })),

  clearTitle: (terminalId) =>
    set((s) => {
      if (!(terminalId in s.titles)) return s
      const titles = { ...s.titles }
      delete titles[terminalId]
      return { titles }
    }),

  setCustomTitle: (terminalId, title) =>
    set((s) => {
      const trimmed = title.trim()
      if (!trimmed) {
        if (!(terminalId in s.customTitles)) return s
        const customTitles = { ...s.customTitles }
        delete customTitles[terminalId]
        return { customTitles }
      }
      return { customTitles: { ...s.customTitles, [terminalId]: trimmed } }
    }),

  clearCustomTitle: (terminalId) =>
    set((s) => {
      if (!(terminalId in s.customTitles)) return s
      const customTitles = { ...s.customTitles }
      delete customTitles[terminalId]
      return { customTitles }
    }),
}))
