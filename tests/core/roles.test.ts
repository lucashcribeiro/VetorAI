import { describe, it, expect } from 'vitest'
import { atLeast, papelFromClerkRole, type Role } from '@/core/auth/roles'

describe('atLeast — hierarquia MEMBER < OWNER < SUPER_ADMIN', () => {
  const casos: Array<[Role, Role, boolean]> = [
    ['MEMBER', 'MEMBER', true],
    ['MEMBER', 'OWNER', false],
    ['MEMBER', 'SUPER_ADMIN', false],
    ['OWNER', 'MEMBER', true],
    ['OWNER', 'OWNER', true],
    ['OWNER', 'SUPER_ADMIN', false],
    ['SUPER_ADMIN', 'MEMBER', true],
    ['SUPER_ADMIN', 'OWNER', true],
    ['SUPER_ADMIN', 'SUPER_ADMIN', true],
  ]
  for (const [role, min, esperado] of casos) {
    it(`${role} atende mínimo ${min}? ${esperado}`, () => {
      expect(atLeast(role, min)).toBe(esperado)
    })
  }
})

describe('papelFromClerkRole', () => {
  it('org:admin vira OWNER', () => {
    expect(papelFromClerkRole('org:admin')).toBe('OWNER')
  })
  it('org:member e desconhecidos viram MEMBER', () => {
    expect(papelFromClerkRole('org:member')).toBe('MEMBER')
    expect(papelFromClerkRole('qualquer-coisa')).toBe('MEMBER')
  })
})
