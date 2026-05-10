import { readFileSync } from 'fs'
import { resolve } from 'path'
import { validateManifest } from '../lib/validator'
import { format } from '../lib/formatter'
import type { ValidationResult, OutputFormat } from '../lib/formatter'
import type { RneError } from '../lib/rne-errors'

interface ValidateOptions {
  format: OutputFormat
}

export async function validateCommand(manifestPath: string, options: ValidateOptions): Promise<void> {
  const absPath = resolve(manifestPath)

  let raw: unknown
  try {
    const content = readFileSync(absPath, 'utf-8')
    raw = JSON.parse(content)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`rune: cannot read '${manifestPath}': ${msg}`)
    process.exit(1)
  }

  const allDiagnostics = validateManifest(raw)

  const errors: RneError[] = allDiagnostics.filter(d => d.severity === 'error')
  const warnings: RneError[] = allDiagnostics.filter(d => d.severity === 'warning')

  const result: ValidationResult = {
    manifest: manifestPath,
    valid: errors.length === 0,
    errors,
    warnings,
  }

  console.log(format(result, options.format))

  if (!result.valid) {
    process.exit(1)
  }
}
