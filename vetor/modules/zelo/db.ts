import 'server-only'
import { tenantDb, type TenantDb } from '@/core/db/client'
import type { ZeloConversa, ZeloMensagem } from '@/core/db/generated/client'

export async function listarConversas(
  tenantId: string,
  opts: { status?: string; limit?: number } = {},
  dbc: TenantDb = tenantDb(tenantId),
): Promise<ZeloConversa[]> {
  return dbc.zeloConversa.findMany({
    where: opts.status ? { status: opts.status } : undefined,
    orderBy: { ultimaMsgEm: 'desc' },
    take: opts.limit ?? 50,
  })
}

export async function buscarConversa(
  tenantId: string,
  id: string,
  dbc: TenantDb = tenantDb(tenantId),
): Promise<ZeloConversa | null> {
  return dbc.zeloConversa.findFirst({ where: { id } })
}

export async function listarMensagens(
  tenantId: string,
  conversaId: string,
  dbc: TenantDb = tenantDb(tenantId),
): Promise<ZeloMensagem[]> {
  return dbc.zeloMensagem.findMany({
    where: { conversaId },
    orderBy: { criadoEm: 'asc' },
  })
}

export async function contarAguardando(
  tenantId: string,
  dbc: TenantDb = tenantDb(tenantId),
): Promise<number> {
  return dbc.zeloConversa.count({ where: { status: 'aguardando' } })
}

export async function mediaTempoPrimeiraResposta(
  tenantId: string,
  dbc: TenantDb = tenantDb(tenantId),
): Promise<number | null> {
  const rows = await dbc.zeloConversa.findMany({
    where: { tempoPrimeiraRespostaMs: { not: null } },
    select: { tempoPrimeiraRespostaMs: true },
    take: 100,
    orderBy: { primeiraRespostaEm: 'desc' },
  })
  if (rows.length === 0) return null
  const sum = rows.reduce((a, r) => a + (r.tempoPrimeiraRespostaMs ?? 0), 0)
  return Math.round(sum / rows.length)
}
