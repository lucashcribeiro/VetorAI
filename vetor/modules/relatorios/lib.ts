// Funções puras do módulo Relatórios — seguras no client e no server.

export const MESES_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const

/** Valida mês no formato YYYY-MM e dentro de um intervalo razoável. */
export function validarMes(mes: string): { ok: true; mes: string } | { ok: false; erro: string } {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) {
    return { ok: false, erro: 'Mês inválido. Use o formato AAAA-MM (ex.: 2026-06).' }
  }
  const [y, m] = mes.split('-').map(Number)
  const agora = new Date()
  // Só meses já fechados (antes do 1º dia do mês corrente).
  const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1)
  const alvo = new Date(y, m - 1, 1)
  if (alvo >= inicioMesAtual) {
    return { ok: false, erro: 'Não dá para gerar relatório de um mês que ainda não terminou.' }
  }
  if (y < 2020) {
    return { ok: false, erro: 'Mês muito antigo — começamos a partir de 2020.' }
  }
  return { ok: true, mes }
}

export function mesPorExtenso(mes: string): string {
  const [y, m] = mes.split('-').map(Number)
  return `${MESES_PT[m - 1]} de ${y}`
}

export interface NumerosEntrada {
  faturamento?: number | null
  investimentoAds?: number | null
  leads?: number | null
  clientesNovos?: number | null
  ticketMedio?: number | null
  observacoes?: string | null
}

export interface DadosEntradaRelatorio {
  numeros: NumerosEntrada
  csvTexto?: string | null
  csvNomeArquivo?: string | null
}

/** Converte string monetária/pt-BR ou número em number | null. */
export function parseNumeroBr(valor: string | number | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === '') return null
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null
  const limpo = valor
    .trim()
    .replace(/R\$\s?/i, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '')
  if (!limpo) return null
  const n = Number(limpo)
  return Number.isFinite(n) ? n : null
}

/**
 * Resume um CSV bruto para o prompt (limite de linhas/caracteres).
 * Não interpreta plataforma — só formata o que o dono exportou.
 */
export function resumirCsv(csv: string, maxLinhas = 40, maxChars = 6000): string {
  const linhas = csv
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (linhas.length === 0) return ''

  const cortadas = linhas.slice(0, maxLinhas)
  let texto = cortadas.join('\n')
  if (linhas.length > maxLinhas) {
    texto += `\n… (${linhas.length - maxLinhas} linhas omitidas)`
  }
  if (texto.length > maxChars) {
    texto = texto.slice(0, maxChars) + '\n… (truncado)'
  }
  return texto
}

export function montarPayloadPrompt(input: {
  negocio: { nome: string; segmento: string | null }
  mes: string
  dados: DadosEntradaRelatorio
  dossie?: unknown
}): string {
  const { negocio, mes, dados, dossie } = input
  const payload = {
    negocio: {
      nome: negocio.nome,
      segmento: negocio.segmento,
    },
    mes,
    mes_legivel: mesPorExtenso(mes),
    numeros: dados.numeros,
    csv_resumido: dados.csvTexto ? resumirCsv(dados.csvTexto) : null,
    csv_nome_arquivo: dados.csvNomeArquivo ?? null,
    dossie: dossie ?? null,
  }
  return [
    'Gere o relatório mensal em HTML conforme as instruções do system prompt.',
    'Use exclusivamente os dados abaixo. Não invente números.',
    '',
    '```json',
    JSON.stringify(payload, null, 2),
    '```',
  ].join('\n')
}

/** Extrai a primeira frase útil do HTML gerado para listagem. */
export function extrairResumo(html: string, max = 220): string {
  const semTags = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!semTags) return 'Relatório gerado.'
  const semCabecalho = semTags
    .replace(/^VETOR\s*/i, '')
    .replace(/^relatório[^.]{0,40}\.\s*/i, '')
    .trim()
  const texto = semCabecalho || semTags
  if (texto.length <= max) return texto
  return texto.slice(0, max - 1).trimEnd() + '…'
}

/** Garante que a resposta da IA seja HTML usável (tira fences se vierem). */
export function normalizarHtmlResposta(raw: string): string {
  let s = raw.trim()
  const fence = /^```(?:html)?\s*([\s\S]*?)```$/i.exec(s)
  if (fence) s = fence[1].trim()
  if (!/<html[\s>]/i.test(s) && !/<!DOCTYPE/i.test(s)) {
    s = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8" /><title>Relatório VETOR</title>
<style>
  body{font-family:system-ui,sans-serif;background:#F0EEE8;color:#171717;max-width:720px;margin:0 auto;padding:32px;line-height:1.5}
  h1,h2{font-weight:700}
  .muted{color:#7A756C}
</style>
</head>
<body>${s}</body>
</html>`
  }
  return s
}
