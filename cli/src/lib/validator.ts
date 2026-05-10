import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import type { RneError } from './rne-errors'
import { rneError } from './rne-errors'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const metaSchema = require('../../schema/rune.schema.json')

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)
const validateSchema = ajv.compile(metaSchema)

export interface RuneBinding {
  rune: '@' | '~' | '!' | '?'
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

export function validateManifest(raw: unknown): RneError[] {
  const errors: RneError[] = []

  // 1. JSON Schema structural validation
  const valid = validateSchema(raw)
  if (!valid) {
    for (const ajvError of validateSchema.errors ?? []) {
      const path = ajvError.instancePath || ajvError.schemaPath
      errors.push(
        rneError('RNE007', undefined, {
          message: `${path ? path + ': ' : ''}${ajvError.message}`,
        })
      )
    }
    return errors
  }

  const manifest = raw as RuneManifest

  // 2. Logical checks per binding
  for (const [id, binding] of Object.entries(manifest.bindings)) {
    // ? rune must have intent (enforced in schema, but defensive)
    if (binding.rune === '?' && !binding.intent) {
      errors.push(
        rneError('RNE004', id, {
          message: `? intent binding '${id}' requires an 'intent' field`,
        })
      )
    }

    // min/max only meaningful on number type
    if ((binding.min !== undefined || binding.max !== undefined) && binding.type !== 'number') {
      errors.push(
        rneError('RNE005', id, {
          message: `binding '${id}' declares min/max but type is '${binding.type ?? 'unset'}' — min/max apply to 'number' only`,
        })
      )
    }

    // enum only meaningful on string type
    if (binding.enum !== undefined && binding.type !== 'string') {
      errors.push(
        rneError('RNE005', id, {
          message: `binding '${id}' declares enum but type is '${binding.type ?? 'unset'}' — enum applies to 'string' only`,
        })
      )
    }

    // min > max is always wrong
    if (binding.min !== undefined && binding.max !== undefined && binding.min > binding.max) {
      errors.push(
        rneError('RNE005', id, {
          message: `binding '${id}' has min (${binding.min}) greater than max (${binding.max})`,
        })
      )
    }

    // args only on ! bindings
    if (binding.args !== undefined && binding.rune !== '!') {
      errors.push(
        rneError('RNE003', id, {
          message: `binding '${id}' declares args but rune is '${binding.rune}' — args are only valid on ! act bindings`,
        })
      )
    }

    // RNE006: @ and ~ without type (warning)
    if ((binding.rune === '@' || binding.rune === '~') && !binding.type) {
      errors.push(
        rneError('RNE006', id, {
          message: `binding '${id}' (${binding.rune}) has no type declaration`,
          hint: 'Add a type field (string | number | boolean | array | object) for cross-layer validation.',
        })
      )
    }

    // RNE006: binding without intent annotation (warning)
    if (!binding.intent && binding.rune !== '?') {
      errors.push(
        rneError('RNE006', id, {
          message: `binding '${id}' has no intent annotation`,
        })
      )
    }
  }

  return errors
}
