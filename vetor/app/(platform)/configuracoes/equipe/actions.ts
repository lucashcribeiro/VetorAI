'use server'

import { hash } from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/core/auth/guards'
import { db } from '@/core/db/client'

export type EquipeResult = { ok: true } | { ok: false; erro: string }

/** Convida (ou associa) um membro ao tenant ativo. OWNER+. */
export async function convidarMembro(
  _prev: EquipeResult | null,
  formData: FormData,
): Promise<EquipeResult> {
  const { tenant } = await requireRole('OWNER')

  const nome = String(formData.get('nome') ?? '').trim()
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const papel = String(formData.get('papel') ?? 'MEMBER') === 'OWNER' ? 'OWNER' : 'MEMBER'
  const senhaTemp = String(formData.get('senhaTemp') ?? '').trim()

  if (!email) return { ok: false, erro: 'Informe o e-mail.' }

  let user = await db.user.findUnique({ where: { email } })
  if (!user) {
    if (!nome || senhaTemp.length < 8) {
      return {
        ok: false,
        erro: 'Usuário novo: informe nome e senha temporária (mín. 8).',
      }
    }
    user = await db.user.create({
      data: {
        email,
        nome,
        passwordHash: await hash(senhaTemp, 12),
        role: 'MEMBER',
      },
    })
  }

  await db.membership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
    update: { papel },
    create: { tenantId: tenant.id, userId: user.id, papel },
  })

  await db.activityLog.create({
    data: {
      tenantId: tenant.id,
      acao: 'equipe.membro_adicionado',
      detalhe: { userId: user.id, email, papel },
    },
  })

  revalidatePath('/configuracoes/equipe')
  return { ok: true }
}

export async function removerMembro(userId: string): Promise<EquipeResult> {
  const { tenant } = await requireRole('OWNER')

  await db.membership.deleteMany({
    where: { tenantId: tenant.id, userId },
  })

  await db.activityLog.create({
    data: {
      tenantId: tenant.id,
      acao: 'equipe.membro_removido',
      detalhe: { userId },
    },
  })

  revalidatePath('/configuracoes/equipe')
  return { ok: true }
}
