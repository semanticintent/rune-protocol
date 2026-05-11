import {
  Diagnostic,
  DiagnosticSeverity,
  Range,
} from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'
import type { ManifestLoader, RuneSigil } from '../manifest-loader'

// Binding reference patterns per host format — each yields { id, rune, range }
interface BindingRef {
  id: string
  rune: RuneSigil
  range: Range
}

function extractRefs(text: string): BindingRef[] {
  const refs: BindingRef[] = []
  const lines = text.split('\n')

  // TypeScript hook patterns
  const TS_HOOKS: Array<{ re: RegExp; rune: RuneSigil }> = [
    { re: /(?:useRead|host\.read)\(['"`]([\w-]+)['"`]\)/g,          rune: '@' },
    { re: /(?:useSync|host\.sync)\(['"`]([\w-]+)['"`]/g,             rune: '~' },
    { re: /(?:useAct|host\.act)\(['"`]([\w-]+)['"`]/g,               rune: '!' },
    { re: /(?:useIntent|host\.recordIntent)\(['"`]([\w-]+)['"`]/g,   rune: '?' },
  ]

  // HTML sigil attribute patterns
  const HTML_HOOKS: Array<{ re: RegExp; rune: RuneSigil }> = [
    { re: /[@]([\w-]+)/g, rune: '@' },
    { re: /[~]([\w-]+)/g, rune: '~' },
    { re: /[!]([\w-]+)/g, rune: '!' },
  ]

  lines.forEach((line, lineIdx) => {
    // Try TypeScript patterns first
    for (const { re, rune } of TS_HOOKS) {
      const r = new RegExp(re.source, 'g')
      let m: RegExpExecArray | null
      while ((m = r.exec(line)) !== null) {
        const idStart = m.index + m[0].indexOf(m[1])
        refs.push({
          id: m[1],
          rune,
          range: {
            start: { line: lineIdx, character: idStart },
            end:   { line: lineIdx, character: idStart + m[1].length },
          },
        })
      }
    }

    // HTML sigil patterns (only if line doesn't look like TypeScript)
    const isTypescript = line.includes('useRead') || line.includes('useSync') ||
                         line.includes('useAct') || line.includes('useIntent') ||
                         line.includes('host.')
    if (!isTypescript) {
      for (const { re, rune } of HTML_HOOKS) {
        const r = new RegExp(re.source, 'g')
        let m: RegExpExecArray | null
        while ((m = r.exec(line)) !== null) {
          const idStart = m.index + 1 // skip the sigil character
          refs.push({
            id: m[1],
            rune,
            range: {
              start: { line: lineIdx, character: idStart },
              end:   { line: lineIdx, character: idStart + m[1].length },
            },
          })
        }
      }
    }
  })

  return refs
}

export function getDiagnostics(document: TextDocument, loader: ManifestLoader): Diagnostic[] {
  const bindings = loader.getBindings()
  if (Object.keys(bindings).length === 0) return []

  const text = document.getText()
  const refs = extractRefs(text)
  const diagnostics: Diagnostic[] = []

  for (const ref of refs) {
    const declared = bindings[ref.id]

    if (!declared) {
      // RNE002: binding used but not declared in manifest
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: ref.range,
        message: `[RNE002] '${ref.id}' is not declared in the Rune manifest`,
        source: 'rune',
        code: 'RNE002',
      })
      continue
    }

    if (declared.rune !== ref.rune) {
      // RNE003: wrong rune type for this binding
      const RUNE_NAMES: Record<string, string> = { '@': 'read', '~': 'sync', '!': 'act', '?': 'intent' }
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: ref.range,
        message: `[RNE003] '${ref.id}' is declared as ${ref.rune === '@' ? '' : ''}${RUNE_NAMES[declared.rune] ?? declared.rune} (${declared.rune}) but used as ${RUNE_NAMES[ref.rune] ?? ref.rune} (${ref.rune})`,
        source: 'rune',
        code: 'RNE003',
      })
    }
  }

  return diagnostics
}
