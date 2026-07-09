'use server'

import { revalidatePath } from 'next/cache'
import { requireTenantContext } from '@/core/tenant/context'
import { currentUserDb } from '@/core/auth/guards'
import { isModuleActive } from '@/core/tenant/modules'
import { segundaDaSemana } from '../lib'
import {
  aprovarPosts,
  executarGeracaoCalendario,
  exportarAprovados,
  rejeitarPost,
} from './service'

export type ActionResult =
  | { ok: true; qtd?: number; texto?: string }
  | { ok: false; erro: string }

async function guard() {
  const tenant = await requireTenantContext()
  if (!(await isModuleActive(tenant.id, 'conteudo'))) {
    throw new Error('O módulo Conteúdo não está ativo nesta empresa.')
  }
  return tenant
}

export async function gerarCalendarioAction(formData: FormData): Promise<ActionResult> {
  try {
    const tenant = await guard()
    const user = await currentUserDb()
    const semana =
      String(formData.get('semanaInicio') ?? '').trim() || segundaDaSemana()

    const resultado = await executarGeracaoCalendario({
      tenantId: tenant.id,
      semanaInicio: semana,
      userId: user?.id,
    })

    revalidatePath('/tools/conteudo')
    return resultado
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao gerar.' }
  }
}

export async function aprovarSelecionadosAction(formData: FormData): Promise<ActionResult> {
  try {
    const tenant = await guard()
    const user = await currentUserDb()
    const raw = String(formData.get('postIds') ?? '')
    const postIds = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const r = await aprovarPosts({
      tenantId: tenant.id,
      postIds,
      userId: user?.id,
    })
    revalidatePath('/tools/conteudo')
    return r
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao aprovar.' }
  }
}

export async function aprovarUmAction(postId: string): Promise<ActionResult> {
  try {
    const tenant = await guard()
    const user = await currentUserDb()
    const r = await aprovarPosts({
      tenantId: tenant.id,
      postIds: [postId],
      userId: user?.id,
    })
    revalidatePath('/tools/conteudo')
    return r
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao aprovar.' }
  }
}

export async function rejeitarAction(postId: string): Promise<ActionResult> {
  try {
    const tenant = await guard()
    const user = await currentUserDb()
    const r = await rejeitarPost({
      tenantId: tenant.id,
      postId,
      userId: user?.id,
    })
    revalidatePath('/tools/conteudo')
    return r.ok ? { ok: true } : r
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao rejeitar.' }
  }
}

export async function exportarAction(semanaInicio?: string): Promise<ActionResult> {
  try {
    const tenant = await guard()
    const user = await currentUserDb()
    const r = await exportarAprovados({
      tenantId: tenant.id,
      semanaInicio: semanaInicio || undefined,
      userId: user?.id,
    })
    revalidatePath('/tools/conteudo')
    return r
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao exportar.' }
  }
}

