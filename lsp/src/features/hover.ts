import {
  Hover,
  HoverParams,
  MarkupKind,
} from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'
import type { ManifestLoader, RuneBinding } from '../manifest-loader'

const RUNE_NAMES: Record<string, string> = {
  '@': 'read  (state → display)',
  '~': 'sync  (state ↔ input)',
  '!': 'act   (user → behavior)',
  '?': 'intent (annotation only)',
}

function buildHoverContent(id: string, binding: RuneBinding): string {
  const lines: string[] = []

  lines.push(`**${id}**  \`${binding.rune}\` ${RUNE_NAMES[binding.rune] ?? ''}`)
  lines.push('')

  if (binding.type) {
    const constraints: string[] = [`type: \`${binding.type}\``]
    if (binding.min !== undefined) constraints.push(`min: ${binding.min}`)
    if (binding.max !== undefined) constraints.push(`max: ${binding.max}`)
    if (binding.maxLength !== undefined) constraints.push(`maxLength: ${binding.maxLength}`)
    if (binding.enum) constraints.push(`enum: ${binding.enum.map(v => `\`${v}\``).join(' | ')}`)
    lines.push(constraints.join('  ·  '))
    lines.push('')
  }

  if (binding.args && binding.args.length > 0) {
    const argList = binding.args.map(a => {
      const req = a.required ? '' : '?'
      return `\`${a.name}${req}\`${a.type ? `: ${a.type}` : ''}`
    }).join(', ')
    lines.push(`args: ${argList}`)
    lines.push('')
  }

  if (binding.intent) {
    lines.push(`> ${binding.intent}`)
  }

  return lines.join('\n')
}

function wordAtPosition(text: string, offset: number): { word: string; start: number; end: number } | null {
  const WORD_RE = /[\w-]+/g
  let m: RegExpExecArray | null
  while ((m = WORD_RE.exec(text)) !== null) {
    if (m.index <= offset && offset <= m.index + m[0].length) {
      return { word: m[0], start: m.index, end: m.index + m[0].length }
    }
  }
  return null
}

export function getHover(
  params: HoverParams,
  document: TextDocument,
  loader: ManifestLoader
): Hover | null {
  const bindings = loader.getBindings()
  if (Object.keys(bindings).length === 0) return null

  const lineText = document.getText({
    start: { line: params.position.line, character: 0 },
    end: { line: params.position.line + 1, character: 0 },
  })

  const found = wordAtPosition(lineText, params.position.character)
  if (!found) return null

  const binding = bindings[found.word]
  if (!binding) return null

  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: buildHoverContent(found.word, binding),
    },
    range: {
      start: { line: params.position.line, character: found.start },
      end: { line: params.position.line, character: found.end },
    },
  }
}
