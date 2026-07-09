'use server'

import { revalidatePath } from 'next/cache'
import { clerkClient } from '@clerk/nextjs/server'
import { requireSuperAdmin } from '@/core/auth/guards'
import { db } from '@/core/db/client'

function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Provisionar empresa: cria a organização no Clerk (quando configurado)
// e o tenant no banco. Sem Clerk real, cria só no banco — o vínculo
// clerk_org_id chega depois via webhook ou edição.
export async function criarTenant(formData: FormData) {
  await requireSuperAdmin()

  const nome = String(formData.get('nome') ?? '').trim()
  const segmento = String(formData.get('segmento') ?? '').trim() || null
  if (!nome) return

  const slug = slugify(String(formData.get('slug') ?? '') || nome)

  let clerkOrgId: string | null = null
  try {
    const clerk = await clerkClient()
    const org = await clerk.organizations.createOrganization({ name: nome, slug })
    clerkOrgId = org.id
  } catch (erro) {
    console.warn('[admin] clerk indisponível — tenant criado só no banco', erro)
  }

  const tenant = await db.tenant.create({
    data: { nome, slug, segmento, clerkOrgId },
  })

  await db.activityLog.create({
    data: {
      tenantId: tenant.id,
      acao: 'tenant.provisionado',
      detalhe: { origem: 'admin', clerkOrgId },
    },
  })

  revalidatePath('/admin/tenants')
}

// Liga/desliga módulo por tenant (feature flag em tenant_modules).
export async function alternarModulo(tenantId: string, moduleId: string, ativo: boolean) {
  await requireSuperAdmin()

  await db.tenantModule.upsert({
    where: { tenantId_moduleId: { tenantId, moduleId } },
    update: { ativo },
    create: { tenantId, moduleId, ativo },
  })

  await db.activityLog.create({
    data: {
      tenantId,
      acao: ativo ? 'modulo.ativado' : 'modulo.desativado',
      detalhe: { moduleId, origem: 'admin' },
    },
  })

  revalidatePath(`/admin/tenants/${tenantId}`)
  revalidatePath('/admin/tenants')
}
