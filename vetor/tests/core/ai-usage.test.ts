import { describe, it, expect } from 'vitest'
import { custoBrl, MODELO_PADRAO } from '@/core/ai/usage'

describe('custoBrl', () => {
  it('calcula haiku: 1M in + 1M out a câmbio 5 → R$ 30', () => {
    // haiku 4.5: US$ 1/MTok in, US$ 5/MTok out → US$ 6 → R$ 30
    expect(custoBrl('claude-haiku-4-5', 1_000_000, 1_000_000, 5)).toBeCloseTo(30, 6)
  })

  it('calcula opus 4.8 proporcional: 10k in + 2k out a câmbio 5.5', () => {
    // (10k/1M)*5 + (2k/1M)*25 = 0.05 + 0.05 = US$ 0.10 → R$ 0.55
    expect(custoBrl('claude-opus-4-8', 10_000, 2_000, 5.5)).toBeCloseTo(0.55, 6)
  })

  it('zero tokens custa zero', () => {
    expect(custoBrl('claude-opus-4-8', 0, 0, 5.5)).toBe(0)
  })

  it('modelo desconhecido usa preço do padrão Anthropic (não subestima)', () => {
    expect(custoBrl('modelo-inexistente', 1_000_000, 0, 5)).toBeCloseTo(
      custoBrl(MODELO_PADRAO, 1_000_000, 0, 5),
      6,
    )
  })

  it('gpt-4o tem preço próprio', () => {
    // 1M in * 2.5 + 0 out a câmbio 5 = R$ 12.5
    expect(custoBrl('gpt-4o', 1_000_000, 0, 5)).toBeCloseTo(12.5, 6)
  })
})

