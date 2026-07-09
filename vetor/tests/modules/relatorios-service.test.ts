import { describe, it, expect } from 'vitest'
import {
  validarMes,
  mesPorExtenso,
  parseNumeroBr,
  resumirCsv,
  montarPayloadPrompt,
  extrairResumo,
  normalizarHtmlResposta,
} from '@/modules/relatorios/lib'

describe('validarMes', () => {
  it('aceita YYYY-MM passado', () => {
    expect(validarMes('2026-06')).toEqual({ ok: true, mes: '2026-06' })
  })

  it('rejeita formato inválido', () => {
    expect(validarMes('2026/06').ok).toBe(false)
    expect(validarMes('06-2026').ok).toBe(false)
    expect(validarMes('2026-13').ok).toBe(false)
  })

  it('rejeita mês atual ou futuro', () => {
    const agora = new Date()
    const y = agora.getFullYear()
    const m = String(agora.getMonth() + 1).padStart(2, '0')
    expect(validarMes(`${y}-${m}`).ok).toBe(false)
  })
})

describe('mesPorExtenso', () => {
  it('formata em português', () => {
    expect(mesPorExtenso('2026-06')).toBe('junho de 2026')
    expect(mesPorExtenso('2025-01')).toBe('janeiro de 2025')
  })
})

describe('parseNumeroBr', () => {
  it('parseia reais e inteiros', () => {
    expect(parseNumeroBr('R$ 1.234,56')).toBeCloseTo(1234.56)
    expect(parseNumeroBr('3200')).toBe(3200)
    expect(parseNumeroBr(12)).toBe(12)
    expect(parseNumeroBr('')).toBeNull()
    expect(parseNumeroBr(null)).toBeNull()
  })
})

describe('resumirCsv', () => {
  it('limita linhas e caracteres', () => {
    const linhas = Array.from({ length: 50 }, (_, i) => `a,b,${i}`)
    const out = resumirCsv(linhas.join('\n'), 10, 6000)
    expect(out.split('\n').length).toBeLessThanOrEqual(11)
    expect(out).toContain('omitidas')
  })

  it('remove BOM', () => {
    expect(resumirCsv('\uFEFFcol1,col2\n1,2')).toContain('col1,col2')
  })
})

describe('montarPayloadPrompt', () => {
  it('inclui negócio, mês e números em JSON', () => {
    const prompt = montarPayloadPrompt({
      negocio: { nome: 'Dra. Mirilaini', segmento: 'odontologia' },
      mes: '2026-06',
      dados: {
        numeros: { faturamento: 50000, leads: 40, clientesNovos: 8 },
        csvTexto: 'campanha,gasto\nA,100',
      },
    })
    expect(prompt).toContain('Dra. Mirilaini')
    expect(prompt).toContain('junho de 2026')
    expect(prompt).toContain('50000')
    expect(prompt).toContain('csv_resumido')
  })
})

describe('extrairResumo + normalizarHtmlResposta', () => {
  it('tira fences e extrai texto', () => {
    const html = normalizarHtmlResposta('```html\n<html><body><p>Mês estável com boa margem.</p></body></html>\n```')
    expect(html).toContain('<html')
    expect(html).not.toContain('```')
    const resumo = extrairResumo(html)
    expect(resumo.toLowerCase()).toContain('mês estável')
  })

  it('embrulha fragmento sem documento', () => {
    const html = normalizarHtmlResposta('<h1>Olá</h1><p>texto</p>')
    expect(html).toMatch(/<!DOCTYPE html>/i)
    expect(html).toContain('<h1>Olá</h1>')
  })
})
