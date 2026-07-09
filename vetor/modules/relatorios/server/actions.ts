'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireTenantContext } from '@/core/tenant/context'
import { currentUserDb } from '@/core/auth/guards'
import { isModuleActive } from '@/core/tenant/modules'
import { criarRelatorio } from '../db'
import {
  parseNumeroBr,
  validarMes,
  type DadosEntradaRelatorio,
  type NumerosEntrada,
} from '../lib'
import { executarGeracaoRelatorio } from '../jobs/gerar-relatorio'

export type SolicitarRelatorioResult =
  | { ok: true; relatorioId: string }
  | { ok: false; erro: string }

function temTriggerConfigurado(): boolean {
  return Boolean(process.env.TRIGGER_SECRET_KEY)
}

async function enfileirarGeracao(tenantId: string, relatorioId: string): Promise<void> {
  if (temTriggerConfigurado()) {
    try {
      // Import dinâmico: evita exigir Trigger em build/dev sem conta.
      const { gerarRelatorioTask } = await import('../jobs/trigger-task')
      await gerarRelatorioTask.trigger({ tenantId, relatorioId })
      return
    } catch (err) {
      console.error('[relatorios] falha ao enfileirar no Trigger — fallback local', err)
    }
  }

  // Fallback: processa depois da resposta HTTP (Next.js after).
  after(async () => {
    try {
      await executarGeracaoRelatorio({ tenantId, relatorioId })
    } catch (err) {
      console.error('[relatorios] falha no job local', err)
    }
  })
}

export async function solicitarGeracaoRelatorio(
  formData: FormData,
): Promise<SolicitarRelatorioResult> {
  const tenant = await requireTenantContext()
  const ativo = await isModuleActive(tenant.id, 'relatorios')
  if (!ativo) {
    return { ok: false, erro: 'O módulo Relatórios não está ativo nesta empresa.' }
  }

  const mesRaw = String(formData.get('mes') ?? '').trim()
  const mesCheck = validarMes(mesRaw)
  if (!mesCheck.ok) return { ok: false, erro: mesCheck.erro }

  const numeros: NumerosEntrada = {
    faturamento: parseNumeroBr(String(formData.get('faturamento') ?? '')),
    investimentoAds: parseNumeroBr(String(formData.get('investimentoAds') ?? '')),
    leads: parseNumeroBr(String(formData.get('leads') ?? '')),
    clientesNovos: parseNumeroBr(String(formData.get('clientesNovos') ?? '')),
    ticketMedio: parseNumeroBr(String(formData.get('ticketMedio') ?? '')),
    observacoes: String(formData.get('observacoes') ?? '').trim() || null,
  }

  const temAlgumNumero = Object.entries(numeros).some(([k, v]) => {
    if (k === 'observacoes') return Boolean(v)
    return v !== null && v !== undefined
  })

  const csvFile = formData.get('csv')
  let csvTexto: string | null = null
  let csvNomeArquivo: string | null = null

  if (csvFile && typeof csvFile === 'object' && 'arrayBuffer' in csvFile) {
    const file = csvFile as File
    if (file.size > 0) {
      if (file.size > 2 * 1024 * 1024) {
        return { ok: false, erro: 'CSV grande demais (máx. 2 MB).' }
      }
      csvTexto = await file.text()
      csvNomeArquivo = file.name || 'export.csv'
    }
  }

  if (!temAlgumNumero && !csvTexto) {
    return {
      ok: false,
      erro: 'Informe ao menos um número do mês ou envie o CSV exportado dos anúncios.',
    }
  }

  const user = await currentUserDb()
  const criadoPorId = user?.id ?? null

  const dadosEntrada = {
    numeros,
    csvTexto,
    csvNomeArquivo,
  } satisfies DadosEntradaRelatorio

  const relatorio = await criarRelatorio(tenant.id, {
    mes: mesCheck.mes,
    dadosEntrada: JSON.parse(JSON.stringify(dadosEntrada)),
    criadoPorId,
  })

  await enfileirarGeracao(tenant.id, relatorio.id)

  revalidatePath('/tools/relatorios')
  return { ok: true, relatorioId: relatorio.id }
}

/** Re-tenta um relatório que falhou. */
export async function reprocessarRelatorio(relatorioId: string): Promise<SolicitarRelatorioResult> {
  const tenant = await requireTenantContext()
  const ativo = await isModuleActive(tenant.id, 'relatorios')
  if (!ativo) {
    return { ok: false, erro: 'O módulo Relatórios não está ativo nesta empresa.' }
  }

  const { tenantDb } = await import('@/core/db/client')
  const tdb = tenantDb(tenant.id)
  const existente = await tdb.relatorioGerado.findFirst({ where: { id: relatorioId } })
  if (!existente) return { ok: false, erro: 'Relatório não encontrado.' }
  if (existente.status === 'processando') {
    return { ok: false, erro: 'Este relatório ainda está sendo gerado.' }
  }

  await tdb.relatorioGerado.update({
    where: { id: relatorioId },
    data: { status: 'processando', erro: null },
  })

  await enfileirarGeracao(tenant.id, relatorioId)
  revalidatePath('/tools/relatorios')
  revalidatePath(`/tools/relatorios/${relatorioId}`)
  return { ok: true, relatorioId }
}
