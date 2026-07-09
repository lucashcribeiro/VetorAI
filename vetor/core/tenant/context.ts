import 'server-only'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/core/db/client'
import { getActiveTenantIdFromCookie } from '@/core/auth/tenant-cookie'
import type { Tenant } from '@/core/db/generated/client'

export async function currentTenant(): Promise<Tenant | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  const tenantId = await getActiveTenantIdFromCookie()
  if (!tenantId) return null
  return db.tenant.findUnique({ where: { id: tenantId } })
}

export async function requireTenantContext(): Promise<Tenant> {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const tenantId = await getActiveTenantIdFromCookie()
  if (!tenantId) redirect('/selecionar-empresa')

  const tenant = await db.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) redirect('/selecionar-empresa')

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user) redirect('/sign-in')

  if (user.role !== 'SUPER_ADMIN') {
    const membership = await db.membership.findUnique({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
    })
    if (!membership) redirect('/selecionar-empresa')
  }

  return tenant
}
