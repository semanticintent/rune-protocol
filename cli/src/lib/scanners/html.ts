import type { FoundBinding, RuneSigil } from './types'

// Matches Rune sigils in HTML attribute positions:
//   <tag @binding-name />          — attribute name
//   <tag ~binding-name />          — attribute name
//   <tag !action-name />           — attribute name
//   <tag ?"annotation text" />     — intent annotation (attribute name + value)
//   value="@binding-name"          — attribute value

const ATTR_SIGIL = /[@~!]([\w-]+)/g
const INTENT_ATTR = /\?"([^"]+)"/g
const VALUE_SIGIL = /["'=]([@~!])([\w-]+)/g

export function scanHtml(content: string, filePath: string): FoundBinding[] {
  const found: FoundBinding[] = []
  const lines = content.split('\n')

  lines.forEach((line, idx) => {
    const lineNum = idx + 1

    // Intent annotations: ?"annotation text"
    let m: RegExpExecArray | null
    const intentRe = new RegExp(INTENT_ATTR.source, 'g')
    while ((m = intentRe.exec(line)) !== null) {
      found.push({ id: `intent-${lineNum}`, rune: '?', intent: m[1], location: { file: filePath, line: lineNum } })
    }

    // Sigil attribute names: @id, ~id, !id
    const sigilRe = new RegExp(ATTR_SIGIL.source, 'g')
    while ((m = sigilRe.exec(line)) !== null) {
      const sigil = m[0][0] as RuneSigil
      const id = m[1]
      if (!found.some(f => f.id === id && f.rune === sigil)) {
        found.push({ id, rune: sigil, location: { file: filePath, line: lineNum } })
      }
    }

    // Sigil in attribute values: value="@binding"
    const valueSigilRe = new RegExp(VALUE_SIGIL.source, 'g')
    while ((m = valueSigilRe.exec(line)) !== null) {
      const sigil = m[1] as RuneSigil
      const id = m[2]
      if (!found.some(f => f.id === id && f.rune === sigil)) {
        found.push({ id, rune: sigil, location: { file: filePath, line: lineNum } })
      }
    }
  })

  return found
}
