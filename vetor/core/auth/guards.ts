import 'server-only'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/core/db/client'
import { atLeast, asRole, type Role } from './roles'
import { getActiveTenantIdFromCookie } from './tenant-cookie'
import type { Tenant, User } from '@/core/db/generated/client'

export async function requireUser(): Promise<User> {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')
  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user) redirect('/sign-in')
  return user
}

export async function currentUserDb(): Promise<User | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return db.user.findUnique({ where: { id: session.user.id } })
}

/** Tenant ativo: cookie vetor_tenant + membership (ou SUPER_ADMIN). */
export async function requireTenant(): Promise<Tenant> {
  const user = await requireUser()
  const tenantId = await getActiveTenantIdFromCookie()
  if (!tenantId) redirect('/selecionar-empresa')

  const tenant = await db.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) redirect('/selecionar-empresa')

  if (user.role === 'SUPER_ADMIN') return tenant

  const membership = await db.membership.findUnique({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
  })
  if (!membership) redirect('/selecionar-empresa')
  return tenant
}

export async function currentRole(): Promise<Role> {
  const user = await requireUser()
  if (user.role === 'SUPER_ADMIN') return 'SUPER_ADMIN'

  const tenantId = await getActiveTenantIdFromCookie()
  if (!tenantId) return 'MEMBER'

  const membership = await db.membership.findUnique({
    where: { tenantId_userId: { tenantId, userId: user.id } },
  })
  return asRole(membership?.papel)
}

export async function requireRole(minimo: Role): Promise<{ tenant: Tenant; role: Role }> {
  const tenant = await requireTenant()
  const role = await currentRole()
  if (!atLeast(role, minimo)) redirect('/dashboard')
  return { tenant, role }
}

export async function isSuperAdmin(): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.id) return false
  if (session.user.role === 'SUPER_ADMIN') return true
  const user = await db.user.findUnique({ where: { id: session.user.id } })
  return user?.role === 'SUPER_ADMIN'
}

export async function requireSuperAdmin(): Promise<User> {
  const user = await requireUser()
  if (user.role !== 'SUPER_ADMIN') redirect('/dashboard')
  return user
}

export async function requireModule(
  moduleId: string,
): Promise<{ tenant: Tenant; ativo: boolean }> {
  const tenant = await requireTenant()
  const tm = await db.tenantModule.findUnique({
    where: { tenantId_moduleId: { tenantId: tenant.id, moduleId } },
  })
  return { tenant, ativo: tm?.ativo ?? false }
}
