import 'server-only'
import { tenantDb, type TenantDb } from '@/core/db/client'
import type { RelatorioGerado, Prisma } from '@/core/db/generated/client'

// Queries só das tabelas relatorios_* (ADR-001).

export type StatusRelatorio = 'processando' | 'pronto' | 'erro'

export async function listarRelatorios(
  tenantId: string,
  dbc: TenantDb = tenantDb(tenantId),
): Promise<RelatorioGerado[]> {
  return dbc.relatorioGerado.findMany({
    orderBy: [{ mes: 'desc' }, { criadoEm: 'desc' }],
  })
}

export async function buscarRelatorio(
  tenantId: string,
  id: string,
  dbc: TenantDb = tenantDb(tenantId),
): Promise<RelatorioGerado | null> {
  return dbc.relatorioGerado.findFirst({ where: { id } })
}

export async function criarRelatorio(
  tenantId: string,
  data: {
    mes: string
    dadosEntrada: Prisma.InputJsonValue
    criadoPorId?: string | null
  },
  dbc: TenantDb = tenantDb(tenantId),
): Promise<RelatorioGerado> {
  return dbc.relatorioGerado.create({
    data: {
      tenantId,
      mes: data.mes,
      status: 'processando',
      dadosEntrada: data.dadosEntrada,
      criadoPorId: data.criadoPorId ?? null,
    },
  })
}

export async function marcarPronto(
  tenantId: string,
  id: string,
  data: { conteudoHtml: string; resumo: string; arquivoUrl?: string | null },
  dbc: TenantDb = tenantDb(tenantId),
): Promise<RelatorioGerado> {
  return dbc.relatorioGerado.update({
    where: { id },
    data: {
      status: 'pronto',
      conteudoHtml: data.conteudoHtml,
      resumo: data.resumo,
      arquivoUrl: data.arquivoUrl ?? null,
      erro: null,
    },
  })
}

export async function marcarErro(
  tenantId: string,
  id: string,
  erro: string,
  dbc: TenantDb = tenantDb(tenantId),
): Promise<RelatorioGerado> {
  return dbc.relatorioGerado.update({
    where: { id },
    data: { status: 'erro', erro },
  })
}
