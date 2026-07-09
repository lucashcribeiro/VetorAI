import type { AgenteId } from './agents'

export function labelStatusEntrega(status: string): string {
  if (status === 'rascunho') return 'rascunho'
  if (status === 'aprovado') return 'aprovado'
  if (status === 'rejeitado_qa') return 'retrabalho'
  return status
}

export function labelStatusRodada(status: string): string {
  if (status === 'rodando') return 'em andamento'
  if (status === 'qa') return 'prisma revisando'
  if (status === 'retrabalho') return 'retrabalho'
  if (status === 'concluido') return 'concluído'
  if (status === 'erro') return 'erro'
  return status
}

export function montarYamlCabecalho(input: {
  clienteSlug: string
  tipo: string
  agente: AgenteId
  data: string
  status: string
  versao: number
}): string {
  return [
    '---',
    `cliente: ${input.clienteSlug}`,
    `tipo: ${input.tipo}`,
    `funcionario: vetor-${input.agente.replace(/_/g, '-')}`,
    `data: ${input.data}`,
    `status: ${input.status}`,
    `versao: ${input.versao}`,
    '---',
    '',
  ].join('\n')
}

export function normalizarMarkdown(raw: string): string {
  let s = raw.trim()
  const fence = /^```(?:markdown|md)?\s*([\s\S]*?)```$/i.exec(s)
  if (fence) s = fence[1].trim()
  return s
}

export interface ResultadoQa {
  aprovado: boolean
  problemas: Array<{ agente: AgenteId; motivo: string }>
  sumario_executivo: string
}

const AGENTES_RETRABALHO = new Set([
  'orquestrador',
  'estrategista',
  'copywriter',
  'gestor_midia',
])

export function parseResultadoQa(raw: string): ResultadoQa {
  let s = raw.trim()
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/i.exec(s)
  if (fence) s = fence[1].trim()
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start >= 0 && end > start) s = s.slice(start, end + 1)

  const parsed = JSON.parse(s) as {
    aprovado?: boolean
    problemas?: Array<{ agente?: string; motivo?: string }>
    sumario_executivo?: string
  }

  const problemas = (parsed.problemas ?? [])
    .map((p) => ({
      agente: String(p.agente ?? '') as AgenteId,
      motivo: String(p.motivo ?? '').trim(),
    }))
    .filter((p) => AGENTES_RETRABALHO.has(p.agente) && p.motivo)

  return {
    aprovado: Boolean(parsed.aprovado) && problemas.length === 0,
    problemas,
    sumario_executivo: String(parsed.sumario_executivo ?? '').trim() || 'Sem sumário.',
  }
}

export type LogEtapa = {
  em: string
  etapa: string
  status: 'ok' | 'erro' | 'retrabalho' | 'qa_ok' | 'qa_reprova'
  detalhe?: string
  entregaId?: string
}

export function appendLog(log: unknown, entrada: LogEtapa): LogEtapa[] {
  const base = Array.isArray(log) ? (log as LogEtapa[]) : []
  return [...base, entrada]
}
