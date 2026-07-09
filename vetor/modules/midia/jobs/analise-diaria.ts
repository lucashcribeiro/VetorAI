import 'server-only'
import { db } from '@/core/db/client'
import { executarAnaliseDiaria } from '../server/service'

/**
 * Job diário (Fase 6): reanalisa métricas de todos os tenants com midia ativo.
 * Etapa B (Meta API) entra aqui depois — por enquanto só histórico CSV/API no banco.
 * Registrar no Trigger.dev quando a conta estiver configurada.
 */
export async function rodarAnaliseDiariaTodosTenants(): Promise<{
  processados: number
  alertas: number
}> {
  const ativos = await db.tenantModule.findMany({
    where: { moduleId: 'midia', ativo: true },
    select: { tenantId: true },
  })

  let processados = 0
  let alertas = 0
  for (const { tenantId } of ativos) {
    const r = await executarAnaliseDiaria({ tenantId })
    processados++
    if (r.ok) alertas += r.alertas
  }
  return { processados, alertas }
}
