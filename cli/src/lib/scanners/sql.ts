import type { FoundBinding } from './types'

// Detects Rune bindings from SQL using COMMENT ON annotations:
//   COMMENT ON COLUMN table.col_name IS 'rune:~ intent text'
//   COMMENT ON COLUMN table.col_name IS 'rune:@ intent text'
//   COMMENT ON FUNCTION func_name IS 'rune:! intent text'
//   COMMENT ON TABLE table_name IS 'rune:? intent text'
//
// Column names use snake_case → kebab-case conversion.
// Intent text after the sigil is captured as the binding intent.

// Handles:
//   COMMENT ON COLUMN schema.table.col_name IS 'rune:~ ...'
//   COMMENT ON COLUMN table.col_name IS 'rune:@ ...'
//   COMMENT ON FUNCTION func_name(args...) IS 'rune:! ...'
//   COMMENT ON TABLE table_name IS 'rune:? ...'
// The [^']* between name and IS handles optional function signatures.
const COMMENT_RE = /COMMENT\s+ON\s+(?:COLUMN|FUNCTION|TABLE)\s+(?:[\w.]*\.)?(\w+)[^']*IS\s+'rune:([@~!?])([^']*)'/gi

function toKebab(name: string): string {
  return name.replace(/_/g, '-').toLowerCase()
}

export function scanSql(content: string, filePath: string): FoundBinding[] {
  const found: FoundBinding[] = []
  const lines = content.split('\n')

  lines.forEach((line, idx) => {
    const lineNum = idx + 1
    const re = new RegExp(COMMENT_RE.source, 'gi')
    let m: RegExpExecArray | null
    while ((m = re.exec(line)) !== null) {
      const id = toKebab(m[1])
      const rune = m[2] as FoundBinding['rune']
      const intentText = m[3].trim()
      if (!found.some(f => f.id === id && f.rune === rune)) {
        found.push({
          id,
          rune,
          ...(intentText ? { intent: intentText } : {}),
          location: { file: filePath, line: lineNum },
        })
      }
    }
  })

  return found
}
