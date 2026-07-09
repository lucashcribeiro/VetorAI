import 'server-only'
import { tenantDb, type TenantDb } from '@/core/db/client'
import type { TimeEntrega } from '@/core/db/generated/client'

export async function listarEntregas(
  tenantId: string,
  opts: { agente?: string; status?: string; limit?: number } = {},
  dbc: TenantDb = tenantDb(tenantId),
): Promise<TimeEntrega[]> {
  return dbc.timeEntrega.findMany({
    where: {
      ...(opts.agente ? { agente: opts.agente } : {}),
      ...(opts.status ? { status: opts.status } : {}),
    },
    orderBy: { criadoEm: 'desc' },
    take: opts.limit ?? 50,
  })
}

export async function buscarEntrega(
  tenantId: string,
  id: string,
  dbc: TenantDb = tenantDb(tenantId),
): Promise<TimeEntrega | null> {
  return dbc.timeEntrega.findFirst({ where: { id } })
}

export async function ultimasAprovadasPorAgente(
  tenantId: string,
  agentes: string[],
  dbc: TenantDb = tenantDb(tenantId),
): Promise<TimeEntrega[]> {
  const out: TimeEntrega[] = []
  for (const agente of agentes) {
    const row = await dbc.timeEntrega.findFirst({
      where: { agente, status: 'aprovado' },
      orderBy: { criadoEm: 'desc' },
    })
    if (row) out.push(row)
  }
  return out
}
