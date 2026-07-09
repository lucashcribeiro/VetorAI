'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireTenantContext } from '@/core/tenant/context'
import { currentUserDb } from '@/core/auth/guards'
import { isModuleActive } from '@/core/tenant/modules'
import { executarPipelineRodada, iniciarRodada } from './service'

export type ActionResult =
  | { ok: true; rodadaId?: string }
  | { ok: false; erro: string }

async function guard() {
  const tenant = await requireTenantContext()
  if (!(await isModuleActive(tenant.id, 'time'))) {
    throw new Error('O módulo Time VETOR não está ativo nesta empresa.')
  }
  return tenant
}

/** Inicia pipeline completa: Órbita → Atlas → Lumen → Mídia → Prisma(QA). */
export async function iniciarPipelineAction(formData: FormData): Promise<ActionResult> {
  try {
    const tenant = await guard()
    const user = await currentUserDb()
    const brief = String(formData.get('brief') ?? '')

    const r = await iniciarRodada({
      tenantId: tenant.id,
      brief,
      userId: user?.id,
    })
    if (!r.ok) return r

    const rodadaId = r.rodadaId
    const tenantId = tenant.id

    // Processa em background para não estourar timeout da request.
    after(async () => {
      try {
        await executarPipelineRodada({ tenantId, rodadaId })
      } catch (err) {
        console.error('[time] pipeline falhou', err)
      }
    })

    revalidatePath('/tools/time')
    revalidatePath(`/tools/time/rodada/${rodadaId}`)
    return { ok: true, rodadaId }
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao iniciar o time.' }
  }
}
