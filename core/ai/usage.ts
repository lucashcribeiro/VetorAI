// Margem real por cliente começa aqui (README: core/ai/usage.ts desde o dia 1).
// Preços em USD por MTok — conferidos em jul/2026 via referência da API Anthropic.

export const MODELO_PADRAO = 'claude-opus-4-8'

const PRECOS_USD_MTOK: Record<string, { input: number; output: number }> = {
  'claude-opus-4-8': { input: 5, output: 25 },
  'claude-opus-4-7': { input: 5, output: 25 },
  'claude-sonnet-5': { input: 3, output: 15 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-haiku-4-5': { input: 1, output: 5 },
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
  // Modelo fora da tabela: assume o preço de opus para não subestimar custo.
  const preco = PRECOS_USD_MTOK[modelo] ?? PRECOS_USD_MTOK[MODELO_PADRAO]
  const usd = (tokensIn / 1_000_000) * preco.input + (tokensOut / 1_000_000) * preco.output
  return usd * usdBrl
}
