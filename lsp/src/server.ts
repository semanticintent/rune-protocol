#!/usr/bin/env node
import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
  CompletionParams,
  HoverParams,
} from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { fileURLToPath } from 'url'
import { ManifestLoader } from './manifest-loader'
import { getCompletions } from './features/completion'
import { getHover } from './features/hover'
import { getDiagnostics } from './features/diagnostics'

const connection = createConnection(ProposedFeatures.all)
const documents = new TextDocuments(TextDocument)
const loader = new ManifestLoader()

// ─── Initialize ──────────────────────────────────────────────────────────────

connection.onInitialize((params: InitializeParams): InitializeResult => {
  const workspaceRoot = params.rootUri
    ? fileURLToPath(params.rootUri)
    : (params.workspaceFolders?.[0]?.uri ? fileURLToPath(params.workspaceFolders[0].uri) : null)

  if (workspaceRoot) {
    loader.load(workspaceRoot)
    loader.onChange(() => {
      // Re-validate all open documents when manifest changes
      for (const doc of documents.all()) {
        pushDiagnostics(doc)
      }
    })
  }

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: false,
        triggerCharacters: ["'", '"', '`', '@', '~', '!'],
      },
      hoverProvider: true,
    },
  }
})

// ─── Diagnostics ─────────────────────────────────────────────────────────────

function pushDiagnostics(document: TextDocument): void {
  const diagnostics = getDiagnostics(document, loader)
  connection.sendDiagnostics({ uri: document.uri, diagnostics })
}

documents.onDidOpen(e => pushDiagnostics(e.document))
documents.onDidChangeContent(e => pushDiagnostics(e.document))
documents.onDidClose(e => connection.sendDiagnostics({ uri: e.document.uri, diagnostics: [] }))

// ─── Completion ───────────────────────────────────────────────────────────────

connection.onCompletion((params: CompletionParams) => {
  const document = documents.get(params.textDocument.uri)
  if (!document) return []
  return getCompletions(params, document, loader)
})

// ─── Hover ───────────────────────────────────────────────────────────────────

connection.onHover((params: HoverParams) => {
  const document = documents.get(params.textDocument.uri)
  if (!document) return null
  return getHover(params, document, loader)
})

// ─── Start ───────────────────────────────────────────────────────────────────

documents.listen(connection)
connection.listen()
