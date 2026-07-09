import 'server-only'
import { tenantDb, type TenantDb } from '@/core/db/client'
import type { ConteudoPost } from '@/core/db/generated/client'

export async function listarPosts(
  tenantId: string,
  opts: { semanaInicio?: string; status?: string } = {},
  dbc: TenantDb = tenantDb(tenantId),
): Promise<ConteudoPost[]> {
  return dbc.conteudoPost.findMany({
    where: {
      ...(opts.semanaInicio ? { semanaInicio: opts.semanaInicio } : {}),
      ...(opts.status ? { status: opts.status } : {}),
    },
    orderBy: [{ semanaInicio: 'desc' }, { ordem: 'asc' }, { criadoEm: 'asc' }],
  })
}

export async function contarPendentes(
  tenantId: string,
  dbc: TenantDb = tenantDb(tenantId),
): Promise<number> {
  return dbc.conteudoPost.count({ where: { status: 'pendente' } })
}

export async function buscarPost(
  tenantId: string,
  id: string,
  dbc: TenantDb = tenantDb(tenantId),
): Promise<ConteudoPost | null> {
  return dbc.conteudoPost.findFirst({ where: { id } })
}
