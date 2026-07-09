import 'server-only'
import { readFileSync } from 'fs'
import { join } from 'path'
import { db, tenantDb } from '@/core/db/client'
import { gerar } from '@/core/ai/anthropic'
import { publish } from '@/core/events/bus'
import {
  AGENTES,
  getAgente,
  MAX_TENTATIVAS_QA,
  PIPELINE,
  type AgenteId,
} from '../agents'
import {
  appendLog,
  montarYamlCabecalho,
  normalizarMarkdown,
  parseResultadoQa,
  type LogEtapa,
} from '../lib'

export const MODULE_ID = 'time'
export const EVENTO_RODADA = 'time.rodada_atualizada'
export const EVENTO_ENTREGA = 'time.entrega_gerada'

function carregarPrompt(arquivo: string): string {
  return readFileSync(join(process.cwd(), 'modules/time/prompts', arquivo), 'utf8')
}

async function gerarEntregaAgente(input: {
  tenantId: string
  rodadaId: string
  agenteId: AgenteId
  brief: string
  feedbackQa?: string
  userId?: string | null
}): Promise<{ ok: true; entregaId: string; conteudo: string } | { ok: false; erro: string }> {
  const def = getAgente(input.agenteId)
  if (!def) return { ok: false, erro: 'Agente desconhecido.' }

  const tdb = tenantDb(input.tenantId)
  const tenant = await db.tenant.findUnique({ where: { id: input.tenantId } })
  if (!tenant) return { ok: false, erro: 'Empresa não encontrada.' }

  const dossie = await tdb.dossie.findFirst({ orderBy: { versao: 'desc' } })
  const entregasRodada = await tdb.timeEntrega.findMany({
    where: { rodadaId: input.rodadaId, status: { in: ['aprovado', 'rascunho'] } },
    orderBy: { criadoEm: 'asc' },
  })

  // Insumos: últimas versões por agente (exceto o atual em retrabalho)
  const porAgente = new Map<string, (typeof entregasRodada)[0]>()
  for (const e of entregasRodada) {
    if (e.agente === input.agenteId) continue
    porAgente.set(e.agente, e)
  }

  const run = await db.agentRun.create({
    data: {
      tenantId: input.tenantId,
      agente: `time:${def.id}`,
      status: 'rodando',
    },
  })

  const hoje = new Date().toISOString().slice(0, 10)
  const tipo = def.tipoPadrao
  const system = carregarPrompt(def.promptFile)

  const userPrompt = [
    `Cliente (tenant): ${tenant.nome} (${tenant.slug})`,
    `Segmento: ${tenant.segmento ?? 'não informado'}`,
    `Rodada: ${input.rodadaId}`,
    `Tipo de entregável: ${tipo}`,
    `Data: ${hoje}`,
    '',
    '## Brief do dono',
    input.brief,
    '',
    '## Dossiê da plataforma',
    dossie ? JSON.stringify(dossie.conteudo, null, 2) : '(vazio — use só o brief)',
    '',
    '## Entregas do time nesta rodada (insumos)',
    porAgente.size === 0
      ? '(ainda nenhuma — você é o primeiro ou o início da pipeline)'
      : [...porAgente.values()]
          .map((e) => `### ${e.agente} · ${e.tipo}\n${e.conteudo.slice(0, 10000)}`)
          .join('\n\n'),
    '',
    input.feedbackQa
      ? `## Feedback do Prisma (QA) — corrija obrigatoriamente\n${input.feedbackQa}\n`
      : '',
    'Produza o entregável completo em Markdown.',
    'Comece com o cabeçalho YAML (cliente, tipo, funcionario, data, status: rascunho, versao).',
    'Nunca invente números do cliente. Marque estimativas. Respeite CFO (saúde) e SUSEP (seguros).',
    'Você está na pipeline automática: faça sua parte completa sem pedir checkpoint intermediário.',
  ].join('\n')

  try {
    const raw = await gerar({
      tenantId: input.tenantId,
      moduleId: MODULE_ID,
      system,
      prompt: userPrompt,
      maxTokens: 12000,
    })

    let conteudo = normalizarMarkdown(raw)
    if (!conteudo.startsWith('---')) {
      conteudo =
        montarYamlCabecalho({
          clienteSlug: tenant.slug,
          tipo,
          agente: def.id,
          data: hoje,
          status: 'rascunho',
          versao: 1,
        }) + conteudo
    }

    // Marca versões anteriores do mesmo agente nesta rodada como rejeitadas se retrabalho
    await tdb.timeEntrega.updateMany({
      where: {
        rodadaId: input.rodadaId,
        agente: def.id,
        status: { in: ['rascunho', 'aprovado'] },
      },
      data: { status: 'rejeitado_qa' },
    })

    const entrega = await tdb.timeEntrega.create({
      data: {
        tenantId: input.tenantId,
        rodadaId: input.rodadaId,
        agente: def.id,
        tipo,
        titulo: `${def.codinome} · ${tipo}`,
        conteudo,
        brief: input.brief,
        status: 'aprovado', // na pipeline auto, etapa fica “pronta” para a próxima
        versao: 1,
        agentRunId: run.id,
        criadoPorId: input.userId ?? null,
      },
    })

    await db.agentRun.update({
      where: { id: run.id },
      data: { status: 'concluido', terminadoEm: new Date() },
    })

    await publish(input.tenantId, EVENTO_ENTREGA, {
      entregaId: entrega.id,
      rodadaId: input.rodadaId,
      agente: def.id,
      tipo,
    })

    return { ok: true, entregaId: entrega.id, conteudo }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Falha ao rodar agente.'
    await db.agentRun.update({
      where: { id: run.id },
      data: {
        status: 'erro',
        terminadoEm: new Date(),
        erro: msg.slice(0, 500),
      },
    })
    const amigavel = /api.?key|authentication|401|ANTHROPIC|OPENAI|incorrect api/i.test(msg)
      ? 'IA não configurada. Defina OPENAI_API_KEY ou ANTHROPIC_API_KEY em .env.local.'
      : msg.slice(0, 400)
    return { ok: false, erro: amigavel }
  }
}

