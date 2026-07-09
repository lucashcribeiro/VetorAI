import { PrismaClient } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { scopeArgs } from './tenant-filter'

// Client cru — uso do core e do admin (visão cross-tenant de saúde, ADR-004).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function criarClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma ?? criarClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Client com tenant_id injetado automaticamente em toda query (ADR-003).
// Todo código de módulo acessa o banco por aqui.
export function tenantDb(tenantId: string) {
  return db.$extends({
    query: {
      $allModels: {
        $allOperations({ model, operation, args, query }) {
          return query(
            scopeArgs(model, operation, args as Record<string, unknown>, tenantId),
          )
        },
      },
    },
  })
}

export type TenantDb = ReturnType<typeof tenantDb>
