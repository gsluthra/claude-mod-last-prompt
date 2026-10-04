export type LastPrompt = string | null

declare module 'claude-code' {
  interface PluginState {
    'last-prompt-band': { text: LastPrompt; isOpen: boolean }
  }
}
