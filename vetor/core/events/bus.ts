import { db } from '@/core/db/client'
import type { Prisma, Event } from '@/core/db/generated/client'

// ADR-002 — módulos nunca se importam; conversam por esta tabela.
// `modules/midia` publica `campanha.alerta_criado`; `modules/relatorios` consome.
// O client é injetável para teste (e para uso dentro de transações).

export type EventDb = Pick<typeof db, 'event'>

export async function publish(
  tenantId: string,
  tipo: string,
  payload: Prisma.InputJsonValue,
  dbc: EventDb = db,
): Promise<void> {
  await dbc.event.create({ data: { tenantId, tipo, payload } })
}

export async function fetchUnprocessed(
  { tipo, limit = 50 }: { tipo?: string; limit?: number } = {},
  dbc: EventDb = db,
): Promise<Event[]> {
  return dbc.event.findMany({
    where: { processado: false, ...(tipo ? { tipo } : {}) },
    orderBy: { criadoEm: 'asc' },
    take: limit,
  })
}

export async function markProcessed(ids: string[], dbc: EventDb = db): Promise<void> {
  if (ids.length === 0) return
  await dbc.event.updateMany({
    where: { id: { in: ids } },
    data: { processado: true },
  })
}
