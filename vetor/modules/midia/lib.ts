// Funções puras do Monitor de Anúncios (língua de dono, sem jargão na UI).

export interface LinhaMetrica {
  data: string // YYYY-MM-DD
  campanha: string
  plataforma: string
  gasto: number
  impressoes: number
  cliques: number
  leads: number
  conversoes: number
  cpl: number | null
}

export interface AlertaDetectado {
  campanha: string
  tipo: 'cpl_subiu' | 'gasto_alto' | 'sem_resultado'
  severidade: 'info' | 'atencao' | 'critico'
  mensagem: string
  valorAtual: number | null
  valorBaseline: number | null
}

/** Normaliza cabeçalho CSV (Meta/Google/export genérico). */
export function normalizarHeader(h: string): string {
  return h
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

const ALIASES: Record<string, keyof Omit<LinhaMetrica, 'cpl'>> = {
  date: 'data',
  data: 'data',
  day: 'data',
  reporting_starts: 'data',
  campaign: 'campanha',
  campaign_name: 'campanha',
  campanha: 'campanha',
  ad_set_name: 'campanha',
  adset_name: 'campanha',
  plataforma: 'plataforma',
  platform: 'plataforma',
  publisher_platform: 'plataforma',
  spend: 'gasto',
  amount_spent: 'gasto',
  gasto: 'gasto',
  cost: 'gasto',
  impressions: 'impressoes',
  impressoes: 'impressoes',
  clicks: 'cliques',
  cliques: 'cliques',
  link_clicks: 'cliques',
  leads: 'leads',
  results: 'leads',
  result: 'leads',
  messaging_conversations_started: 'leads',
  conversions: 'conversoes',
  conversoes: 'conversoes',
  purchases: 'conversoes',
}

export function parseNumeroCsv(raw: string): number {
  if (!raw) return 0
  let s = raw.trim().replace(/R\$\s?/i, '').replace(/\s/g, '')
  // 1.234,56 vs 1,234.56
  if (s.includes(',') && s.includes('.')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.')
    } else {
      s = s.replace(/,/g, '')
    }
  } else if (s.includes(',')) {
    s = s.replace(',', '.')
  }
  const n = Number(s.replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function parseDataCsv(raw: string): string | null {
  const t = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10)
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(t)
  if (br) {
    const [, d, m, y] = br
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return null
}

/** CSV simples com vírgula ou ponto-e-vírgula; aspas básicas. */
export function parseCsvLinhas(csv: string): string[][] {
  const text = csv.replace(/^\uFEFF/, '')
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length === 0) return []

  const sep = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ','
  return lines.map((line) => {
    const cells: string[] = []
    let cur = ''
    let inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"'
          i++
        } else inQ = !inQ
      } else if (ch === sep && !inQ) {
        cells.push(cur)
        cur = ''
      } else cur += ch
    }
    cells.push(cur)
    return cells.map((c) => c.trim())
  })
}

export function parsearCsvAnuncios(csv: string): LinhaMetrica[] {
  const rows = parseCsvLinhas(csv)
  if (rows.length < 2) return []

  const headers = rows[0].map(normalizarHeader)
  const mapIdx: Partial<Record<keyof LinhaMetrica, number>> = {}
  headers.forEach((h, i) => {
    const base = h.replace(/_brl$|_usd$|_br$|_rs$/, '')
    const key = ALIASES[h] ?? ALIASES[base]
    if (key && mapIdx[key] === undefined) mapIdx[key] = i
  })

  if (mapIdx.gasto === undefined && mapIdx.campanha === undefined) {
    throw new Error(
      'CSV não reconhecido. Precisa de colunas de campanha e gasto (export Meta/Google).',
    )
  }

  const out: LinhaMetrica[] = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row.some((c) => c.trim())) continue

    const get = (k: keyof LinhaMetrica) => {
      const idx = mapIdx[k]
      return idx === undefined ? '' : (row[idx] ?? '')
    }

    const data = parseDataCsv(get('data')) ?? new Date().toISOString().slice(0, 10)
    const campanha = get('campanha').trim() || 'Campanha sem nome'
    const gasto = parseNumeroCsv(get('gasto'))
    const impressoes = Math.round(parseNumeroCsv(get('impressoes')))
    const cliques = Math.round(parseNumeroCsv(get('cliques')))
    const leads = Math.round(parseNumeroCsv(get('leads')))
    const conversoes = Math.round(parseNumeroCsv(get('conversoes')))
    const cpl = leads > 0 ? gasto / leads : null
    const platRaw = get('plataforma').toLowerCase()
    const plataforma = /google|ads/.test(platRaw)
      ? 'google'
      : /instagram|facebook|meta|audience/.test(platRaw)
        ? 'meta'
        : platRaw || 'meta'

    out.push({
      data,
      campanha,
      plataforma,
      gasto,
      impressoes,
      cliques,
      leads,
      conversoes,
      cpl,
    })
  }
  return out
}

