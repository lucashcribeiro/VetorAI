'use server'

import { revalidatePath } from 'next/cache'
import { requireTenantContext } from '@/core/tenant/context'
import { currentUserDb } from '@/core/auth/guards'
import { isModuleActive } from '@/core/tenant/modules'
import {
  atualizarStatusAlerta,
  executarAnaliseDiaria,
  processarImportCsv,
} from './service'

export type ActionResult =
  | { ok: true; linhas?: number; alertas?: number }
  | { ok: false; erro: string }

async function guard() {
  const tenant = await requireTenantContext()
  if (!(await isModuleActive(tenant.id, 'midia'))) {
    throw new Error('O módulo Anúncios não está ativo nesta empresa.')
  }
  return tenant
}

export async function importarCsvAction(formData: FormData): Promise<ActionResult> {
  try {
    const tenant = await guard()
    const user = await currentUserDb()
    const file = formData.get('csv')
    if (!file || typeof file !== 'object' || !('text' in file)) {
      return { ok: false, erro: 'Envie um arquivo CSV.' }
    }
    const f = file as File
    if (f.size === 0) return { ok: false, erro: 'Arquivo vazio.' }
    if (f.size > 3 * 1024 * 1024) return { ok: false, erro: 'CSV grande demais (máx. 3 MB).' }

    const csv = await f.text()
    const r = await processarImportCsv({
      tenantId: tenant.id,
      csv,
      userId: user?.id,
    })
    revalidatePath('/tools/anuncios')
    revalidatePath('/dashboard')
    return r
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro no import.' }
  }
}

export async function reanalisarAction(): Promise<ActionResult> {
  try {
    const tenant = await guard()
    const r = await executarAnaliseDiaria({ tenantId: tenant.id })
    revalidatePath('/tools/anuncios')
    revalidatePath('/dashboard')
    return r.ok ? { ok: true, alertas: r.alertas } : r
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro na análise.' }
  }
}

export async function resolverAlertaAction(
  alertaId: string,
  status: 'resolvido' | 'ignorado',
): Promise<ActionResult> {
  try {
    const tenant = await guard()
    const user = await currentUserDb()
    const r = await atualizarStatusAlerta({
      tenantId: tenant.id,
      alertaId,
      status,
      userId: user?.id,
    })
    revalidatePath('/tools/anuncios')
    revalidatePath('/dashboard')
    return r.ok ? { ok: true } : r
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao atualizar alerta.' }
  }
}
