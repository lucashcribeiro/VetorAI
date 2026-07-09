import { describe, it, expect } from 'vitest'
import { atLeast, asRole, type Role } from '@/core/auth/roles'

describe('atLeast', () => {
  const casos: Array<[Role, Role, boolean]> = [
    ['MEMBER', 'MEMBER', true],
    ['MEMBER', 'OWNER', false],
    ['OWNER', 'MEMBER', true],
    ['OWNER', 'OWNER', true],
    ['OWNER', 'SUPER_ADMIN', false],
    ['SUPER_ADMIN', 'OWNER', true],
    ['SUPER_ADMIN', 'SUPER_ADMIN', true],
  ]
  for (const [role, minimo, ok] of casos) {
    it(`${role} >= ${minimo} → ${ok}`, () => {
      expect(atLeast(role, minimo)).toBe(ok)
    })
  }
})

describe('asRole', () => {
  it('aceita papéis válidos', () => {
    expect(asRole('OWNER')).toBe('OWNER')
    expect(asRole('SUPER_ADMIN')).toBe('SUPER_ADMIN')
  })
  it('fallback MEMBER', () => {
    expect(asRole('org:admin')).toBe('MEMBER')
    expect(asRole(undefined)).toBe('MEMBER')
  })
})
