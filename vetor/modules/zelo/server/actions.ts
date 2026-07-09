'use server'

import { revalidatePath } from 'next/cache'
import { requireTenantContext } from '@/core/tenant/context'
import { currentUserDb } from '@/core/auth/guards'
import { isModuleActive } from '@/core/tenant/modules'
import {
  aprovarEEnviar,
  escalarConversa,
  processarMensagemEntrada,
  regenerarSugestao,
} from './service'

async function guardZelo() {
  const tenant = await requireTenantContext()
  const ativo = await isModuleActive(tenant.id, 'zelo')
  if (!ativo) throw new Error('O Zelo não está ativo nesta empresa.')
  return tenant
}

async function currentUserDbId(): Promise<string | null> {
  const u = await currentUserDb()
  return u?.id ?? null
}

export type ActionResult = { ok: true } | { ok: false; erro: string }

export async function aprovarRespostaAction(formData: FormData): Promise<ActionResult> {
  try {
    const tenant = await guardZelo()
    const conversaId = String(formData.get('conversaId') ?? '')
    const texto = String(formData.get('texto') ?? '')
    const sugestaoId = String(formData.get('sugestaoId') ?? '') || null
    const userId = await currentUserDbId()

    const result = await aprovarEEnviar({
      tenantId: tenant.id,
      conversaId,
      texto,
      sugestaoId,
      userId,
    })
    revalidatePath('/tools/zelo')
    revalidatePath(`/tools/zelo/${conversaId}`)
    return result
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao aprovar.' }
  }
}

export async function escalarAction(formData: FormData): Promise<ActionResult> {
  try {
    const tenant = await guardZelo()
    const conversaId = String(formData.get('conversaId') ?? '')
    const motivo = String(formData.get('motivo') ?? '') || null
    const userId = await currentUserDbId()

    const result = await escalarConversa({
      tenantId: tenant.id,
      conversaId,
      userId,
      motivo,
    })
    revalidatePath('/tools/zelo')
    revalidatePath(`/tools/zelo/${conversaId}`)
    return result
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao escalar.' }
  }
}

export async function regenerarSugestaoAction(conversaId: string): Promise<ActionResult> {
  try {
    const tenant = await guardZelo()
    const result = await regenerarSugestao({ tenantId: tenant.id, conversaId })
    revalidatePath(`/tools/zelo/${conversaId}`)
    if (!result.ok) return result
    return { ok: true }
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao regenerar.' }
  }
}

/**
 * Simula mensagem de entrada (dev/demo sem Meta).
 * Útil para validar a fila assistida antes do número oficial.
 */
export async function simularMensagemEntrada(formData: FormData): Promise<
  ActionResult & { conversaId?: string }
> {
  try {
    const tenant = await guardZelo()
    const waId = String(formData.get('waId') ?? '5511999990000')
    const nome = String(formData.get('nome') ?? '') || null
    const corpo = String(formData.get('corpo') ?? '').trim()
    if (!corpo) return { ok: false, erro: 'Digite a mensagem do contato.' }

    const r = await processarMensagemEntrada({
      tenantId: tenant.id,
      waId,
      nomeContato: nome,
      corpo,
      waMessageId: `sim_in_${Date.now()}`,
    })

    revalidatePath('/tools/zelo')
    revalidatePath(`/tools/zelo/${r.conversaId}`)
    return { ok: true, conversaId: r.conversaId }
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro na simulação.' }
  }
}
