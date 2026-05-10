export interface RneError {
  code: string
  severity: 'error' | 'warning'
  binding?: string
  message: string
  hint?: string
}

export const RNE_CODES: Record<string, { severity: 'error' | 'warning'; description: string; hint: string }> = {
  'RNE001': {
    severity: 'error',
    description: 'Invalid rune type',
    hint: 'The rune field must be one of: @ ~ ! ?',
  },
  'RNE002': {
    severity: 'error',
    description: 'Unknown binding reference',
    hint: 'The binding id is not declared in the manifest. Check for a typo or add a declaration.',
  },
  'RNE003': {
    severity: 'error',
    description: 'Invalid rune for binding kind',
    hint: '~ sync is not valid for a computed (@) binding. Only @ read is permitted.',
  },
  'RNE004': {
    severity: 'error',
    description: 'Missing required field',
    hint: 'A required field is absent. Check the manifest structure.',
  },
  'RNE005': {
    severity: 'error',
    description: 'Constraint violation',
    hint: 'A binding value or declaration violates a type constraint (min/max/enum/maxLength).',
  },
  'RNE006': {
    severity: 'warning',
    description: 'Missing intent annotation',
    hint: 'Bindings without ? intent travel without rationale. Consider adding one.',
  },
  'RNE007': {
    severity: 'error',
    description: 'Manifest schema violation',
    hint: 'The manifest does not conform to rune.schema.json. See the error path for details.',
  },
}

export function rneError(code: string, binding?: string, extra?: Partial<RneError>): RneError {
  const def = RNE_CODES[code]
  return {
    code,
    severity: def?.severity ?? 'error',
    binding,
    message: extra?.message ?? def?.description ?? code,
    hint: extra?.hint ?? def?.hint,
  }
}
