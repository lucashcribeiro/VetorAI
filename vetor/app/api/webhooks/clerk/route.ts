import { verifyWebhook } from '@clerk/nextjs/webhooks'
import type { NextRequest } from 'next/server'
import { db } from '@/core/db/client'
import { papelFromClerkRole } from '@/core/auth/roles'

// Sincroniza Clerk → banco (Fase 1): usuários, organizações (tenants) e
// memberships. O Clerk é a fonte de verdade de auth; o banco, do domínio.

export async function POST(req: NextRequest) {
  let evt
  try {
    evt = await verifyWebhook(req)
  } catch {
    return new Response('assinatura inválida', { status: 400 })
  }

  const { type, data } = evt

  try {
    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const email =
          data.email_addresses?.find((e) => e.id === data.primary_email_address_id)
            ?.email_address ?? data.email_addresses?.[0]?.email_address
        if (!email) break
        const nome = [data.first_name, data.last_name].filter(Boolean).join(' ') || email
        await db.user.upsert({
          where: { clerkId: data.id },
          update: { email, nome },
          create: { clerkId: data.id, email, nome },
        })
        break
      }

      case 'organization.created':
      case 'organization.updated': {
        const slug = data.slug ?? data.id
        await db.tenant.upsert({
          where: { clerkOrgId: data.id },
          update: { nome: data.name, slug },
          create: { nome: data.name, slug, clerkOrgId: data.id },
        })
        break
      }

      case 'organizationMembership.created':
      case 'organizationMembership.updated': {
        const tenant = await db.tenant.findUnique({
          where: { clerkOrgId: data.organization.id },
        })
        const user = await db.user.findUnique({
          where: { clerkId: data.public_user_data?.user_id ?? '' },
        })
        if (!tenant || !user) break
        await db.membership.upsert({
          where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
          update: { papel: papelFromClerkRole(data.role) },
          create: { tenantId: tenant.id, userId: user.id, papel: papelFromClerkRole(data.role) },
        })
        break
      }

      case 'organizationMembership.deleted': {
        const tenant = await db.tenant.findUnique({
          where: { clerkOrgId: data.organization.id },
        })
        const user = await db.user.findUnique({
          where: { clerkId: data.public_user_data?.user_id ?? '' },
        })
        if (!tenant || !user) break
        await db.membership.deleteMany({
          where: { tenantId: tenant.id, userId: user.id },
        })
        break
      }
    }
  } catch (erro) {
    console.error('[webhook clerk] falha ao sincronizar', type, erro)
    return new Response('erro ao processar', { status: 500 })
  }

  return new Response('ok', { status: 200 })
}
