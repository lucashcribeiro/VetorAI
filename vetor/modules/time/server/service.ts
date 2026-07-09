import 'server-only'
import { readFileSync } from 'fs'
import { join } from 'path'
import { db, tenantDb } from '@/core/db/client'
import { gerar } from '@/core/ai/anthropic'
import { publish } from '@/core/events/bus'
import { getAgente, type AgenteId } from '../agents'
import { montarYamlCabecalho, normalizarMarkdown } from '../lib'
import { ultimasAprovadasPorAgente } from '../db'

export const MODULE_ID = 'time'
export const EVENTO_ENTREGA = 'time.entrega_gerada'
export const EVENTO_APROVADA = 'time.entrega_aprovada'

function carregarPrompt(arquivo: string): string {
  return readFileSync(join(process.cwd(), 'modules/time/prompts', arquivo), 'utf8')
}

export async function executarAgente(input: {
  tenantId: string
  agenteId: AgenteId
  tipo?: string
  brief: string
  userId?: string | null
  forcarSemDependencias?: boolean
}): Promise<
  | { ok: true; entregaId: string }
  | { ok: false; erro: string }
> {
  const def = getAgente(input.agenteId)
  if (!def) return { ok: false, erro: 'Agente desconhecido.' }

  const brief = input.brief.trim()
  if (brief.length < 20) {
    return { ok: false, erro: 'Brief muito curto. Descreva o cliente, objetivo e contexto.' }
  }

  const tipo = input.tipo && def.tipos.includes(input.tipo) ? input.tipo : def.tipoPadrao
  const tdb = tenantDb(input.tenantId)
  const tenant = await db.tenant.findUnique({ where: { id: input.tenantId } })
  if (!tenant) return { ok: false, erro: 'Empresa não encontrada.' }

  if (!input.forcarSemDependencias && def.dependeDe.length > 0) {
    const deps = await ultimasAprovadasPorAgente(input.tenantId, def.dependeDe, tdb)
    if (deps.length < def.dependeDe.length) {
      const faltam = def.dependeDe.filter((d) => !deps.some((x) => x.agente === d))
      return {
        ok: false,
        erro: `Falta entrega aprovada de: ${faltam.join(', ')}. Rode e aprove antes (ou force sem dependências).`,
      }
    }
  }

  const dossie = await tdb.dossie.findFirst({ orderBy: { versao: 'desc' } })
  const contextoDeps = await ultimasAprovadasPorAgente(
    input.tenantId,
    def.dependeDe.length ? def.dependeDe : ['estrategista', 'copywriter'],
    tdb,
  )

  const run = await db.agentRun.create({
    data: {
      tenantId: input.tenantId,
      agente: `time:${def.id}`,
      status: 'rodando',
    },
  })

  const system = carregarPrompt(def.promptFile)
  const hoje = new Date().toISOString().slice(0, 10)
  const userPrompt = [
    `Cliente (tenant): ${tenant.nome} (${tenant.slug})`,
    `Segmento: ${tenant.segmento ?? 'não informado'}`,
    `Tipo de entregável pedido: ${tipo}`,
    `Data: ${hoje}`,
    '',
    '## Brief do Lucas / dono',
    brief,
    '',
    '## Dossiê da plataforma (se houver)',
    dossie ? JSON.stringify(dossie.conteudo, null, 2) : '(vazio — use só o brief)',
    '',
    '## Entregas aprovadas anteriores (insumos)',
    contextoDeps.length === 0
      ? '(nenhuma)'
      : contextoDeps
          .map((e) => `### ${e.agente} · ${e.tipo} · v${e.versao}\n${e.conteudo.slice(0, 8000)}`)
          .join('\n\n'),
    '',
    'Produza o entregável completo em Markdown.',
    'Comece com o cabeçalho YAML da convenção VETOR (cliente, tipo, funcionario, data, status: rascunho, versao).',
    'Nunca invente números do cliente. Marque estimativas. Respeite CFO (saúde) e SUSEP (seguros).',
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

    const entrega = await tdb.timeEntrega.create({
      data: {
        tenantId: input.tenantId,
        agente: def.id,
        tipo,
        titulo: `${def.codinome} · ${tipo}`,
        conteudo,
        brief,
        status: 'rascunho',
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
      agente: def.id,
      tipo,
    })

    await tdb.activityLog.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId ?? null,
        acao: 'time.entrega_gerada',
        detalhe: { entregaId: entrega.id, agente: def.id, tipo },
      },
    })

    return { ok: true, entregaId: entrega.id }
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
    const amigavel = /api.?key|authentication|401|ANTHROPIC/i.test(msg)
      ? 'IA não configurada (chave Anthropic).'
      : msg.slice(0, 400)
    return { ok: false, erro: amigavel }
  }
}

export async function aprovarEntrega(input: {
  tenantId: string
  entregaId: string
  userId?: string | null
}): Promise<{ ok: true } | { ok: false; erro: string }> {
  const tdb = tenantDb(input.tenantId)
  const e = await tdb.timeEntrega.findFirst({ where: { id: input.entregaId } })
  if (!e) return { ok: false, erro: 'Entrega não encontrada.' }

  let conteudo = e.conteudo
  if (conteudo.includes('status: rascunho')) {
    conteudo = conteudo.replace('status: rascunho', 'status: aprovado-lucas')
  }

  await tdb.timeEntrega.update({
    where: { id: input.entregaId },
    data: { status: 'aprovado', conteudo },
  })

  await publish(input.tenantId, EVENTO_APROVADA, {
    entregaId: input.entregaId,
    agente: e.agente,
    tipo: e.tipo,
  })

  await tdb.activityLog.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId ?? null,
      acao: 'time.entrega_aprovada',
      detalhe: { entregaId: input.entregaId },
    },
  })

  return { ok: true }
}
