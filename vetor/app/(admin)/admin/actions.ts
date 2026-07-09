'use server'

import { revalidatePath } from 'next/cache'
import { requireSuperAdmin } from '@/core/auth/guards'
import { db } from '@/core/db/client'

function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Provisionar empresa só no banco (sem SaaS de auth). */
export async function criarTenant(formData: FormData) {
  await requireSuperAdmin()

  const nome = String(formData.get('nome') ?? '').trim()
  const segmento = String(formData.get('segmento') ?? '').trim() || null
  if (!nome) return

  const slug = slugify(String(formData.get('slug') ?? '') || nome)

  const tenant = await db.tenant.create({
    data: { nome, slug, segmento },
  })

  await db.activityLog.create({
    data: {
      tenantId: tenant.id,
      acao: 'tenant.provisionado',
      detalhe: { origem: 'admin' },
    },
  })

  revalidatePath('/admin/tenants')
}

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
