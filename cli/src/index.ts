#!/usr/bin/env node
import { Command } from 'commander'
import { validateCommand } from './commands/validate'
import { extractCommand } from './commands/extract'

const program = new Command()
  .name('rune')
  .description('Rune Protocol tooling — validate binding manifests, extract bindings from source')
  .version('1.2.0')

program
  .command('validate <manifest>')
  .description('Validate a .rune.json binding manifest against the Rune Protocol schema')
  .option('--format <format>', 'output format: text or json', 'text')
  .action(validateCommand)

program
  .command('extract <source>')
  .description('Scan source files for Rune bindings and generate a .rune.json manifest')
  .option('--host <format>', 'host format: auto, html, ts, csharp, sql', 'auto')
  .option('--out <file>', 'output manifest path', 'rune.json')
  .action(extractCommand)

program.parse()
