import 'server-only'
import { tenantDb, type TenantDb } from '@/core/db/client'
import type { TimeEntrega, TimeRodada } from '@/core/db/generated/client'

export async function listarRodadas(
  tenantId: string,
  limit = 20,
  dbc: TenantDb = tenantDb(tenantId),
): Promise<TimeRodada[]> {
  return dbc.timeRodada.findMany({
    orderBy: { criadoEm: 'desc' },
    take: limit,
  })
}

export async function buscarRodada(
  tenantId: string,
  id: string,
  dbc: TenantDb = tenantDb(tenantId),
): Promise<TimeRodada | null> {
  return dbc.timeRodada.findFirst({ where: { id } })
}

export async function listarEntregasRodada(
  tenantId: string,
  rodadaId: string,
  dbc: TenantDb = tenantDb(tenantId),
): Promise<TimeEntrega[]> {
  return dbc.timeEntrega.findMany({
    where: { rodadaId },
    orderBy: { criadoEm: 'asc' },
  })
}

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
