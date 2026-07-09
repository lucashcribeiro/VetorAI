import { describe, it, expect } from 'vitest'
import {
  formatarTempoResposta,
  labelStatusConversa,
  limparSugestao,
  mascararTelefone,
  montarPromptSugestao,
  normalizarWaId,
} from '@/modules/zelo/lib'

describe('normalizarWaId / mascararTelefone', () => {
  it('remove não-dígitos', () => {
    expect(normalizarWaId('+55 11 99999-0001')).toBe('5511999990001')
  })

  it('mascara telefone', () => {
    expect(mascararTelefone('5511999990001')).toBe('5511…0001')
  })
})

describe('formatarTempoResposta', () => {
  it('formata segundos, minutos e horas', () => {
    expect(formatarTempoResposta(null)).toBe('—')
    expect(formatarTempoResposta(4500)).toBe('5s')
    expect(formatarTempoResposta(90_000)).toBe('1min 30s')
    expect(formatarTempoResposta(3_600_000)).toBe('1h')
  })
})

describe('labelStatusConversa', () => {
  it('rótulos em língua de dono', () => {
    expect(labelStatusConversa('aguardando')).toContain('aguardando')
    expect(labelStatusConversa('escalada')).toContain('equipe')
  })
})

describe('limparSugestao', () => {
  it('remove fences e aspas', () => {
    expect(limparSugestao('```\nOlá! Como posso ajudar?\n```')).toBe('Olá! Como posso ajudar?')
    expect(limparSugestao('"Bom dia!"')).toBe('Bom dia!')
  })
})

describe('montarPromptSugestao', () => {
  it('inclui histórico e negócio', () => {
    const p = montarPromptSugestao({
      negocio: { nome: 'Dra. Mirilaini', segmento: 'odontologia' },
      contato: { nome: 'Ana', waId: '5511999' },
      historico: [
        { direcao: 'entrada', corpo: 'Quero agendar' },
        { direcao: 'saida', corpo: 'Claro, qual dia?' },
      ],
    })
    expect(p).toContain('Dra. Mirilaini')
    expect(p).toContain('CONTATO: Quero agendar')
    expect(p).toContain('EQUIPE: Claro')
  })
})
