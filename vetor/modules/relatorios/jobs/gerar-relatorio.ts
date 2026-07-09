import 'server-only'
import { db, tenantDb } from '@/core/db/client'
import { gerar } from '@/core/ai/anthropic'
import { publish } from '@/core/events/bus'
import {
  buscarRelatorio,
  marcarErro,
  marcarPronto,
} from '../db'
import { carregarSystemPrompt } from '../server/service'
import {
  extrairResumo,
  mesPorExtenso,
  montarPayloadPrompt,
  normalizarHtmlResposta,
  type DadosEntradaRelatorio,
} from '../lib'

export const MODULE_ID = 'relatorios'
export const EVENTO_RELATORIO_GERADO = 'relatorio.gerado'
export const PROMPT_VERSION = 'relatorio-mensal.v1'

export interface GerarRelatorioPayload {
  tenantId: string
  relatorioId: string
}

/**
 * Worker do relatório: lê a linha processando → Claude → HTML → evento + activity.
 * Pode ser chamado pelo Trigger.dev ou pelo fallback local (after()).
 */
export async function executarGeracaoRelatorio({
  tenantId,
  relatorioId,
}: GerarRelatorioPayload): Promise<{ ok: true; resumo: string } | { ok: false; erro: string }> {
  const tdb = tenantDb(tenantId)
  const relatorio = await buscarRelatorio(tenantId, relatorioId, tdb)

  if (!relatorio) {
    return { ok: false, erro: 'Relatório não encontrado.' }
  }
  if (relatorio.status === 'pronto' && relatorio.conteudoHtml) {
    return { ok: true, resumo: relatorio.resumo ?? 'já pronto' }
  }

  const tenant = await db.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) {
    await marcarErro(tenantId, relatorioId, 'Empresa não encontrada.', tdb)
    return { ok: false, erro: 'Empresa não encontrada.' }
  }

  const dossie = await tdb.dossie.findFirst({
    where: {},
    orderBy: { versao: 'desc' },
  })

  const dados = relatorio.dadosEntrada as unknown as DadosEntradaRelatorio
  const system = carregarSystemPrompt()
  const prompt = montarPayloadPrompt({
    negocio: { nome: tenant.nome, segmento: tenant.segmento },
    mes: relatorio.mes,
    dados,
    dossie: dossie?.conteudo ?? null,
  })

  try {
    const raw = await gerar({
      tenantId,
      moduleId: MODULE_ID,
      system,
      prompt,
      maxTokens: 12000,
    })

    const html = normalizarHtmlResposta(raw)
    const resumo = extrairResumo(html)
    const arquivoUrl = `/api/relatorios/${relatorioId}/download`

    await marcarPronto(
      tenantId,
      relatorioId,
      { conteudoHtml: html, resumo, arquivoUrl },
      tdb,
    )

    await publish(tenantId, EVENTO_RELATORIO_GERADO, {
      relatorioId,
      mes: relatorio.mes,
      mesLegivel: mesPorExtenso(relatorio.mes),
      promptVersion: PROMPT_VERSION,
    })

    await tdb.activityLog.create({
      data: {
        tenantId,
        userId: relatorio.criadoPorId,
        acao: 'relatorio.gerado',
        detalhe: {
          relatorioId,
          mes: relatorio.mes,
          promptVersion: PROMPT_VERSION,
        },
      },
    })

    return { ok: true, resumo }
  } catch (err) {
    const mensagem =
      err instanceof Error ? err.message : 'Falha desconhecida ao gerar o relatório.'
    // Mensagem amigável se a chave da Anthropic não está configurada.
    const amigavel =
      /api.?key|authentication|401|ANTHROPIC/i.test(mensagem)
        ? 'A geração por IA não está configurada (chave Anthropic ausente ou inválida). Avise a VETOR.'
        : mensagem.slice(0, 500)

    await marcarErro(tenantId, relatorioId, amigavel, tdb)

    await tdb.activityLog.create({
      data: {
        tenantId,
        userId: relatorio.criadoPorId,
        acao: 'relatorio.erro',
        detalhe: { relatorioId, mes: relatorio.mes, erro: amigavel },
      },
    })

    return { ok: false, erro: amigavel }
  }
}
