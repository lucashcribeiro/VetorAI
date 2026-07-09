import 'server-only'
import { readFileSync } from 'fs'
import { join } from 'path'
import { db, tenantDb } from '@/core/db/client'
import { gerar } from '@/core/ai/anthropic'
import { publish } from '@/core/events/bus'
import {
  limparSugestao,
  montarPromptSugestao,
  normalizarWaId,
} from '../lib'
import {
  enviarTextoWhatsApp,
  envioSimulado,
  getWaConfigForTenant,
} from '../whatsapp'

export const MODULE_ID = 'zelo'
export const EVENTO_CONVERSA_INICIADA = 'zelo.conversa_iniciada'
export const EVENTO_ESCALADA = 'zelo.escalada_humano'
export const PROMPT_VERSION = 'sugestao-resposta.v1'

let promptCache: string | null = null

export function carregarSystemPromptZelo(): string {
  if (promptCache) return promptCache
  const caminho = join(process.cwd(), 'modules/zelo/prompts/sugestao-resposta.v1.md')
  promptCache = readFileSync(caminho, 'utf8')
  return promptCache
}

export interface MensagemEntradaInput {
  tenantId: string
  waId: string
  nomeContato?: string | null
  corpo: string
  waMessageId?: string | null
}

/**
 * Processa mensagem de entrada (webhook ou simulação):
 * upsert conversa → grava entrada → gera sugestão (Claude) → status aguardando.
 */
export async function processarMensagemEntrada(
  input: MensagemEntradaInput,
): Promise<{ conversaId: string; mensagemId: string; sugestaoId?: string }> {
  const tenantId = input.tenantId
  const waId = normalizarWaId(input.waId)
  const tdb = tenantDb(tenantId)
  const agora = new Date()

  // Idempotência por wa_message_id.
  if (input.waMessageId) {
    const existente = await db.zeloMensagem.findUnique({
      where: { waMessageId: input.waMessageId },
    })
    if (existente) {
      return { conversaId: existente.conversaId, mensagemId: existente.id }
    }
  }

  let conversa = await tdb.zeloConversa.findFirst({ where: { waId } })
  const nova = !conversa

  if (!conversa) {
    conversa = await tdb.zeloConversa.create({
      data: {
        tenantId,
        waId,
        nomeContato: input.nomeContato ?? null,
        status: 'aguardando',
        primeiraMsgEm: agora,
        ultimaMsgEm: agora,
      },
    })
    await publish(tenantId, EVENTO_CONVERSA_INICIADA, {
      conversaId: conversa.id,
      waId,
      nomeContato: input.nomeContato ?? null,
    })
  } else {
    conversa = await tdb.zeloConversa.update({
      where: { id: conversa.id },
      data: {
        status: 'aguardando',
        ultimaMsgEm: agora,
        nomeContato: input.nomeContato ?? conversa.nomeContato,
      },
    })
  }

  const mensagem = await tdb.zeloMensagem.create({
    data: {
      tenantId,
      conversaId: conversa.id,
      direcao: 'entrada',
      corpo: input.corpo,
      waMessageId: input.waMessageId ?? null,
      status: 'recebida',
    },
  })

  // Descarta sugestões pendentes anteriores desta conversa.
  await tdb.zeloMensagem.updateMany({
    where: { conversaId: conversa.id, direcao: 'sugestao', status: 'pendente' },
    data: { status: 'descartada' },
  })

  let sugestaoId: string | undefined
  try {
    const texto = await gerarSugestaoResposta(tenantId, conversa.id)
    const sug = await tdb.zeloMensagem.create({
      data: {
        tenantId,
        conversaId: conversa.id,
        direcao: 'sugestao',
        corpo: texto,
        status: 'pendente',
      },
    })
    sugestaoId = sug.id
  } catch (err) {
    console.error('[zelo] falha ao gerar sugestão', err)
    // Conversa fica aguardando sem sugestão — secretária responde manualmente.
  }

  await tdb.activityLog.create({
    data: {
      tenantId,
      acao: nova ? 'zelo.conversa_iniciada' : 'zelo.mensagem_recebida',
      detalhe: { conversaId: conversa.id, mensagemId: mensagem.id, sugestaoId },
    },
  })

  return { conversaId: conversa.id, mensagemId: mensagem.id, sugestaoId }
}

export async function gerarSugestaoResposta(
  tenantId: string,
  conversaId: string,
): Promise<string> {
  const tdb = tenantDb(tenantId)
  const conversa = await tdb.zeloConversa.findFirst({ where: { id: conversaId } })
  if (!conversa) throw new Error('Conversa não encontrada.')

  const tenant = await db.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) throw new Error('Tenant não encontrado.')

  const mensagens = await tdb.zeloMensagem.findMany({
    where: {
      conversaId,
      direcao: { in: ['entrada', 'saida'] },
    },
    orderBy: { criadoEm: 'asc' },
    take: 30,
  })

  const dossie = await tdb.dossie.findFirst({ orderBy: { versao: 'desc' } })

  const raw = await gerar({
    tenantId,
    moduleId: MODULE_ID,
    system: carregarSystemPromptZelo(),
    prompt: montarPromptSugestao({
      negocio: { nome: tenant.nome, segmento: tenant.segmento },
      contato: { nome: conversa.nomeContato, waId: conversa.waId },
      historico: mensagens.map((m) => ({ direcao: m.direcao, corpo: m.corpo })),
      dossie: dossie?.conteudo ?? null,
    }),
    maxTokens: 800,
  })

  return limparSugestao(raw)
}

