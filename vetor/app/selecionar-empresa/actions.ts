'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/core/auth/guards'
import { setActiveTenantCookie } from '@/core/auth/tenant-cookie'
import { db } from '@/core/db/client'
import {
  MODULOS_ONBOARDING,
  slugUnico,
  slugifyEmpresa,
} from '@/core/tenant/onboarding'

export type OnboardingResult = { ok: true } | { ok: false; erro: string }

export async function escolherEmpresa(tenantId: string) {
  const user = await requireUser()

  if (user.role !== 'SUPER_ADMIN') {
    const m = await db.membership.findUnique({
      where: { tenantId_userId: { tenantId, userId: user.id } },
    })
    if (!m) throw new Error('Sem acesso a esta empresa.')
  } else {
    const t = await db.tenant.findUnique({ where: { id: tenantId } })
    if (!t) throw new Error('Empresa não encontrada.')
  }

  await setActiveTenantCookie(tenantId)
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

/**
 * Self-service (Fase 7): cria empresa, dono vira OWNER, ativa módulos essenciais
 * e manda pro dashboard com checklist de primeiro valor.
 */
export async function criarMinhaEmpresa(
  _prev: OnboardingResult | null,
  formData: FormData,
): Promise<OnboardingResult> {
  const user = await requireUser()

  const nome = String(formData.get('nome') ?? '').trim()
  const segmento = String(formData.get('segmento') ?? '').trim() || null
  if (!nome || nome.length < 2) {
    return { ok: false, erro: 'Informe o nome da empresa.' }
  }

  const base = slugifyEmpresa(String(formData.get('slug') ?? '') || nome)
  const slug = await slugUnico(base)

  try {
    const tenant = await db.tenant.create({
      data: {
        nome,
        slug,
        segmento,
        plano: 'essencial',
        status: 'ativo',
      },
    })

    await db.membership.create({
      data: { tenantId: tenant.id, userId: user.id, papel: 'OWNER' },
    })

    for (const moduleId of MODULOS_ONBOARDING) {
      await db.tenantModule.upsert({
        where: { tenantId_moduleId: { tenantId: tenant.id, moduleId } },
        update: { ativo: true },
        create: { tenantId: tenant.id, moduleId, ativo: true },
      })
    }

    await db.activityLog.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        acao: 'tenant.onboarding_self_service',
        detalhe: { modulos: [...MODULOS_ONBOARDING], origem: 'selecionar-empresa' },
      },
    })

    await setActiveTenantCookie(tenant.id)
    revalidatePath('/dashboard')
    redirect('/dashboard?bemvindo=1')
  } catch (e) {
    // redirect() do Next lança; só engole erros reais
    if (e && typeof e === 'object' && 'digest' in e) throw e
    console.error('[onboarding]', e)
    return { ok: false, erro: 'Não foi possível criar a empresa. Tente de novo.' }
  }
}
