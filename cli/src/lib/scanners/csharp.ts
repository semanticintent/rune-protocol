import type { FoundBinding } from './types'

// Matches Rune attributes from the C# reference implementation:
//   [RuneState]     → ~ (next property name, PascalCase → kebab-case)
//   [RuneComputed]  → @ (next property name)
//   [RuneAction]    → ! (next method name)
//   [RuneIntent("annotation")] → adds intent to the next member (stacks with rune type)
//
// Multiple attributes on the same member are accumulated — [RuneState] + [RuneIntent("...")]
// produces a ~ binding with the intent annotation, not a separate ? binding.

function toKebab(name: string): string {
  return name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
}

const RUNE_STATE    = /\[RuneState\]/
const RUNE_COMPUTED = /\[RuneComputed\]/
const RUNE_ACTION   = /\[RuneAction\]/
const RUNE_INTENT   = /\[RuneIntent\("([^"]+)"\)\]/
const MEMBER_NAME   = /(?:public|private|protected|internal)\s+\S+\s+(\w+)\s*[({]/

export function scanCsharp(content: string, filePath: string): FoundBinding[] {
  const found: FoundBinding[] = []
  const lines = content.split('\n')

  let pendingRune: FoundBinding['rune'] | null = null
  let pendingIntent: string | undefined = undefined
  let pendingLine = 0

  function flush(memberName: string, lineNum: number) {
    if (!pendingRune) return
    const id = toKebab(memberName)
    if (!found.some(f => f.id === id && f.rune === pendingRune)) {
      found.push({
        id,
        rune: pendingRune,
        ...(pendingIntent ? { intent: pendingIntent } : {}),
        location: { file: filePath, line: pendingLine },
      })
    }
    pendingRune = null
    pendingIntent = undefined
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx]
    const lineNum = idx + 1

    // Check for member name — flushes any accumulated pending
    const memberMatch = MEMBER_NAME.exec(line)
    if (memberMatch && pendingRune) {
      flush(memberMatch[1], lineNum)
      continue
    }

    // Accumulate Rune attributes — these may stack on one member
    if (RUNE_STATE.test(line)) {
      if (!pendingRune) pendingLine = lineNum
      pendingRune = '~'
    } else if (RUNE_COMPUTED.test(line)) {
      if (!pendingRune) pendingLine = lineNum
      pendingRune = '@'
    } else if (RUNE_ACTION.test(line)) {
      if (!pendingRune) pendingLine = lineNum
      pendingRune = '!'
    }

    const intentMatch = RUNE_INTENT.exec(line)
    if (intentMatch) {
      if (!pendingRune) {
        pendingLine = lineNum
        pendingRune = '?'
      }
      pendingIntent = intentMatch[1]
    }

    // Non-attribute, non-member line resets accumulation (class/namespace/blank)
    if (!line.trim().startsWith('[') && !line.trim().startsWith('//') && line.trim() !== '' && !memberMatch && pendingRune) {
      const isContinuation = line.trim().startsWith('{') || line.includes('=>') || line.trim() === '}'
      if (!isContinuation) {
        pendingRune = null
        pendingIntent = undefined
      }
    }
  }

  return found
}
