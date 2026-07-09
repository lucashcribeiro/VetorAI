import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/core/db/client'
import type { Tenant } from '@/core/db/generated/client'

// Tenant da sessão atual = organização ativa do Clerk mapeada em `tenants`.

export async function currentTenant(): Promise<Tenant | null> {
  const { orgId } = await auth()
  if (!orgId) return null
  return db.tenant.findUnique({ where: { clerkOrgId: orgId } })
}

export async function requireTenantContext(): Promise<Tenant> {
  const { userId, orgId } = await auth()
  if (!userId) redirect('/sign-in')
  if (!orgId) redirect('/selecionar-empresa')
  const tenant = await db.tenant.findUnique({ where: { clerkOrgId: orgId } })
  if (!tenant) redirect('/selecionar-empresa')
  return tenant
}
