import 'server-only'
import { db } from '@/core/db/client'

// Feature flags por tenant (tenant_modules). O nível de autonomia de cada
// módulo vive no campo `config` (jsonb) — README §3.

export async function getActiveModuleIds(tenantId: string): Promise<string[]> {
  const rows = await db.tenantModule.findMany({
    where: { tenantId, ativo: true },
    select: { moduleId: true },
  })
  return rows.map((r) => r.moduleId)
}

export async function isModuleActive(tenantId: string, moduleId: string): Promise<boolean> {
  const row = await db.tenantModule.findUnique({
    where: { tenantId_moduleId: { tenantId, moduleId } },
    select: { ativo: true },
  })
  return row?.ativo ?? false
}
