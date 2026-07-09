'use server'

import { revalidatePath } from 'next/cache'
import { requireTenantContext } from '@/core/tenant/context'
import { currentUserDb } from '@/core/auth/guards'
import { isModuleActive } from '@/core/tenant/modules'
import type { AgenteId } from '../agents'
import { getAgente } from '../agents'
import { aprovarEntrega, executarAgente } from './service'

export type ActionResult =
  | { ok: true; entregaId?: string }
  | { ok: false; erro: string }

async function guard() {
  const tenant = await requireTenantContext()
  if (!(await isModuleActive(tenant.id, 'time'))) {
    throw new Error('O módulo Time VETOR não está ativo nesta empresa.')
  }
  return tenant
}

export async function rodarAgenteAction(formData: FormData): Promise<ActionResult> {
  try {
    const tenant = await guard()
    const user = await currentUserDb()
    const agenteId = String(formData.get('agenteId') ?? '') as AgenteId
    if (!getAgente(agenteId)) return { ok: false, erro: 'Agente inválido.' }

    const brief = String(formData.get('brief') ?? '')
    const tipo = String(formData.get('tipo') ?? '') || undefined
    const forcar = formData.get('forcar') === '1'

    const r = await executarAgente({
      tenantId: tenant.id,
      agenteId,
      tipo,
      brief,
      userId: user?.id,
      forcarSemDependencias: forcar,
    })

    revalidatePath('/tools/time')
    if (r.ok) revalidatePath(`/tools/time/${r.entregaId}`)
    return r
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao rodar agente.' }
  }
}

export async function aprovarEntregaAction(entregaId: string): Promise<ActionResult> {
  try {
    const tenant = await guard()
    const user = await currentUserDb()
    const r = await aprovarEntrega({
      tenantId: tenant.id,
      entregaId,
      userId: user?.id,
    })
    revalidatePath('/tools/time')
    revalidatePath(`/tools/time/${entregaId}`)
    return r.ok ? { ok: true, entregaId } : r
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao aprovar.' }
  }
}
