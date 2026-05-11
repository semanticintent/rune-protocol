export type RuneSigil = '@' | '~' | '!' | '?'

export interface FoundBinding {
  id: string
  rune: RuneSigil
  intent?: string
  args?: Array<{ name: string }>
  location: { file: string; line: number }
}
