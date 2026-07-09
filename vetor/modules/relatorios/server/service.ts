import 'server-only'
import { readFileSync } from 'fs'
import { join } from 'path'

// Re-exporta as puras + carrega o prompt versionado (só server).
export {
  MESES_PT,
  validarMes,
  mesPorExtenso,
  parseNumeroBr,
  resumirCsv,
  montarPayloadPrompt,
  extrairResumo,
  normalizarHtmlResposta,
  type NumerosEntrada,
  type DadosEntradaRelatorio,
} from '../lib'

let promptCache: string | null = null

/** System prompt versionado em modules/relatorios/prompts/. */
export function carregarSystemPrompt(): string {
  if (promptCache) return promptCache
  const caminho = join(process.cwd(), 'modules/relatorios/prompts/relatorio-mensal.v1.md')
  promptCache = readFileSync(caminho, 'utf8')
  return promptCache
}
