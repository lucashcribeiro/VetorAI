'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/core/auth/guards'
import { dossieDeFormData, salvarNovaVersaoDossie } from '@/core/tenant/dossie'
import { db } from '@/core/db/client'

export type DossieResult = { ok: true; versao: number } | { ok: false; erro: string }

export async function salvarDossieAction(
  _prev: DossieResult | null,
  formData: FormData,
): Promise<DossieResult> {
  try {
    const { tenant, role } = await requireRole('OWNER')
    // MEMBER não edita dossiê (contexto de marca)
    if (role === 'MEMBER') {
      return { ok: false, erro: 'Só o dono ou a VETOR pode editar o dossiê.' }
    }

    const conteudo = dossieDeFormData(formData)
    if (!conteudo.resumo && !conteudo.oferta && !conteudo.tomDeVoz) {
      return {
        ok: false,
        erro: 'Preencha ao menos o resumo, a oferta ou o tom de voz.',
      }
    }

    const { versao } = await salvarNovaVersaoDossie(tenant.id, conteudo)

    await db.activityLog.create({
      data: {
        tenantId: tenant.id,
        acao: 'dossie.atualizado',
        detalhe: { versao },
      },
    })

    revalidatePath('/configuracoes/dossie')
    revalidatePath('/tools/conteudo')
    revalidatePath('/tools/relatorios')
    return { ok: true, versao }
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao salvar.' }
  }
}
