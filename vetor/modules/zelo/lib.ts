// Funções puras do Zelo — client e server.

export type StatusConversa = 'aguardando' | 'respondida' | 'escalada'
export type DirecaoMensagem = 'entrada' | 'saida' | 'sugestao'
export type StatusMensagem =
  | 'recebida'
  | 'pendente'
  | 'aprovada'
  | 'descartada'
  | 'enviada'
  | 'erro'

export function labelStatusConversa(status: string): string {
  if (status === 'aguardando') return 'aguardando você'
  if (status === 'respondida') return 'respondida'
  if (status === 'escalada') return 'com a equipe'
  return status
}

export function formatarTempoResposta(ms: number | null | undefined): string {
  if (ms == null || ms < 0) return '—'
  const sec = Math.round(ms / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  const resto = sec % 60
  if (min < 60) return resto ? `${min}min ${resto}s` : `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

/** Normaliza telefone para dígitos (sem +). */
export function normalizarWaId(raw: string): string {
  return raw.replace(/\D/g, '')
}

export function mascararTelefone(waId: string): string {
  const d = normalizarWaId(waId)
  if (d.length < 6) return d
  return `${d.slice(0, 4)}…${d.slice(-4)}`
}

export function montarPromptSugestao(input: {
  negocio: { nome: string; segmento: string | null }
  contato: { nome: string | null; waId: string }
  historico: Array<{ direcao: string; corpo: string }>
  dossie?: unknown
}): string {
  const hist = input.historico
    .slice(-20)
    .map((m) => {
      const quem =
        m.direcao === 'entrada' ? 'CONTATO' : m.direcao === 'saida' ? 'EQUIPE' : 'RASCUNHO'
      return `${quem}: ${m.corpo}`
    })
    .join('\n')

  return [
    'Gere UMA sugestão de resposta para a secretária aprovar.',
    'Responda só com o texto da mensagem (sem aspas, sem markdown, sem prefixo).',
    '',
    `Negócio: ${input.negocio.nome}`,
    `Segmento: ${input.negocio.segmento ?? 'não informado'}`,
    `Contato: ${input.contato.nome ?? 'sem nome'} (${input.contato.waId})`,
    input.dossie ? `Contexto do dossiê: ${JSON.stringify(input.dossie)}` : '',
    '',
    'Histórico recente:',
    hist || '(sem histórico)',
  ]
    .filter(Boolean)
    .join('\n')
}

/** Extrai texto limpo da resposta da IA. */
export function limparSugestao(raw: string): string {
  let s = raw.trim()
  const fence = /^```(?:\w+)?\s*([\s\S]*?)```$/i.exec(s)
  if (fence) s = fence[1].trim()
  // Remove aspas envolventes comuns.
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith('“') && s.endsWith('”')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim()
  }
  return s.slice(0, 4000)
}
