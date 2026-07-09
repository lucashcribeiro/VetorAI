'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/core/auth/guards'
import { db } from '@/core/db/client'

export type MarcaResult = { ok: true } | { ok: false; erro: string }

export async function salvarMarcaAction(
  _prev: MarcaResult | null,
  formData: FormData,
): Promise<MarcaResult> {
  try {
    const { tenant } = await requireRole('OWNER')
    const logoUrl = String(formData.get('logoUrl') ?? '').trim() || null
    const corPrimaria = String(formData.get('corPrimaria') ?? '').trim() || null

    if (corPrimaria && !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(corPrimaria)) {
      return { ok: false, erro: 'Cor inválida. Use hex, ex.: #E04A1F.' }
    }
    if (logoUrl && !/^https?:\/\//i.test(logoUrl)) {
      return { ok: false, erro: 'Logo precisa ser uma URL http(s).' }
    }

    await db.tenant.update({
      where: { id: tenant.id },
      data: { logoUrl, corPrimaria },
    })

    await db.activityLog.create({
      data: {
        tenantId: tenant.id,
        acao: 'tenant.marca_atualizada',
        detalhe: { logoUrl: !!logoUrl, corPrimaria },
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/configuracoes/marca')
    return { ok: true }
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao salvar.' }
  }
}