/**
 * Detecta desvios: CPL médio dos últimos `janela` dias vs período anterior.
 * Default: +30% → alerta (README Fase 6).
 */
export function detectarAlertas(
  metricas: LinhaMetrica[],
  opts: { janelaDias?: number; limiarCpl?: number; limiarGastoSemLead?: number } = {},
): AlertaDetectado[] {
  const janela = opts.janelaDias ?? 3
  const limiarCpl = opts.limiarCpl ?? 0.3
  const limiarGasto = opts.limiarGastoSemLead ?? 200

  if (metricas.length === 0) return []

  const porCampanha = new Map<string, LinhaMetrica[]>()
  for (const m of metricas) {
    const list = porCampanha.get(m.campanha) ?? []
    list.push(m)
    porCampanha.set(m.campanha, list)
  }

  const alertas: AlertaDetectado[] = []

  for (const [campanha, linhas] of porCampanha) {
    const sorted = [...linhas].sort((a, b) => a.data.localeCompare(b.data))
    const datas = [...new Set(sorted.map((l) => l.data))].sort()
    if (datas.length === 0) continue

    const ultimasDatas = datas.slice(-janela)
    const anterioresDatas = datas.slice(0, -janela).slice(-janela)

    const agg = (ds: string[]) => {
      const subset = sorted.filter((l) => ds.includes(l.data))
      const gasto = subset.reduce((s, x) => s + x.gasto, 0)
      const leads = subset.reduce((s, x) => s + x.leads, 0)
      return { gasto, leads, cpl: leads > 0 ? gasto / leads : null }
    }

    const atual = agg(ultimasDatas)
    const base = anterioresDatas.length ? agg(anterioresDatas) : null

    if (atual.gasto >= limiarGasto && atual.leads === 0) {
      alertas.push({
        campanha,
        tipo: 'sem_resultado',
        severidade: atual.gasto >= limiarGasto * 2 ? 'critico' : 'atencao',
        mensagem: `Na campanha “${campanha}”, você gastou cerca de ${fmtBrl(atual.gasto)} e ainda não trouxe nenhum contato. Vale pausar ou revisar o anúncio.`,
        valorAtual: atual.gasto,
        valorBaseline: null,
      })
    }

    if (
      base?.cpl != null &&
      atual.cpl != null &&
      base.cpl > 0 &&
      atual.cpl >= base.cpl * (1 + limiarCpl)
    ) {
      const pct = Math.round(((atual.cpl - base.cpl) / base.cpl) * 100)
      alertas.push({
        campanha,
        tipo: 'cpl_subiu',
        severidade: pct >= 50 ? 'critico' : 'atencao',
        mensagem: `O custo para trazer cada contato na campanha “${campanha}” subiu cerca de ${pct}% (de ${fmtBrl(base.cpl)} para ${fmtBrl(atual.cpl)}). Olhe isso antes de gastar mais.`,
        valorAtual: atual.cpl,
        valorBaseline: base.cpl,
      })
    }

    if (base && atual.gasto >= base.gasto * 1.5 && base.gasto >= 50 && atual.leads <= base.leads) {
      alertas.push({
        campanha,
        tipo: 'gasto_alto',
        severidade: 'atencao',
        mensagem: `O gasto na campanha “${campanha}” subiu forte (${fmtBrl(base.gasto)} → ${fmtBrl(atual.gasto)}) sem trazer mais contatos. Confira o orçamento.`,
        valorAtual: atual.gasto,
        valorBaseline: base.gasto,
      })
    }
  }

  return alertas
}

export function fmtBrl(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

export function labelSeveridade(s: string): string {
  if (s === 'critico') return 'crítico'
  if (s === 'atencao') return 'atenção'
  return 'info'
}

export function labelStatusAlerta(s: string): string {
  if (s === 'aberto') return 'aberto'
  if (s === 'resolvido') return 'resolvido'
  if (s === 'ignorado') return 'ignorado'
  return s
}
