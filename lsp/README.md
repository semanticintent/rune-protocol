# @semanticintent/rune-lsp

Language Server Protocol implementation for [Rune Protocol](https://rune.semanticintent.dev).

Provides three features for any editor that supports LSP:

| Feature | What it does |
|---------|-------------|
| **Completion** | Suggests binding names from your `.rune.json` manifest inside hook calls and sigil attributes |
| **Hover** | Shows rune type, value type, constraints, and `?` intent annotation for any binding name |
| **Diagnostics** | Flags `[RNE002]` unknown bindings and `[RNE003]` wrong rune type in real time |

---

## How it works

The server looks for `rune.json` or any `*.rune.json` in the workspace root on startup and watches for changes. When the manifest updates, diagnostics refresh automatically across all open files.

---

## VS Code setup

Install the server globally or locally:

```sh
npm install -g @semanticintent/rune-lsp
# or in your project:
npm install --save-dev @semanticintent/rune-lsp
```

Add to `.vscode/settings.json`:

```json
{
  "rune.lsp.serverPath": "rune-lsp"
}
```

Or wire it up manually in `.vscode/extensions.json` using the [vscode-languageclient](https://github.com/microsoft/vscode-languageserver-node/tree/main/client) API:

```ts
import * as path from 'path'
import { LanguageClient, ServerOptions, TransportKind } from 'vscode-languageclient/node'

const serverModule = path.join(__dirname, 'node_modules', '.bin', 'rune-lsp')

const serverOptions: ServerOptions = {
  run:   { command: serverModule, transport: TransportKind.stdio },
  debug: { command: serverModule, transport: TransportKind.stdio },
}

const client = new LanguageClient('rune', 'Rune Protocol', serverOptions, {
  documentSelector: [
    { scheme: 'file', language: 'typescript' },
    { scheme: 'file', language: 'typescriptreact' },
    { scheme: 'file', language: 'javascript' },
    { scheme: 'file', language: 'html' },
    { scheme: 'file', language: 'csharp' },
    { scheme: 'file', language: 'sql' },
  ],
})

client.start()
```

---

## Neovim / other editors

The server accepts `--stdio` transport. Point your LSP client to `rune-lsp` binary:

**Neovim (nvim-lspconfig):**

```lua
local lspconfig = require('lspconfig')
local configs = require('lspconfig.configs')

if not configs.rune then
  configs.rune = {
    default_config = {
      cmd = { 'rune-lsp', '--stdio' },
      filetypes = { 'typescript', 'typescriptreact', 'javascript', 'html', 'cs', 'sql' },
      root_dir = lspconfig.util.root_pattern('rune.json', '*.rune.json', '.git'),
    },
  }
end

lspconfig.rune.setup {}
```

---

## Manifest location

The server searches for manifests in this order:

1. `rune.json` in workspace root
2. Any `*.rune.json` file in workspace root

Use `rune extract` (from `@semanticintent/rune-cli`) to generate a manifest from existing source, then `rune validate` to enrich it with types and intent annotations.

---

## Completion triggers

| Context | Trigger | Suggested bindings |
|---------|---------|-------------------|
| `useRead('|')` | `'`, `"`, `` ` `` | `@` read bindings |
| `useSync('|')` | `'`, `"`, `` ` `` | `~` sync bindings |
| `useAct('|')` | `'`, `"`, `` ` `` | `!` act bindings |
| `useIntent('|')` | `'`, `"`, `` ` `` | `?` intent bindings |
| `<tag @|` | `@` | `@` read bindings |
| `<tag ~|` | `~` | `~` sync bindings |
| `<tag !|` | `!` | `!` act bindings |

---

Part of the [Rune Protocol](https://rune.semanticintent.dev) ecosystem. MIT license.
