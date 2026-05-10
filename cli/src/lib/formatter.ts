import chalk from 'chalk'
import type { RneError } from './rne-errors'

export type OutputFormat = 'text' | 'json'

export interface ValidationResult {
  manifest: string
  valid: boolean
  errors: RneError[]
  warnings: RneError[]
}

export function formatText(result: ValidationResult): string {
  const lines: string[] = []
  const errorCount = result.errors.length
  const warnCount = result.warnings.length

  if (result.valid) {
    lines.push(chalk.green(`✓ ${result.manifest} — valid`))
    if (warnCount > 0) {
      lines.push(chalk.yellow(`  ${warnCount} warning${warnCount === 1 ? '' : 's'}`))
    }
  } else {
    lines.push(chalk.red(`✗ ${result.manifest} — ${errorCount} error${errorCount === 1 ? '' : 's'}`))
  }

  const all = [...result.errors, ...result.warnings]
  for (const err of all) {
    const prefix = err.severity === 'error'
      ? chalk.red(`  [${err.code}]`)
      : chalk.yellow(`  [${err.code}]`)
    const binding = err.binding ? chalk.cyan(` ${err.binding}`) : ''
    lines.push(`${prefix}${binding} ${err.message}`)
    if (err.hint) {
      lines.push(chalk.dim(`         ${err.hint}`))
    }
  }

  return lines.join('\n')
}

export function formatJson(result: ValidationResult): string {
  return JSON.stringify(
    {
      manifest: result.manifest,
      valid: result.valid,
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
      diagnostics: [...result.errors, ...result.warnings],
    },
    null,
    2
  )
}

export function format(result: ValidationResult, fmt: OutputFormat): string {
  return fmt === 'json' ? formatJson(result) : formatText(result)
}
