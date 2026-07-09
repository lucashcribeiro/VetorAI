import { describe, it, expect } from 'vitest'
import {
  detectarAlertas,
  parseNumeroCsv,
  parsearCsvAnuncios,
  normalizarHeader,
  fmtBrl,
} from '@/modules/midia/lib'

describe('parseNumeroCsv / headers', () => {
  it('parseia reais BR e US', () => {
    expect(parseNumeroCsv('R$ 1.234,56')).toBeCloseTo(1234.56)
    expect(parseNumeroCsv('1,234.56')).toBeCloseTo(1234.56)
    expect(parseNumeroCsv('100')).toBe(100)
  })

  it('normaliza header', () => {
    expect(normalizarHeader('Campaign Name')).toBe('campaign_name')
    expect(normalizarHeader('Amount Spent (BRL)')).toBe('amount_spent_brl')
  })
})

describe('parsearCsvAnuncios', () => {
  it('lê export estilo Meta', () => {
    const csv = [
      'Reporting starts,Campaign name,Amount spent (BRL),Impressions,Link clicks,Results',
      '2026-07-01,Avaliacao Instagram,300.00,10000,120,10',
      '2026-07-02,Avaliacao Instagram,350.00,11000,130,8',
      '2026-07-03,Avaliacao Instagram,400.00,12000,140,5',
      '2026-07-04,Avaliacao Instagram,450.00,13000,150,4',
      '2026-07-05,Avaliacao Instagram,500.00,14000,160,3',
      '2026-07-06,Avaliacao Instagram,550.00,15000,170,2',
    ].join('\n')

    const rows = parsearCsvAnuncios(csv)
    expect(rows.length).toBe(6)
    expect(rows[0].campanha).toContain('Avaliacao')
    expect(rows[0].gasto).toBe(300)
    expect(rows[0].leads).toBe(10)
    expect(rows[0].cpl).toBeCloseTo(30)
  })

  it('falha sem colunas mínimas', () => {
    expect(() => parsearCsvAnuncios('a,b\n1,2')).toThrow(/reconhecido/i)
  })
})

describe('detectarAlertas', () => {
  it('alerta CPL subindo >30%', () => {
    const campanha = 'Teste'
    const metricas = [
      { data: '2026-07-01', campanha, plataforma: 'meta', gasto: 100, impressoes: 1, cliques: 1, leads: 10, conversoes: 0, cpl: 10 },
      { data: '2026-07-02', campanha, plataforma: 'meta', gasto: 100, impressoes: 1, cliques: 1, leads: 10, conversoes: 0, cpl: 10 },
      { data: '2026-07-03', campanha, plataforma: 'meta', gasto: 100, impressoes: 1, cliques: 1, leads: 10, conversoes: 0, cpl: 10 },
      { data: '2026-07-04', campanha, plataforma: 'meta', gasto: 200, impressoes: 1, cliques: 1, leads: 5, conversoes: 0, cpl: 40 },
      { data: '2026-07-05', campanha, plataforma: 'meta', gasto: 200, impressoes: 1, cliques: 1, leads: 5, conversoes: 0, cpl: 40 },
      { data: '2026-07-06', campanha, plataforma: 'meta', gasto: 200, impressoes: 1, cliques: 1, leads: 5, conversoes: 0, cpl: 40 },
    ]
    const alertas = detectarAlertas(metricas)
    expect(alertas.some((a) => a.tipo === 'cpl_subiu')).toBe(true)
    expect(alertas.find((a) => a.tipo === 'cpl_subiu')?.mensagem).toMatch(/custo|contato/i)
  })

  it('alerta gasto sem contato', () => {
    const alertas = detectarAlertas([
      {
        data: '2026-07-06',
        campanha: 'Vazia',
        plataforma: 'meta',
        gasto: 500,
        impressoes: 1,
        cliques: 1,
        leads: 0,
        conversoes: 0,
        cpl: null,
      },
    ])
    expect(alertas.some((a) => a.tipo === 'sem_resultado')).toBe(true)
  })
})

describe('fmtBrl', () => {
  it('formata moeda', () => {
    expect(fmtBrl(10)).toMatch(/R\$/)
  })
})
