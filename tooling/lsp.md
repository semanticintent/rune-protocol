# LSP — Editor Integration

`@semanticintent/rune-lsp` is a Language Server Protocol implementation for Rune Protocol. It gives any LSP-capable editor live awareness of your binding manifest.

```sh
npm install -g @semanticintent/rune-lsp
```

---

## Features

| Feature | What it does |
|---------|-------------|
| **Completion** | Suggests binding names from your `.rune.json` manifest. Context-aware — only `@` bindings appear inside `useRead()`, only `~` inside `useSync()`, etc. |
| **Hover** | Shows rune type, value type, constraints, and `?` intent annotation for any binding name under the cursor. |
| **Diagnostics** | Flags `[RNE002]` unknown bindings and `[RNE003]` wrong rune type in real time on every keystroke. Clears when the file is closed. |

---

## Manifest discovery

The server searches for manifests in this order:

1. `rune.json` in workspace root
2. Any `*.rune.json` file in workspace root

The manifest is **hot-reloaded** — edit `rune.json` and diagnostics refresh across all open files immediately, without restarting the server.

Generate a manifest with `rune extract`, enrich it with `rune validate`, then open your editor. The server picks it up automatically.

---

## VS Code

Install the server:

```sh
npm install --save-dev @semanticintent/rune-lsp
```

Wire it in your extension or project via `.vscode/extensions.json` + a small client bootstrap:

```ts
import * as path from 'path'
import { LanguageClient, ServerOptions, TransportKind } from 'vscode-languageclient/node'

const serverModule = path.join(__dirname, 'node_modules', '.bin', 'rune-lsp')

const client = new LanguageClient(
  'rune',
  'Rune Protocol',
  {
    run:   { command: serverModule, transport: TransportKind.stdio },
    debug: { command: serverModule, transport: TransportKind.stdio },
  },
  {
    documentSelector: [
      { scheme: 'file', language: 'typescript' },
      { scheme: 'file', language: 'typescriptreact' },
      { scheme: 'file', language: 'javascript' },
      { scheme: 'file', language: 'html' },
      { scheme: 'file', language: 'csharp' },
      { scheme: 'file', language: 'sql' },
    ],
  }
)

client.start()
```

---

## Neovim

```lua
local lspconfig = require('lspconfig')
local configs   = require('lspconfig.configs')

if not configs.rune then
  configs.rune = {
    default_config = {
      cmd      = { 'rune-lsp', '--stdio' },
      filetypes = { 'typescript', 'typescriptreact', 'javascript', 'html', 'cs', 'sql' },
      root_dir = lspconfig.util.root_pattern('rune.json', '*.rune.json', '.git'),
    },
  }
end

lspconfig.rune.setup {}
```

---

## Completion

Completion is context-aware — the server reads the text before the cursor to determine which rune type is expected, and narrows suggestions accordingly.

| Context | Trigger characters | Suggested bindings |
|---------|-------------------|-------------------|
| `useRead('\|')` | `'` `"` `` ` `` | `@` read bindings only |
| `useSync('\|')` | `'` `"` `` ` `` | `~` sync bindings only |
| `useAct('\|')` | `'` `"` `` ` `` | `!` act bindings only |
| `useIntent('\|')` | `'` `"` `` ` `` | `?` intent bindings only |
| `host.read('\|')` | `'` `"` `` ` `` | `@` read bindings only |
| `host.sync('\|')` | `'` `"` `` ` `` | `~` sync bindings only |
| `host.act('\|')` | `'` `"` `` ` `` | `!` act bindings only |
| `<tag @\|` | `@` | `@` read bindings only |
| `<tag ~\|` | `~` | `~` sync bindings only |
| `<tag !\|` | `!` | `!` act bindings only |

Each completion item shows:

- **Label** — the binding id (e.g. `risk-threshold`)
- **Detail** — rune type + value type (e.g. `~ sync · number`)
- **Documentation** — the `?` intent annotation, if present

---

## Hover

Hover over any binding name to see its full declaration from the manifest:

```
risk-threshold  `~` sync  (state ↔ input)

type: `number`  ·  min: 0.05  ·  max: 0.30

> approved by risk committee Q1-2025 — review at quarter end
```

For `!` act bindings, the hover also shows the argument list:

```
submit-order  `!` act  (user → behavior)

args: `order-id`: string, `quantity`: number

> explicit, logged to OMS, irrevocable
```

---

## Diagnostics

Diagnostics appear inline in the editor, same as TypeScript errors:

| Code | What triggers it |
|------|-----------------|
| `RNE002` | Binding name used (`useRead('x')`) but `x` is not in the manifest |
| `RNE003` | Binding `x` declared as `@` read but used as `useSync('x')` (`~` sync) |

Diagnostics are cleared when a file is closed, and refresh automatically when the manifest changes.

---

## Relationship to rune validate

The LSP and `rune validate` are complementary:

| | `rune validate` | LSP |
|--|-----------------|-----|
| **What it checks** | The manifest itself | Source files against the manifest |
| **When it runs** | On demand / CI | Live in the editor |
| **What it catches** | RNE003–RNE007 in the manifest declaration | RNE002–RNE003 in source code |
| **Output** | Terminal / JSON | Inline editor squiggles |

Run `rune validate` in CI. Run the LSP in the editor. Together they cover the full contract enforcement surface.