async function rodarQaPrisma(input: {
  tenantId: string
  rodadaId: string
  brief: string
  userId?: string | null
}): Promise<
  | { ok: true; aprovado: true; entregaId: string }
  | { ok: true; aprovado: false; agentes: AgenteId[]; motivos: string; entregaId: string }
  | { ok: false; erro: string }
> {
  const tdb = tenantDb(input.tenantId)
  const tenant = await db.tenant.findUnique({ where: { id: input.tenantId } })
  if (!tenant) return { ok: false, erro: 'Empresa não encontrada.' }

  const entregas = await tdb.timeEntrega.findMany({
    where: {
      rodadaId: input.rodadaId,
      status: 'aprovado',
      agente: { not: 'analista_bi' },
    },
    orderBy: { criadoEm: 'asc' },
  })

  const system = carregarPrompt('qa-pipeline.v1.md')
  const prompt = [
    `Cliente: ${tenant.nome} (${tenant.slug}) · segmento: ${tenant.segmento ?? 'n/a'}`,
    '',
    '## Brief',
    input.brief,
    '',
    '## Pacote entregue pelo time',
    entregas
      .map((e) => `### ${e.agente} · ${e.tipo}\n${e.conteudo.slice(0, 12000)}`)
      .join('\n\n'),
    '',
    'Avalie o pacote e responda só com o JSON de QA.',
  ].join('\n')

  const run = await db.agentRun.create({
    data: {
      tenantId: input.tenantId,
      agente: 'time:analista_bi:qa',
      status: 'rodando',
    },
  })

  try {
    const raw = await gerar({
      tenantId: input.tenantId,
      moduleId: MODULE_ID,
      system,
      prompt,
      maxTokens: 8000,
    })

    const qa = parseResultadoQa(raw)
    const hoje = new Date().toISOString().slice(0, 10)
    const conteudo =
      montarYamlCabecalho({
        clienteSlug: tenant.slug,
        tipo: 'qa',
        agente: 'analista_bi',
        data: hoje,
        status: qa.aprovado ? 'aprovado-lucas' : 'rascunho',
        versao: 1,
      }) +
      (qa.aprovado ? '## QA: aprovado\n\n' : '## QA: retrabalho\n\n') +
      qa.sumario_executivo +
      (qa.problemas.length
        ? '\n\n## Problemas\n' +
          qa.problemas.map((p) => `- **${p.agente}**: ${p.motivo}`).join('\n')
        : '')

    const entrega = await tdb.timeEntrega.create({
      data: {
        tenantId: input.tenantId,
        rodadaId: input.rodadaId,
        agente: 'analista_bi',
        tipo: 'qa',
        titulo: qa.aprovado ? 'Prisma · QA aprovado' : 'Prisma · QA com retrabalho',
        conteudo,
        brief: input.brief,
        status: 'aprovado',
        versao: 1,
        agentRunId: run.id,
        criadoPorId: input.userId ?? null,
      },
    })

    await db.agentRun.update({
      where: { id: run.id },
      data: { status: 'concluido', terminadoEm: new Date() },
    })

    if (qa.aprovado) {
      return { ok: true, aprovado: true, entregaId: entrega.id }
    }

    return {
      ok: true,
      aprovado: false,
      agentes: qa.problemas.map((p) => p.agente),
      motivos: qa.problemas.map((p) => `${p.agente}: ${p.motivo}`).join('\n'),
      entregaId: entrega.id,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Falha no QA.'
    await db.agentRun.update({
      where: { id: run.id },
      data: { status: 'erro', terminadoEm: new Date(), erro: msg.slice(0, 500) },
    })
    return {
      ok: false,
      erro: /api.?key|401|ANTHROPIC/i.test(msg)
        ? 'IA não configurada (chave Anthropic).'
        : msg.slice(0, 400),
    }
  }
}

/**
 * Pipeline completa automática:
 * Órbita → Atlas → Lumen → Mídia → Prisma(QA) → retrabalho se necessário.
 */
export async function executarPipelineRodada(input: {
  tenantId: string
  rodadaId: string
}): Promise<void> {
  const tdb = tenantDb(input.tenantId)
  const rodada = await tdb.timeRodada.findFirst({ where: { id: input.rodadaId } })
  if (!rodada) return

  let log = (Array.isArray(rodada.log) ? rodada.log : []) as LogEtapa[]
  const brief = rodada.brief

  const marcar = async (
    status: string,
    etapaAtual: string,
    extra?: { erro?: string; tentativasQa?: number },
  ) => {
    await tdb.timeRodada.update({
      where: { id: input.rodadaId },
      data: {
        status,
        etapaAtual,
        log,
        erro: extra?.erro ?? null,
        ...(extra?.tentativasQa != null ? { tentativasQa: extra.tentativasQa } : {}),
      },
    })
    await publish(input.tenantId, EVENTO_RODADA, {
      rodadaId: input.rodadaId,
      status,
      etapaAtual,
    })
  }

  try {
    // 1) Etapas de produção (sem Prisma)
    for (const agenteId of PIPELINE.filter((a) => a !== 'analista_bi')) {
      await marcar('rodando', agenteId)
      const r = await gerarEntregaAgente({
        tenantId: input.tenantId,
        rodadaId: input.rodadaId,
        agenteId,
        brief,
        userId: rodada.criadoPorId,
      })
      if (!r.ok) {
        log = appendLog(log, {
          em: new Date().toISOString(),
          etapa: agenteId,
          status: 'erro',
          detalhe: r.erro,
        })
        await marcar('erro', agenteId, { erro: r.erro })
        return
      }
      log = appendLog(log, {
        em: new Date().toISOString(),
        etapa: agenteId,
        status: 'ok',
        entregaId: r.entregaId,
        detalhe: getAgente(agenteId)?.codinome,
      })
    }

    // 2) Loop QA Prisma
    let tentativas = rodada.tentativasQa
    while (tentativas <= MAX_TENTATIVAS_QA) {
      await marcar('qa', 'analista_bi', { tentativasQa: tentativas })
      const qa = await rodarQaPrisma({
        tenantId: input.tenantId,
        rodadaId: input.rodadaId,
        brief,
        userId: rodada.criadoPorId,
      })

      if (!qa.ok) {
        log = appendLog(log, {
          em: new Date().toISOString(),
          etapa: 'analista_bi',
          status: 'erro',
          detalhe: qa.erro,
        })
        await marcar('erro', 'analista_bi', { erro: qa.erro })
        return
      }

      if (qa.aprovado) {
        log = appendLog(log, {
          em: new Date().toISOString(),
          etapa: 'analista_bi',
          status: 'qa_ok',
          entregaId: qa.entregaId,
          detalhe: 'Pacote aprovado pelo Prisma',
        })
        await marcar('concluido', 'analista_bi', { tentativasQa: tentativas })
        await tdb.activityLog.create({
          data: {
            tenantId: input.tenantId,
            userId: rodada.criadoPorId,
            acao: 'time.rodada_concluida',
            detalhe: { rodadaId: input.rodadaId },
          },
        })
        return
      }

      // Reprova: retrabalho nos agentes apontados
      log = appendLog(log, {
        em: new Date().toISOString(),
        etapa: 'analista_bi',
        status: 'qa_reprova',
        entregaId: qa.entregaId,
        detalhe: qa.motivos,
      })

      if (tentativas >= MAX_TENTATIVAS_QA) {
        await marcar('erro', 'analista_bi', {
          erro: `QA reprovou após ${MAX_TENTATIVAS_QA + 1} tentativas.\n${qa.motivos}`,
          tentativasQa: tentativas,
        })
        return
      }

      tentativas += 1
      await marcar('retrabalho', qa.agentes[0] ?? 'estrategista', {
        tentativasQa: tentativas,
      })

      // Ordem de retrabalho: pipeline relativa + dependentes depois
      const ordem = PIPELINE.filter((a) => a !== 'analista_bi')
      const set = new Set(qa.agentes)
      // Se copy precisa refazer e estratégia não, ok; se estratégia refaz, copy e mídia também
      if (set.has('estrategista')) {
        set.add('copywriter')
        set.add('gestor_midia')
      }
      if (set.has('copywriter')) set.add('gestor_midia')
      if (set.has('orquestrador')) {
        set.add('estrategista')
        set.add('copywriter')
        set.add('gestor_midia')
      }

      for (const agenteId of ordem) {
        if (!set.has(agenteId)) continue
        await marcar('retrabalho', agenteId, { tentativasQa: tentativas })
        const r = await gerarEntregaAgente({
          tenantId: input.tenantId,
          rodadaId: input.rodadaId,
          agenteId,
          brief,
          feedbackQa: qa.motivos,
          userId: rodada.criadoPorId,
        })
        if (!r.ok) {
          log = appendLog(log, {
            em: new Date().toISOString(),
            etapa: agenteId,
            status: 'erro',
            detalhe: r.erro,
          })
          await marcar('erro', agenteId, { erro: r.erro })
          return
        }
        log = appendLog(log, {
          em: new Date().toISOString(),
          etapa: agenteId,
          status: 'retrabalho',
          entregaId: r.entregaId,
          detalhe: 'Retrabalho após QA',
        })
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro na pipeline'
    log = appendLog(log, {
      em: new Date().toISOString(),
      etapa: 'pipeline',
      status: 'erro',
      detalhe: msg,
    })
    await marcar('erro', 'pipeline', { erro: msg.slice(0, 500) })
  }
}

export async function iniciarRodada(input: {
  tenantId: string
  brief: string
  userId?: string | null
}): Promise<{ ok: true; rodadaId: string } | { ok: false; erro: string }> {
  const brief = input.brief.trim()
  if (brief.length < 40) {
    return {
      ok: false,
      erro: 'Brief curto demais. Conte quem é o cliente, o que vende, região, objetivo e verba se souber.',
    }
  }

  const tdb = tenantDb(input.tenantId)
  const log: LogEtapa[] = [
    {
      em: new Date().toISOString(),
      etapa: 'inicio',
      status: 'ok',
      detalhe: 'Rodada criada — pipeline automática',
    },
  ]

  const rodada = await tdb.timeRodada.create({
    data: {
      tenantId: input.tenantId,
      brief,
      status: 'rodando',
      etapaAtual: 'orquestrador',
      log,
      tentativasQa: 0,
      criadoPorId: input.userId ?? null,
    },
  })

  await tdb.activityLog.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId ?? null,
      acao: 'time.rodada_iniciada',
      detalhe: { rodadaId: rodada.id },
    },
  })

  return { ok: true, rodadaId: rodada.id }
}

// re-export AGENTES for UI that still imports from service by mistake
export { AGENTES }
