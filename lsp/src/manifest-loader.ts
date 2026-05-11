import { existsSync, readFileSync, readdirSync, watchFile, unwatchFile } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

export type RuneSigil = '@' | '~' | '!' | '?'

export interface RuneBinding {
  rune: RuneSigil
  type?: string
  intent?: string
  args?: Array<{ name: string; type?: string; required?: boolean }>
  min?: number
  max?: number
  enum?: string[]
  maxLength?: number
}

export interface RuneManifest {
  $rune: string
  host?: { format?: string; version?: string; source?: string }
  bindings: Record<string, RuneBinding>
}

export class ManifestLoader {
  private manifest: RuneManifest | null = null
  private manifestPath: string | null = null
  private onChangeCallbacks: Array<() => void> = []

  findManifestPath(workspaceRoot: string): string | null {
    // Prefer rune.json, then any *.rune.json
    const defaultPath = join(workspaceRoot, 'rune.json')
    if (existsSync(defaultPath)) return defaultPath

    try {
      const entries = readdirSync(workspaceRoot)
      const match = entries.find(f => f.endsWith('.rune.json'))
      if (match) return join(workspaceRoot, match)
    } catch {
      // workspace root not readable
    }
    return null
  }

  load(workspaceRoot: string): void {
    const path = this.findManifestPath(workspaceRoot)
    if (!path) return

    this.manifestPath = path
    this.reload()
    this.watch()
  }

  loadFromUri(manifestUri: string): void {
    const path = manifestUri.startsWith('file://') ? fileURLToPath(manifestUri) : manifestUri
    if (!existsSync(path)) return
    this.manifestPath = path
    this.reload()
    this.watch()
  }

  private reload(): void {
    if (!this.manifestPath) return
    try {
      const raw = JSON.parse(readFileSync(this.manifestPath, 'utf-8'))
      if (raw && typeof raw === 'object' && raw.bindings) {
        this.manifest = raw as RuneManifest
        this.onChangeCallbacks.forEach(cb => cb())
      }
    } catch {
      // invalid JSON — keep stale manifest
    }
  }

  private watch(): void {
    if (!this.manifestPath) return
    watchFile(this.manifestPath, { interval: 500 }, () => {
      this.reload()
    })
  }

  unwatch(): void {
    if (this.manifestPath) unwatchFile(this.manifestPath)
  }

  onChange(cb: () => void): void {
    this.onChangeCallbacks.push(cb)
  }

  getManifest(): RuneManifest | null {
    return this.manifest
  }

  getBindings(): Record<string, RuneBinding> {
    return this.manifest?.bindings ?? {}
  }

  getBinding(id: string): RuneBinding | undefined {
    return this.manifest?.bindings[id]
  }

  bindingsForRune(rune: RuneSigil): Array<[string, RuneBinding]> {
    return Object.entries(this.getBindings()).filter(([, b]) => b.rune === rune)
  }

  allBindings(): Array<[string, RuneBinding]> {
    return Object.entries(this.getBindings())
  }
}
