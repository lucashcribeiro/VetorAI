import { describe, it, expect } from 'vitest'
import { AGENTES, getAgente } from '@/modules/time/agents'
import { montarYamlCabecalho, normalizarMarkdown } from '@/modules/time/lib'

describe('AGENTES Time VETOR', () => {
  it('tem os 5 funcionários', () => {
    expect(AGENTES.map((a) => a.id)).toEqual([
      'orquestrador',
      'estrategista',
      'copywriter',
      'gestor_midia',
      'analista_bi',
    ])
  })

  it('copy depende de estrategista', () => {
    expect(getAgente('copywriter')?.dependeDe).toContain('estrategista')
  })
})

describe('yaml + markdown', () => {
  it('monta cabeçalho YAML', () => {
    const y = montarYamlCabecalho({
      clienteSlug: 'dra-mirilaini',
      tipo: 'mapa-de-nicho',
      agente: 'estrategista',
      data: '2026-07-09',
      status: 'rascunho',
      versao: 1,
    })
    expect(y).toContain('cliente: dra-mirilaini')
    expect(y).toContain('funcionario: vetor-estrategista')
  })

  it('tira fence markdown', () => {
    expect(normalizarMarkdown('```md\n# Olá\n```')).toBe('# Olá')
  })
})
