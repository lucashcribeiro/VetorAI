'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { requireTenantContext } from '@/core/tenant/context'
import { db } from '@/core/db/client'
import { publish } from '@/core/events/bus'

// "Tenho interesse" / "Solicitar ativação": valida demanda e me notifica
// via evento — sem ativar nada sozinho (quem liga módulo é o admin).
export async function registrarInteresse(moduleId: string) {
  const tenant = await requireTenantContext()
  const { userId: clerkUserId } = await auth()

  const user = clerkUserId
    ? await db.user.findUnique({ where: { clerkId: clerkUserId } })
    : null

  await db.activityLog.create({
    data: {
      tenantId: tenant.id,
      userId: user?.id ?? null,
      acao: 'modulo.interesse',
      detalhe: { moduleId, clerkUserId },
    },
  })
  await publish(tenant.id, 'modulo.interesse', { moduleId })

  revalidatePath('/dashboard')
}
