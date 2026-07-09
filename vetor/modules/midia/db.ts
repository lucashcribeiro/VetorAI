import 'server-only'
import { tenantDb, type TenantDb } from '@/core/db/client'
import type { MidiaAlerta, MidiaMetrica } from '@/core/db/generated/client'

export async function listarMetricas(
  tenantId: string,
  opts: { limit?: number } = {},
  dbc: TenantDb = tenantDb(tenantId),
): Promise<MidiaMetrica[]> {
  return dbc.midiaMetrica.findMany({
    orderBy: [{ data: 'desc' }, { campanha: 'asc' }],
    take: opts.limit ?? 200,
  })
}

export async function listarAlertas(
  tenantId: string,
  opts: { status?: string; limit?: number } = {},
  dbc: TenantDb = tenantDb(tenantId),
): Promise<MidiaAlerta[]> {
  return dbc.midiaAlerta.findMany({
    where: opts.status ? { status: opts.status } : undefined,
    orderBy: { criadoEm: 'desc' },
    take: opts.limit ?? 50,
  })
}

export async function contarAlertasAbertos(
  tenantId: string,
  dbc: TenantDb = tenantDb(tenantId),
): Promise<number> {
  return dbc.midiaAlerta.count({ where: { status: 'aberto' } })
}
