import { extname } from 'path'
import { scanHtml } from './html'
import { scanTypescript } from './typescript'
import { scanCsharp } from './csharp'
import { scanSql } from './sql'
import type { FoundBinding } from './types'

export type HostFormat = 'auto' | 'html' | 'ts' | 'csharp' | 'sql'

export { FoundBinding }

const EXT_MAP: Record<string, HostFormat> = {
  '.html': 'html',
  '.mp': 'html',
  '.tsx': 'ts',
  '.ts': 'ts',
  '.jsx': 'ts',
  '.js': 'ts',
  '.cs': 'csharp',
  '.sql': 'sql',
}

export const SUPPORTED_EXTENSIONS = Object.keys(EXT_MAP)

export function detectFormat(filePath: string): HostFormat {
  const ext = extname(filePath).toLowerCase()
  return EXT_MAP[ext] ?? 'auto'
}

export function scanFile(content: string, filePath: string, host: HostFormat): FoundBinding[] {
  const format = host === 'auto' ? detectFormat(filePath) : host
  switch (format) {
    case 'html':   return scanHtml(content, filePath)
    case 'ts':     return scanTypescript(content, filePath)
    case 'csharp': return scanCsharp(content, filePath)
    case 'sql':    return scanSql(content, filePath)
    default:       return []
  }
}
