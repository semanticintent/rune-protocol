import { readFileSync, writeFileSync, statSync, readdirSync } from 'fs'
import { resolve, join, relative, basename } from 'path'
import chalk from 'chalk'
import { scanFile, detectFormat, SUPPORTED_EXTENSIONS, FoundBinding } from '../lib/scanners/index'
import type { HostFormat } from '../lib/scanners/index'

interface ExtractOptions {
  host: HostFormat
  out: string
}

function collectFiles(sourcePath: string, host: HostFormat): string[] {
  const stat = statSync(sourcePath)
  if (stat.isFile()) return [sourcePath]

  const files: string[] = []
  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else {
        const fmt = host === 'auto' ? detectFormat(full) : host
        if (fmt !== 'auto') files.push(full)
        else if (SUPPORTED_EXTENSIONS.some(ext => full.endsWith(ext))) files.push(full)
      }
    }
  }
  walk(sourcePath)
  return files
}

function mergeBindings(all: FoundBinding[]): Record<string, FoundBinding> {
  const merged: Record<string, FoundBinding> = {}
  for (const b of all) {
    const key = `${b.rune}:${b.id}`
    if (!merged[key]) {
      merged[key] = b
    }
  }
  return merged
}

function buildManifest(
  merged: Record<string, FoundBinding>,
  sourcePath: string,
  host: HostFormat
): object {
  const bindings: Record<string, object> = {}

  for (const b of Object.values(merged)) {
    const entry: Record<string, unknown> = { rune: b.rune }
    if (b.intent) entry.intent = b.intent
    if (b.args && b.args.length > 0) entry.args = b.args
    bindings[b.id] = entry
  }

  return {
    $schema: 'https://rune.semanticintent.dev/rune.schema.json',
    $rune: '1.1',
    host: {
      format: host === 'auto' ? 'unknown' : host,
      source: basename(sourcePath),
    },
    bindings,
  }
}

export async function extractCommand(source: string, options: ExtractOptions): Promise<void> {
  const absSource = resolve(source)
  const absOut = resolve(options.out)

  const files = collectFiles(absSource, options.host)
  if (files.length === 0) {
    console.error(chalk.red(`rune: no supported files found in '${source}'`))
    console.error(chalk.dim('Supported: .html, .ts, .tsx, .js, .jsx, .cs, .sql'))
    process.exit(1)
  }

  const allBindings: FoundBinding[] = []
  const scanned: string[] = []

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8')
      const found = scanFile(content, file, options.host)
      allBindings.push(...found)
      if (found.length > 0) scanned.push(file)
    } catch {
      console.error(chalk.yellow(`  skipped: ${relative(absSource, file)} (read error)`))
    }
  }

  const merged = mergeBindings(allBindings)
  const bindingCount = Object.keys(merged).length

  if (bindingCount === 0) {
    console.error(chalk.yellow(`rune: no Rune bindings found in ${files.length} file${files.length === 1 ? '' : 's'}`))
    console.error(chalk.dim('If using a specific host format, try: rune extract <source> --host html|ts|csharp|sql'))
    process.exit(0)
  }

  const manifest = buildManifest(merged, absSource, options.host)
  writeFileSync(absOut, JSON.stringify(manifest, null, 2) + '\n', 'utf-8')

  const counts = { '@': 0, '~': 0, '!': 0, '?': 0 }
  for (const b of Object.values(merged)) counts[b.rune]++

  console.log(chalk.green(`✓ extracted ${bindingCount} binding${bindingCount === 1 ? '' : 's'} from ${scanned.length} file${scanned.length === 1 ? '' : 's'}`))
  console.log(chalk.dim(`  @ read: ${counts['@']}  ~ sync: ${counts['~']}  ! act: ${counts['!']}  ? intent: ${counts['?']}`))
  console.log(`  → ${chalk.cyan(options.out)}`)
  console.log(chalk.dim(`  Run 'rune validate ${options.out}' to find missing types and intent annotations.`))
}
