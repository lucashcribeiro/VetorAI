import 'server-only'
import { tenantDb } from '@/core/db/client'
import type { Prisma } from '@/core/db/generated/client'

/** Campos do dossiê em língua de dono (Fase pós-beta). */
export interface DossieConteudo {
  resumo?: string
  tomDeVoz?: string
  publico?: string
  oferta?: string
  diferenciais?: string
  horario?: string
  endereco?: string
  observacoes?: string
}

export async function obterDossieAtual(
  tenantId: string,
): Promise<{ versao: number; conteudo: DossieConteudo } | null> {
  const tdb = tenantDb(tenantId)
  const row = await tdb.dossie.findFirst({ orderBy: { versao: 'desc' } })
  if (!row) return null
  return {
    versao: row.versao,
    conteudo: (row.conteudo ?? {}) as DossieConteudo,
  }
}

/** Nova versão (não sobrescreve histórico). */
export async function salvarNovaVersaoDossie(
  tenantId: string,
  conteudo: DossieConteudo,
): Promise<{ versao: number }> {
  const tdb = tenantDb(tenantId)
  const ultimo = await tdb.dossie.findFirst({ orderBy: { versao: 'desc' } })
  const versao = (ultimo?.versao ?? 0) + 1
  await tdb.dossie.create({
    data: {
      tenantId,
      versao,
      conteudo: conteudo as Prisma.InputJsonValue,
    },
  })
  return { versao }
}

export function dossieDeFormData(formData: FormData): DossieConteudo {
  const get = (k: string) => String(formData.get(k) ?? '').trim() || undefined
  return {
    resumo: get('resumo'),
    tomDeVoz: get('tomDeVoz'),
    publico: get('publico'),
    oferta: get('oferta'),
    diferenciais: get('diferenciais'),
    horario: get('horario'),
    endereco: get('endereco'),
    observacoes: get('observacoes'),
  }
}
