// Margem real por cliente (README: core/ai/usage.ts desde o dia 1).
// Preços em USD por MTok — estimativas para registro interno.

export const MODELO_PADRAO_ANTHROPIC = 'claude-sonnet-4-6'
export const MODELO_PADRAO_OPENAI = 'gpt-4o'

/** Preferência: OPENAI se houver key válida; senão Anthropic. */
export function provedorAtivo(): 'openai' | 'anthropic' | null {
  if (temKeyOpenAI()) return 'openai'
  if (temKeyAnthropic()) return 'anthropic'
  return null
}

export function temKeyOpenAI(): boolean {
  const k = process.env.OPENAI_API_KEY?.trim() ?? ''
  return k.length > 20 && !k.includes('placeholder') && k.startsWith('sk-')
}

export function temKeyAnthropic(): boolean {
  const k = process.env.ANTHROPIC_API_KEY?.trim() ?? ''
  return k.length > 20 && !k.includes('placeholder') && k.startsWith('sk-ant-')
}

export function modeloPadrao(): string {
  return provedorAtivo() === 'openai' ? MODELO_PADRAO_OPENAI : MODELO_PADRAO_ANTHROPIC
}

// Compat com imports antigos
export const MODELO_PADRAO = MODELO_PADRAO_ANTHROPIC

const PRECOS_USD_MTOK: Record<string, { input: number; output: number }> = {
  // Anthropic
  'claude-opus-4-8': { input: 5, output: 25 },
  'claude-opus-4-7': { input: 5, output: 25 },
  'claude-sonnet-5': { input: 3, output: 15 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-haiku-4-5': { input: 1, output: 5 },
  // OpenAI (aprox. lista pública gpt-4o)
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4.1': { input: 2, output: 8 },
  'gpt-4.1-mini': { input: 0.4, output: 1.6 },
}

export function cambioUsdBrl(): number {
  const valor = Number(process.env.USD_BRL)
  return Number.isFinite(valor) && valor > 0 ? valor : 5.5
}

export function custoBrl(
  modelo: string,
  tokensIn: number,
  tokensOut: number,
  usdBrl: number = cambioUsdBrl(),
): number {
  const preco =
    PRECOS_USD_MTOK[modelo] ??
    (modelo.startsWith('gpt')
      ? PRECOS_USD_MTOK['gpt-4o']
      : PRECOS_USD_MTOK[MODELO_PADRAO_ANTHROPIC])
  const usd = (tokensIn / 1_000_000) * preco.input + (tokensOut / 1_000_000) * preco.output
  return usd * usdBrl
}
