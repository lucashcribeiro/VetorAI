import type { AgenteId } from './agents'

export function labelStatusEntrega(status: string): string {
  if (status === 'rascunho') return 'rascunho'
  if (status === 'aprovado') return 'aprovado'
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

/** Garante que a resposta tenha corpo útil (markdown). */
export function normalizarMarkdown(raw: string): string {
  let s = raw.trim()
  const fence = /^```(?:markdown|md)?\s*([\s\S]*?)```$/i.exec(s)
  if (fence) s = fence[1].trim()
  return s
}
