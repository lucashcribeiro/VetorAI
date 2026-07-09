import 'dotenv/config'
import { PrismaClient } from '../core/db/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Tenants de teste: os dois clientes-piloto. Idempotente (upsert por slug).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  const pilotos = [
    {
      nome: 'Dra. Mirilaini',
      slug: 'dra-mirilaini',
      segmento: 'odontologia · sp',
      modulos: ['conteudo', 'relatorios'],
    },
    {
      nome: 'Milu Seguros',
      slug: 'milu-seguros',
      segmento: 'seguros · sp',
      modulos: ['relatorios'],
    },
  ]

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
