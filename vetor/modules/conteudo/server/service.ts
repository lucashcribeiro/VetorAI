import 'server-only'
import { readFileSync } from 'fs'
import { join } from 'path'
import { db, tenantDb } from '@/core/db/client'
import { gerar } from '@/core/ai/anthropic'
import { publish } from '@/core/events/bus'
import {
  conformidadeDoSegmento,
  dataDoDiaNaSemana,
  parsearPostsDaIa,
  type Conformidade,
} from '../lib'

export const MODULE_ID = 'conteudo'
export const EVENTO_POST_APROVADO = 'post.aprovado'
export const EVENTO_POST_PUBLICADO = 'post.publicado'
export const PROMPT_VERSION = 'calendario-semanal.v1'

let promptCache: string | null = null

function carregarSystemPrompt(): string {
  if (promptCache) return promptCache
  promptCache = readFileSync(
    join(process.cwd(), 'modules/conteudo/prompts/calendario-semanal.v1.md'),
    'utf8',
  )
  return promptCache
}

function notaConformidade(c: Conformidade): string {
  if (c === 'cfo_dental') return 'cfo_dental — regras do Conselho Federal de Odontologia'
  if (c === 'susep_seguros') return 'susep_seguros — comunicação responsável de seguros'
  return 'geral — honestidade e utilidade'
}

/**
 * Gera pauta da semana via Claude e grava posts `pendente`.
 * Substitui posts ainda pendentes da mesma semana (não mexe nos aprovados).
 */
export async function executarGeracaoCalendario(input: {
  tenantId: string
  semanaInicio: string
  userId?: string | null
}): Promise<{ ok: true; qtd: number } | { ok: false; erro: string }> {
  const { tenantId, semanaInicio, userId } = input
  const tdb = tenantDb(tenantId)

  const tenant = await db.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) return { ok: false, erro: 'Empresa não encontrada.' }

  const dossie = await tdb.dossie.findFirst({ orderBy: { versao: 'desc' } })
  const conformidade = conformidadeDoSegmento(tenant.segmento)

  const prompt = [
    'Gere o calendário da semana em JSON array conforme o system prompt.',
    '',
    '```json',
    JSON.stringify(
      {
        negocio: { nome: tenant.nome, segmento: tenant.segmento },
        semana_inicio: semanaInicio,
        conformidade: notaConformidade(conformidade),
        dossie: dossie?.conteudo ?? null,
      },
      null,
      2,
    ),
    '```',
  ].join('\n')

  try {
    const raw = await gerar({
      tenantId,
      moduleId: MODULE_ID,
      system: carregarSystemPrompt(),
      prompt,
      maxTokens: 8000,
    })

    const posts = parsearPostsDaIa(raw)
    if (posts.length === 0) {
      return { ok: false, erro: 'A IA não gerou posts utilizáveis. Tente de novo.' }
    }

    // Remove só pendentes/erro da semana — preserva aprovados/exportados.
    await tdb.conteudoPost.deleteMany({
      where: {
        semanaInicio,
        status: { in: ['pendente', 'erro', 'rejeitado', 'gerando'] },
      },
    })

    let ordem = 0
    for (const p of posts) {
      const agendadoPara = dataDoDiaNaSemana(semanaInicio, p.diaSemana, ordem)
      await tdb.conteudoPost.create({
        data: {
          tenantId,
          semanaInicio,
          canal: p.canal ?? 'instagram',
          titulo: p.titulo ?? null,
          texto: p.texto,
          hashtags: p.hashtags ?? null,
          status: 'pendente',
          agendadoPara,
          ordem: ordem++,
        },
      })
    }

    await tdb.activityLog.create({
      data: {
        tenantId,
        userId: userId ?? null,
        acao: 'conteudo.calendario_gerado',
        detalhe: {
          semanaInicio,
          qtd: posts.length,
          promptVersion: PROMPT_VERSION,
          conformidade,
        },
      },
    })

    return { ok: true, qtd: posts.length }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Falha ao gerar calendário.'
    const amigavel = /api.?key|authentication|401|ANTHROPIC/i.test(msg)
      ? 'IA não configurada (chave Anthropic). Avise a VETOR.'
      : msg.slice(0, 400)
    return { ok: false, erro: amigavel }
  }
}

export async function aprovarPosts(input: {
  tenantId: string
  postIds: string[]
  userId?: string | null
}): Promise<{ ok: true; qtd: number } | { ok: false; erro: string }> {
  const { tenantId, postIds, userId } = input
  if (postIds.length === 0) return { ok: false, erro: 'Nenhum post selecionado.' }

  const tdb = tenantDb(tenantId)
  const agora = new Date()

  const result = await tdb.conteudoPost.updateMany({
    where: { id: { in: postIds }, status: 'pendente' },
    data: {
      status: 'aprovado',
      aprovadoPorId: userId ?? null,
      aprovadoEm: agora,
    },
  })

  for (const id of postIds) {
    await publish(tenantId, EVENTO_POST_APROVADO, { postId: id })
  }

  await tdb.activityLog.create({
    data: {
      tenantId,
      userId: userId ?? null,
      acao: 'conteudo.posts_aprovados',
      detalhe: { postIds, qtd: result.count },
    },
  })

  return { ok: true, qtd: result.count }
}

export async function rejeitarPost(input: {
  tenantId: string
  postId: string
  userId?: string | null
}): Promise<{ ok: true } | { ok: false; erro: string }> {
  const tdb = tenantDb(input.tenantId)
  const post = await tdb.conteudoPost.findFirst({ where: { id: input.postId } })
  if (!post) return { ok: false, erro: 'Post não encontrado.' }

  await tdb.conteudoPost.update({
    where: { id: input.postId },
    data: { status: 'rejeitado' },
  })

  await tdb.activityLog.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId ?? null,
      acao: 'conteudo.post_rejeitado',
      detalhe: { postId: input.postId },
    },
  })

  return { ok: true }
}

/** Marca aprovados como exportados e publica evento (v1 = lembrete/exportação texto). */
export async function exportarAprovados(input: {
  tenantId: string
  semanaInicio?: string
  userId?: string | null
}): Promise<{ ok: true; qtd: number; texto: string } | { ok: false; erro: string }> {
  const tdb = tenantDb(input.tenantId)
  const posts = await tdb.conteudoPost.findMany({
    where: {
      status: 'aprovado',
      ...(input.semanaInicio ? { semanaInicio: input.semanaInicio } : {}),
    },
    orderBy: [{ agendadoPara: 'asc' }, { ordem: 'asc' }],
  })

  if (posts.length === 0) {
    return { ok: false, erro: 'Não há posts aprovados para exportar.' }
  }

  const agora = new Date()
  const ids = posts.map((p) => p.id)

  await tdb.conteudoPost.updateMany({
    where: { id: { in: ids } },
    data: { status: 'exportado', exportadoEm: agora },
  })

  for (const id of ids) {
    await publish(input.tenantId, EVENTO_POST_PUBLICADO, {
      postId: id,
      modo: 'exportacao_texto',
    })
  }

  await tdb.activityLog.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId ?? null,
      acao: 'conteudo.posts_exportados',
      detalhe: { postIds: ids, qtd: posts.length },
    },
  })

  const { montarTextoExportacao } = await import('../lib')
  const texto = montarTextoExportacao(posts)

  return { ok: true, qtd: posts.length, texto }
}
