import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/core/db/client'
import { atLeast, papelFromClerkRole, type Role } from './roles'
import type { Tenant } from '@/core/db/generated/client'

// Sessão obrigatória — sem login, manda para o sign-in.
export async function requireUser() {
  const { userId, orgId, orgRole, sessionClaims } = await auth()
  if (!userId) redirect('/sign-in')
  return { clerkUserId: userId, orgId, orgRole, sessionClaims }
}

// Tenant da sessão (organização ativa do Clerk). Sem org → seleção de empresa.
export async function requireTenant(): Promise<Tenant> {
  const { orgId } = await requireUser()
  if (!orgId) redirect('/dashboard/selecionar-empresa')
  const tenant = await db.tenant.findUnique({ where: { clerkOrgId: orgId } })
  if (!tenant) redirect('/dashboard/selecionar-empresa')
  return tenant
}

// Papel do usuário no tenant atual, derivado do papel de organização do Clerk.
export async function currentRole(): Promise<Role> {
  const { orgRole } = await requireUser()
  if (await isSuperAdmin()) return 'SUPER_ADMIN'
  return papelFromClerkRole(orgRole ?? '')
}

export async function requireRole(minimo: Role): Promise<{ tenant: Tenant; role: Role }> {
  const tenant = await requireTenant()
  const role = await currentRole()
  if (!atLeast(role, minimo)) redirect('/dashboard')
  return { tenant, role }
}

// SUPER_ADMIN vem do publicMetadata do usuário no Clerk (README Fase 1).
export async function isSuperAdmin(): Promise<boolean> {
  const { sessionClaims } = await auth()
  const metadata = (sessionClaims?.metadata ?? {}) as { role?: string }
  return metadata.role === 'SUPER_ADMIN'
}

export async function requireSuperAdmin(): Promise<void> {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  if (!(await isSuperAdmin())) redirect('/dashboard')
}

// Guard da rota genérica de ferramentas: tenant + estado do módulo.
export async function requireModule(moduleId: string): Promise<{ tenant: Tenant; ativo: boolean }> {
  const tenant = await requireTenant()
  const tm = await db.tenantModule.findUnique({
    where: { tenantId_moduleId: { tenantId: tenant.id, moduleId } },
  })
  return { tenant, ativo: tm?.ativo ?? false }
}
