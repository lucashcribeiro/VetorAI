'use server'

import { revalidatePath } from 'next/cache'
import { requireTenantContext } from '@/core/tenant/context'
import { currentUserDb } from '@/core/auth/guards'
import { db } from '@/core/db/client'
import { publish } from '@/core/events/bus'

// "Tenho interesse" / "Solicitar ativação": valida demanda e registra no activity.
export async function registrarInteresse(moduleId: string) {
  const tenant = await requireTenantContext()
  const user = await currentUserDb()

  await db.activityLog.create({
    data: {
      tenantId: tenant.id,
      userId: user?.id ?? null,
      acao: 'modulo.interesse',
      detalhe: { moduleId },
    },
  })
  await publish(tenant.id, 'modulo.interesse', { moduleId })

  revalidatePath('/dashboard')
}
