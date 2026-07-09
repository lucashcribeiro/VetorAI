'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/core/auth/guards'
import { setActiveTenantCookie } from '@/core/auth/tenant-cookie'
import { db } from '@/core/db/client'

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
