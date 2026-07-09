// Funções puras do módulo Conteúdo.

/** Segunda-feira da semana (ISO) em YYYY-MM-DD no fuso SP. */
export function segundaDaSemana(ref: Date = new Date()): string {
  const d = new Date(ref)
  // Ajusta para America/Sao_Paulo de forma estável via UTC offset aproximado
  const dia = d.getDay() // 0=dom
  const diff = dia === 0 ? -6 : 1 - dia
  d.setDate(d.getDate() + diff)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function labelSemana(semanaInicio: string): string {
  const [y, m, d] = semanaInicio.split('-').map(Number)
  const inicio = new Date(y, m - 1, d)
  const fim = new Date(y, m - 1, d + 6)
  const fmt = (dt: Date) =>
    new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(dt)
  return `${fmt(inicio)} – ${fmt(fim)}`
}

export function labelStatus(status: string): string {
  const map: Record<string, string> = {
    gerando: 'gerando…',
    pendente: 'aguardando aprovação',
    aprovado: 'aprovado',
    rejeitado: 'rejeitado',
    exportado: 'exportado',
    erro: 'erro',
  }
  return map[status] ?? status
}

/** Detecta conformidade pelo segmento do tenant. */
export type Conformidade = 'cfo_dental' | 'susep_seguros' | 'geral'

export function conformidadeDoSegmento(segmento: string | null): Conformidade {
  const s = (segmento ?? '').toLowerCase()
  if (/odonto|dental|dent|clínica|clinica/.test(s)) return 'cfo_dental'
  if (/seguro|corretor|susep|sinistro/.test(s)) return 'susep_seguros'
  return 'geral'
}

export interface PostGeradoIa {
  canal?: string
  titulo?: string
  texto: string
  hashtags?: string
  diaSemana?: string // seg|ter|...
}

/** Parseia JSON array da resposta da IA (com ou sem fences). */
export function parsearPostsDaIa(raw: string): PostGeradoIa[] {
  let s = raw.trim()
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/i.exec(s)
  if (fence) s = fence[1].trim()

  // tenta achar array no meio do texto
  const start = s.indexOf('[')
  const end = s.lastIndexOf(']')
  if (start >= 0 && end > start) s = s.slice(start, end + 1)

  const parsed = JSON.parse(s) as unknown
  if (!Array.isArray(parsed)) throw new Error('IA não retornou lista de posts.')

  const out: PostGeradoIa[] = []
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const texto = String(o.texto ?? o.legenda ?? o.caption ?? '').trim()
    if (!texto) continue
    out.push({
      canal: String(o.canal ?? 'instagram'),
      titulo: o.titulo ? String(o.titulo) : undefined,
      texto,
      hashtags: o.hashtags
        ? String(o.hashtags)
        : Array.isArray(o.tags)
          ? (o.tags as string[]).join(' ')
          : undefined,
      diaSemana: o.dia ? String(o.dia) : o.diaSemana ? String(o.diaSemana) : undefined,
    })
  }
  return out
}

const DIA_OFFSET: Record<string, number> = {
  seg: 0,
  segunda: 0,
  ter: 1,
  terca: 1,
  terça: 1,
  qua: 2,
  quarta: 2,
  qui: 3,
  quinta: 3,
  sex: 4,
  sexta: 4,
  sab: 5,
  sabado: 5,
  sábado: 5,
  dom: 6,
  domingo: 6,
}

export function dataDoDiaNaSemana(semanaInicio: string, diaSemana?: string, ordem = 0): Date {
  const [y, m, d] = semanaInicio.split('-').map(Number)
  const base = new Date(y, m - 1, d, 10, 0, 0)
  const key = (diaSemana ?? '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  const offset = key in DIA_OFFSET ? DIA_OFFSET[key] : Math.min(ordem, 6)
  base.setDate(base.getDate() + offset)
  return base
}

export function montarTextoExportacao(
  posts: Array<{ titulo: string | null; texto: string; hashtags: string | null; agendadoPara: Date | null }>,
): string {
  return posts
    .map((p, i) => {
      const quando = p.agendadoPara
        ? new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'short',
            timeZone: 'America/Sao_Paulo',
          }).format(p.agendadoPara)
        : `post ${i + 1}`
      return [
        `—— ${quando}${p.titulo ? ` · ${p.titulo}` : ''} ——`,
        p.texto,
        p.hashtags ?? '',
        '',
      ].join('\n')
    })
    .join('\n')
}
