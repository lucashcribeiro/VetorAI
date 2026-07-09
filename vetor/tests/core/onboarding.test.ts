import { describe, it, expect } from 'vitest'
import { MODULOS_ONBOARDING, slugifyEmpresa } from '@/core/tenant/onboarding'

describe('slugifyEmpresa', () => {
  it('normaliza acentos e espaços', () => {
    expect(slugifyEmpresa('Clínica da Dra. Ana')).toBe('clinica-da-dra-ana')
    expect(slugifyEmpresa('  Milu Seguros  ')).toBe('milu-seguros')
  })

  it('remove caracteres especiais', () => {
    expect(slugifyEmpresa('A&B!!')).toBe('a-b')
  })
})

describe('MODULOS_ONBOARDING', () => {
  it('ativa o essencial para primeiro valor', () => {
    expect(MODULOS_ONBOARDING).toEqual(
      expect.arrayContaining(['relatorios', 'conteudo', 'midia', 'time']),
    )
  })
})
