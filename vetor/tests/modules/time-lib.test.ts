import { describe, it, expect } from 'vitest'
import { AGENTES, PIPELINE, getAgente } from '@/modules/time/agents'
import {
  montarYamlCabecalho,
  normalizarMarkdown,
  parseResultadoQa,
} from '@/modules/time/lib'

describe('PIPELINE automática', () => {
  it('ordem fixa sem escolher funcionário', () => {
    expect(PIPELINE).toEqual([
      'orquestrador',
      'estrategista',
      'copywriter',
      'gestor_midia',
      'analista_bi',
    ])
  })

  it('cinco funcionários no catálogo', () => {
    expect(AGENTES).toHaveLength(5)
    expect(getAgente('analista_bi')?.cargo).toMatch(/QA/i)
  })
})

describe('parseResultadoQa', () => {
  it('parseia aprovação', () => {
    const r = parseResultadoQa(
      JSON.stringify({
        aprovado: true,
        problemas: [],
        sumario_executivo: 'Tudo certo.',
      }),
    )
    expect(r.aprovado).toBe(true)
    expect(r.problemas).toHaveLength(0)
  })

  it('parseia retrabalho e filtra agentes válidos', () => {
    const r = parseResultadoQa(`\`\`\`json
{
  "aprovado": false,
  "problemas": [
    { "agente": "copywriter", "motivo": "promessa clínica" },
    { "agente": "hacker", "motivo": "inválido" }
  ],
  "sumario_executivo": "Refazer copy"
}
\`\`\``)
    expect(r.aprovado).toBe(false)
    expect(r.problemas).toHaveLength(1)
    expect(r.problemas[0].agente).toBe('copywriter')
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
