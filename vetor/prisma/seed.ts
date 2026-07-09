import 'dotenv/config'
import { hash } from 'bcryptjs'
import { PrismaClient } from '../core/db/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Tenants de teste + usuário admin local (Auth.js).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@vetor.local'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'vetor-admin-2026'

async function main() {
  const pilotos = [
    {
      nome: 'Dra. Mirilaini',
      slug: 'dra-mirilaini',
      segmento: 'odontologia · sp',
      modulos: ['conteudo', 'relatorios', 'zelo', 'midia', 'time'],
    },
    {
      nome: 'Milu Seguros',
      slug: 'milu-seguros',
      segmento: 'seguros · sp',
      modulos: ['relatorios', 'zelo', 'midia', 'time'],
    },
  ]

  const admin = await db.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      nome: 'Admin VETOR',
      role: 'SUPER_ADMIN',
      passwordHash: await hash(ADMIN_PASSWORD, 12),
    },
    create: {
      email: ADMIN_EMAIL,
      nome: 'Admin VETOR',
      role: 'SUPER_ADMIN',
      passwordHash: await hash(ADMIN_PASSWORD, 12),
    },
  })
  console.log(`✔ admin ${admin.email} (senha: SEED_ADMIN_PASSWORD ou padrão do seed)`)

  for (const p of pilotos) {
    const tenant = await db.tenant.upsert({
      where: { slug: p.slug },
      update: { nome: p.nome, segmento: p.segmento },
      create: { nome: p.nome, slug: p.slug, segmento: p.segmento },
    })

    for (const moduleId of p.modulos) {
      await db.tenantModule.upsert({
        where: { tenantId_moduleId: { tenantId: tenant.id, moduleId } },
        update: { ativo: true },
        create: { tenantId: tenant.id, moduleId, ativo: true },
      })
    }

    await db.membership.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: admin.id } },
      update: { papel: 'OWNER' },
      create: { tenantId: tenant.id, userId: admin.id, papel: 'OWNER' },
    })

    await db.activityLog.create({
      data: {
        tenantId: tenant.id,
        acao: 'tenant.provisionado',
        detalhe: { origem: 'seed', modulos: p.modulos },
      },
    })

    console.log(`✔ ${p.nome} (${p.slug}) — módulos: ${p.modulos.join(', ')}`)
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