/**
 * Aprova sugestão (ou texto editado) e envia pelo WhatsApp.
 * Sem token configurado: grava como enviada simulada (dev).
 */
export async function aprovarEEnviar(input: {
  tenantId: string
  conversaId: string
  texto: string
  sugestaoId?: string | null
  userId?: string | null
}): Promise<{ ok: true } | { ok: false; erro: string }> {
  const { tenantId, conversaId, texto, sugestaoId, userId } = input
  const corpo = texto.trim()
  if (!corpo) return { ok: false, erro: 'Mensagem vazia.' }

  const tdb = tenantDb(tenantId)
  const conversa = await tdb.zeloConversa.findFirst({ where: { id: conversaId } })
  if (!conversa) return { ok: false, erro: 'Conversa não encontrada.' }

  if (sugestaoId) {
    await tdb.zeloMensagem.updateMany({
      where: { id: sugestaoId, conversaId, direcao: 'sugestao' },
      data: { status: 'aprovada', aprovadaPorId: userId ?? null },
    })
  }

  const config = await getWaConfigForTenant(tenantId)
  const envio = config
    ? await enviarTextoWhatsApp(config, conversa.waId, corpo)
    : envioSimulado(corpo)

  if (!envio.ok) {
    await tdb.zeloMensagem.create({
      data: {
        tenantId,
        conversaId,
        direcao: 'saida',
        corpo,
        status: 'erro',
        aprovadaPorId: userId ?? null,
      },
    })
    return { ok: false, erro: envio.erro }
  }

  const agora = new Date()
  await tdb.zeloMensagem.create({
    data: {
      tenantId,
      conversaId,
      direcao: 'saida',
      corpo,
      waMessageId: envio.waMessageId,
      status: 'enviada',
      aprovadaPorId: userId ?? null,
    },
  })

  const update: {
    status: string
    ultimaMsgEm: Date
    primeiraRespostaEm?: Date
    tempoPrimeiraRespostaMs?: number
  } = {
    status: 'respondida',
    ultimaMsgEm: agora,
  }

  if (!conversa.primeiraRespostaEm) {
    update.primeiraRespostaEm = agora
    update.tempoPrimeiraRespostaMs = Math.max(
      0,
      agora.getTime() - conversa.primeiraMsgEm.getTime(),
    )
  }

  await tdb.zeloConversa.update({
    where: { id: conversaId },
    data: update,
  })

  await tdb.activityLog.create({
    data: {
      tenantId,
      userId: userId ?? null,
      acao: 'zelo.resposta_enviada',
      detalhe: {
        conversaId,
        simulada: !config,
        tempoPrimeiraRespostaMs: update.tempoPrimeiraRespostaMs ?? null,
      },
    },
  })

  return { ok: true }
}

export async function escalarConversa(input: {
  tenantId: string
  conversaId: string
  userId?: string | null
  motivo?: string | null
}): Promise<{ ok: true } | { ok: false; erro: string }> {
  const { tenantId, conversaId, userId, motivo } = input
  const tdb = tenantDb(tenantId)
  const conversa = await tdb.zeloConversa.findFirst({ where: { id: conversaId } })
  if (!conversa) return { ok: false, erro: 'Conversa não encontrada.' }

  await tdb.zeloConversa.update({
    where: { id: conversaId },
    data: { status: 'escalada', ultimaMsgEm: new Date() },
  })

  // Descarta sugestões pendentes.
  await tdb.zeloMensagem.updateMany({
    where: { conversaId, direcao: 'sugestao', status: 'pendente' },
    data: { status: 'descartada' },
  })

  await publish(tenantId, EVENTO_ESCALADA, {
    conversaId,
    waId: conversa.waId,
    motivo: motivo ?? null,
  })

  await tdb.activityLog.create({
    data: {
      tenantId,
      userId: userId ?? null,
      acao: 'zelo.escalada_humano',
      detalhe: { conversaId, motivo: motivo ?? null },
    },
  })

  return { ok: true }
}

export async function regenerarSugestao(input: {
  tenantId: string
  conversaId: string
}): Promise<{ ok: true; sugestaoId: string } | { ok: false; erro: string }> {
  const { tenantId, conversaId } = input
  const tdb = tenantDb(tenantId)
  const conversa = await tdb.zeloConversa.findFirst({ where: { id: conversaId } })
  if (!conversa) return { ok: false, erro: 'Conversa não encontrada.' }

  await tdb.zeloMensagem.updateMany({
    where: { conversaId, direcao: 'sugestao', status: 'pendente' },
    data: { status: 'descartada' },
  })

  try {
    const texto = await gerarSugestaoResposta(tenantId, conversaId)
    const sug = await tdb.zeloMensagem.create({
      data: {
        tenantId,
        conversaId,
        direcao: 'sugestao',
        corpo: texto,
        status: 'pendente',
      },
    })
    await tdb.zeloConversa.update({
      where: { id: conversaId },
      data: { status: 'aguardando' },
    })
    return { ok: true, sugestaoId: sug.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Falha ao gerar sugestão.'
    const amigavel = /api.?key|authentication|401|ANTHROPIC/i.test(msg)
      ? 'IA não configurada (chave Anthropic). A equipe pode responder manualmente.'
      : msg.slice(0, 300)
    return { ok: false, erro: amigavel }
  }
}
