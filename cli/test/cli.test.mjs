// End-to-end tests for the rune CLI. They run the built CLI (dist/index.js) the way a user would,
// against the examples in this repository. `npm test` builds first.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const cli = join(here, '..', 'dist', 'index.js')
const repo = join(here, '..', '..')
const pkg = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf-8'))

const rune = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf-8' })
const scratch = () => mkdtempSync(join(tmpdir(), 'rune-cli-test-'))

test('--version prints the package version', () => {
  const r = rune('--version')
  assert.equal(r.status, 0)
  assert.equal(r.stdout.trim(), pkg.version)
})

test('validate accepts the example manifest', () => {
  const r = rune('validate', join(repo, 'examples', 'task-workbook.rune.json'))
  assert.equal(r.status, 0, r.stderr)
})

test('validate rejects a manifest that breaks the schema', () => {
  const dir = scratch()
  try {
    const bad = join(dir, 'bad.rune.json')
    writeFileSync(bad, JSON.stringify({ version: 'x', bindings: [{ oops: 1 }] }))
    const r = rune('validate', bad)
    assert.equal(r.status, 1)
    assert.match(r.stdout + r.stderr, /RNE\d{3}/)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('extract finds bindings in the C# example, and the manifest validates', () => {
  const dir = scratch()
  try {
    const out = join(dir, 'example.rune.json')
    const r = rune('extract', join(repo, 'implementations', 'csharp', 'Example.cs'), '--out', out)
    assert.equal(r.status, 0, r.stderr)
    const manifest = JSON.parse(readFileSync(out, 'utf-8'))
    assert.ok(Object.keys(manifest.bindings).length > 0, 'expected at least one binding')
    assert.equal(rune('validate', out).status, 0)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('extract on a path that does not exist exits 1 with one line, no stack trace', () => {
  const r = rune('extract', join(repo, 'no-such-file.tsx'))
  assert.equal(r.status, 1)
  assert.match(r.stderr, /no such file or directory/)
  assert.doesNotMatch(r.stderr, /\n\s+at /, 'should not print a stack trace')
})

test('extract on a folder with no supported files exits 1', () => {
  const dir = scratch()
  try {
    mkdirSync(join(dir, 'empty'))
    writeFileSync(join(dir, 'empty', 'notes.txt'), 'nothing here')
    const r = rune('extract', join(dir, 'empty'))
    assert.equal(r.status, 1)
    assert.match(r.stderr, /no supported files/)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})
