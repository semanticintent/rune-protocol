import {
  CompletionItem,
  CompletionItemKind,
  CompletionParams,
  MarkupKind,
} from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'
import type { ManifestLoader, RuneSigil } from '../manifest-loader'

// Detect which rune context the cursor sits in.
// Returns the expected rune sigil, or null if not in a Rune context.
function detectRuneContext(line: string, character: number): RuneSigil | null {
  const before = line.slice(0, character)

  // TypeScript/React hook patterns
  if (/useRead\(['"`][^'"`]*$/.test(before))    return '@'
  if (/useSync\(['"`][^'"`]*$/.test(before))    return '~'
  if (/useAct\(['"`][^'"`]*$/.test(before))     return '!'
  if (/useIntent\(['"`][^'"`]*$/.test(before))  return '?'

  // host.* patterns (rune-host.ts)
  if (/host\.read\(['"`][^'"`]*$/.test(before))         return '@'
  if (/host\.sync\(['"`][^'"`]*$/.test(before))         return '~'
  if (/host\.act\(['"`][^'"`]*$/.test(before))          return '!'
  if (/host\.recordIntent\(['"`][^'"`]*$/.test(before)) return '?'

  // HTML/Mere sigil attributes — character immediately after sigil
  if (/\s@[\w-]*$/.test(before)) return '@'
  if (/\s~[\w-]*$/.test(before)) return '~'
  if (/\s![\w-]*$/.test(before)) return '!'

  return null
}

function runeLabel(rune: RuneSigil): string {
  return { '@': 'read', '~': 'sync', '!': 'act', '?': 'intent' }[rune]
}

function bindingDetail(rune: RuneSigil, type?: string): string {
  const label = runeLabel(rune)
  return type ? `${rune} ${label}  ·  ${type}` : `${rune} ${label}`
}

export function getCompletions(
  params: CompletionParams,
  document: TextDocument,
  loader: ManifestLoader
): CompletionItem[] {
  const bindings = loader.getBindings()
  if (Object.keys(bindings).length === 0) return []

  const line = document.getText({
    start: { line: params.position.line, character: 0 },
    end: params.position,
  })

  const expectedRune = detectRuneContext(line, params.position.character)

  // Narrow to matching rune type, or offer all if context is unknown
  const candidates = expectedRune
    ? Object.entries(bindings).filter(([, b]) => b.rune === expectedRune)
    : Object.entries(bindings)

  return candidates.map(([id, binding]): CompletionItem => ({
    label: id,
    kind: CompletionItemKind.Variable,
    detail: bindingDetail(binding.rune, binding.type),
    documentation: binding.intent
      ? { kind: MarkupKind.Markdown, value: `*${binding.intent}*` }
      : undefined,
    sortText: id,
  }))
}
