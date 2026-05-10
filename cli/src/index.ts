#!/usr/bin/env node
import { Command } from 'commander'
import { validateCommand } from './commands/validate'

const program = new Command()
  .name('rune')
  .description('Rune Protocol tooling — validate binding manifests, extract bindings from source')
  .version('1.2.0')

program
  .command('validate <manifest>')
  .description('Validate a .rune.json binding manifest against the Rune Protocol schema')
  .option('--format <format>', 'output format: text or json', 'text')
  .action(validateCommand)

program.parse()
