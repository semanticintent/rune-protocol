import type { FoundBinding } from './types'

// Matches Rune hook calls from the TypeScript reference implementation:
//   useRead('binding-name')
//   useSync('binding-name')
//   useAct('action-name', handler)
//   useIntent('id', 'annotation text')
//
// Also matches the rune-host.ts store pattern:
//   host.read('binding-name')
//   host.sync('binding-name', ...)
//   host.act('action-name', ...)
//   host.recordIntent('id', 'annotation')

const HOOKS: Array<{ re: RegExp; rune: FoundBinding['rune'] }> = [
  { re: /useRead\(['"`]([\w-]+)['"`]\)/g,    rune: '@' },
  { re: /host\.read\(['"`]([\w-]+)['"`]\)/g, rune: '@' },
  { re: /useSync\(['"`]([\w-]+)['"`]/g,      rune: '~' },
  { re: /host\.sync\(['"`]([\w-]+)['"`]/g,   rune: '~' },
  { re: /useAct\(['"`]([\w-]+)['"`]/g,       rune: '!' },
  { re: /host\.act\(['"`]([\w-]+)['"`]/g,    rune: '!' },
]

const INTENT_HOOK = /(?:useIntent|host\.recordIntent)\(['"`]([\w-]+)['"`]\s*,\s*['"`]([^'"]+)['"`]\)/g

export function scanTypescript(content: string, filePath: string): FoundBinding[] {
  const found: FoundBinding[] = []
  const lines = content.split('\n')

  lines.forEach((line, idx) => {
    const lineNum = idx + 1

    // Intent hooks first (capture annotation)
    const intentRe = new RegExp(INTENT_HOOK.source, 'g')
    let m: RegExpExecArray | null
    while ((m = intentRe.exec(line)) !== null) {
      const id = m[1]
      if (!found.some(f => f.id === id && f.rune === '?')) {
        found.push({ id, rune: '?', intent: m[2], location: { file: filePath, line: lineNum } })
      }
    }

    // Typed hooks
    for (const { re, rune } of HOOKS) {
      const hookRe = new RegExp(re.source, 'g')
      while ((m = hookRe.exec(line)) !== null) {
        const id = m[1]
        if (!found.some(f => f.id === id && f.rune === rune)) {
          found.push({ id, rune, location: { file: filePath, line: lineNum } })
        }
      }
    }
  })

  return found
}
