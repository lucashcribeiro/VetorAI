import 'server-only'
import { tenantDb } from '@/core/db/client'
import { publish } from '@/core/events/bus'
import {
  detectarAlertas,
  parsearCsvAnuncios,
  type LinhaMetrica,
} from '../lib'

export const MODULE_ID = 'midia'
export const EVENTO_ALERTA = 'campanha.alerta_criado'

function toDateOnly(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

/** Grava métricas e gera alertas; publica eventos. */
export async function processarImportCsv(input: {
  tenantId: string
  csv: string
  userId?: string | null
}): Promise<
  | { ok: true; linhas: number; alertas: number }
  | { ok: false; erro: string }
> {
  const { tenantId, csv, userId } = input
  let linhas: LinhaMetrica[]
  try {
    linhas = parsearCsvAnuncios(csv)
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'CSV inválido.' }
  }
  if (linhas.length === 0) {
    return { ok: false, erro: 'Nenhuma linha de métrica encontrada no CSV.' }
  }

  const tdb = tenantDb(tenantId)

  for (const l of linhas) {
    await tdb.midiaMetrica.create({
      data: {
        tenantId,
        data: toDateOnly(l.data),
        campanha: l.campanha.slice(0, 200),
        plataforma: l.plataforma,
        gasto: l.gasto,
        impressoes: l.impressoes,
        cliques: l.cliques,
        leads: l.leads,
        conversoes: l.conversoes,
        cpl: l.cpl,
        origem: 'csv',
      },
    })
  }

  // Reanalisa com histórico recente do tenant (não só o CSV).
  const hist = await tdb.midiaMetrica.findMany({
    orderBy: { data: 'asc' },
    take: 500,
  })
  const histLinhas: LinhaMetrica[] = hist.map((h) => ({
    data: h.data.toISOString().slice(0, 10),
    campanha: h.campanha,
    plataforma: h.plataforma,
    gasto: Number(h.gasto),
    impressoes: h.impressoes,
    cliques: h.cliques,
    leads: h.leads,
    conversoes: h.conversoes,
    cpl: h.cpl != null ? Number(h.cpl) : null,
  }))

  const alertas = await gravarAlertasDetectados(tenantId, histLinhas, userId)

  await tdb.activityLog.create({
    data: {
      tenantId,
      userId: userId ?? null,
      acao: 'midia.csv_importado',
      detalhe: { linhas: linhas.length, alertas },
    },
  })

  return { ok: true, linhas: linhas.length, alertas }
}

/**
 * Reexecuta detecção sobre o histórico (job diário Etapa B / cron).
 * Sem Meta API ainda: só reanalisa o que já está no banco.
 */
export async function executarAnaliseDiaria(input: {
  tenantId: string
}): Promise<{ ok: true; alertas: number } | { ok: false; erro: string }> {
  const tdb = tenantDb(input.tenantId)
  const hist = await tdb.midiaMetrica.findMany({
    orderBy: { data: 'asc' },
    take: 500,
  })
  if (hist.length === 0) {
    return { ok: false, erro: 'Sem métricas para analisar. Importe um CSV primeiro.' }
  }
  const histLinhas: LinhaMetrica[] = hist.map((h) => ({
    data: h.data.toISOString().slice(0, 10),
    campanha: h.campanha,
    plataforma: h.plataforma,
    gasto: Number(h.gasto),
    impressoes: h.impressoes,
    cliques: h.cliques,
    leads: h.leads,
    conversoes: h.conversoes,
    cpl: h.cpl != null ? Number(h.cpl) : null,
  }))
  const alertas = await gravarAlertasDetectados(input.tenantId, histLinhas, null)
  return { ok: true, alertas }
}

async function gravarAlertasDetectados(
  tenantId: string,
  metricas: LinhaMetrica[],
  userId: string | null | undefined,
): Promise<number> {
  const tdb = tenantDb(tenantId)
  const detectados = detectarAlertas(metricas)
  let criados = 0

  for (const a of detectados) {
    // Evita spam: mesmo tipo+campanha aberto nos últimos 2 dias.
    const recente = await tdb.midiaAlerta.findFirst({
      where: {
        campanha: a.campanha,
        tipo: a.tipo,
        status: 'aberto',
        criadoEm: { gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      },
    })
    if (recente) continue

    const row = await tdb.midiaAlerta.create({
      data: {
        tenantId,
        campanha: a.campanha,
        tipo: a.tipo,
        severidade: a.severidade,
        mensagem: a.mensagem,
        valorAtual: a.valorAtual,
        valorBaseline: a.valorBaseline,
        status: 'aberto',
      },
    })

    await publish(tenantId, EVENTO_ALERTA, {
      alertaId: row.id,
      campanha: a.campanha,
      tipo: a.tipo,
      severidade: a.severidade,
      mensagem: a.mensagem,
    })

    criados++
  }

  if (criados > 0) {
    await tdb.activityLog.create({
      data: {
        tenantId,
        userId: userId ?? null,
        acao: 'midia.alertas_gerados',
        detalhe: { qtd: criados },
      },
    })
  }

  return criados
}

export async function atualizarStatusAlerta(input: {
  tenantId: string
  alertaId: string
  status: 'resolvido' | 'ignorado' | 'aberto'
  userId?: string | null
}): Promise<{ ok: true } | { ok: false; erro: string }> {
  const tdb = tenantDb(input.tenantId)
  const a = await tdb.midiaAlerta.findFirst({ where: { id: input.alertaId } })
  if (!a) return { ok: false, erro: 'Alerta não encontrado.' }

  await tdb.midiaAlerta.update({
    where: { id: input.alertaId },
    data: {
      status: input.status,
      resolvidoEm: input.status === 'aberto' ? null : new Date(),
    },
  })

  await tdb.activityLog.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId ?? null,
      acao: 'midia.alerta_atualizado',
      detalhe: { alertaId: input.alertaId, status: input.status },
    },
  })

  return { ok: true }
}
