import { describe, it, expect } from 'vitest'
import {
  conformidadeDoSegmento,
  parsearPostsDaIa,
  segundaDaSemana,
  labelStatus,
  montarTextoExportacao,
  dataDoDiaNaSemana,
} from '@/modules/conteudo/lib'

describe('conformidadeDoSegmento', () => {
  it('detecta dental e seguros', () => {
    expect(conformidadeDoSegmento('odontologia · sp')).toBe('cfo_dental')
    expect(conformidadeDoSegmento('seguros · sp')).toBe('susep_seguros')
    expect(conformidadeDoSegmento('comércio')).toBe('geral')
  })
})

describe('parsearPostsDaIa', () => {
  it('aceita JSON puro e com fence', () => {
    const arr = [
      { dia: 'seg', texto: 'Bom dia! Avaliação aberta.', hashtags: '#saude' },
      { dia: 'qua', titulo: 'Dica', texto: 'Escove com calma.', canal: 'instagram' },
    ]
    expect(parsearPostsDaIa(JSON.stringify(arr))).toHaveLength(2)
    expect(parsearPostsDaIa('```json\n' + JSON.stringify(arr) + '\n```')[0].texto).toContain('Bom dia')
  })

  it('falha se não for array', () => {
    expect(() => parsearPostsDaIa('{"texto":"x"}')).toThrow()
  })
})

describe('segundaDaSemana / dataDoDiaNaSemana', () => {
  it('retorna YYYY-MM-DD', () => {
    expect(segundaDaSemana(new Date('2026-07-09T15:00:00'))).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('offset de dia da semana', () => {
    const d = dataDoDiaNaSemana('2026-07-06', 'qua', 0) // segunda 6 jul
    expect(d.getDay()).toBe(3) // quarta
  })
})

describe('labelStatus / export', () => {
  it('rótulos', () => {
    expect(labelStatus('pendente')).toContain('aprovação')
  })

  it('exporta texto legível', () => {
    const t = montarTextoExportacao([
      {
        titulo: 'Tema',
        texto: 'Legenda aqui',
        hashtags: '#a',
        agendadoPara: new Date('2026-07-07T13:00:00Z'),
      },
    ])
    expect(t).toContain('Legenda aqui')
    expect(t).toContain('#a')
  })
})
