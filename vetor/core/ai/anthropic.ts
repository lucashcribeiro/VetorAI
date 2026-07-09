import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { db } from '@/core/db/client'
import {
  custoBrl,
  modeloPadrao,
  provedorAtivo,
  temKeyAnthropic,
  temKeyOpenAI,
  MODELO_PADRAO_ANTHROPIC,
  MODELO_PADRAO_OPENAI,
} from './usage'

// Cliente único da plataforma: Anthropic e/ou OpenAI.
// Todo módulo chama a IA por aqui → ai_usage por tenant.

const globalForAi = globalThis as unknown as {
  anthropic?: Anthropic
  openai?: OpenAI
}

function getAnthropic(): Anthropic {
  globalForAi.anthropic ??= new Anthropic({ maxRetries: 3 })
  return globalForAi.anthropic
}

function getOpenAI(): OpenAI {
  globalForAi.openai ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 3,
  })
  return globalForAi.openai
}

export interface GerarParams {
  tenantId: string
  moduleId: string
  prompt: string
  system?: string
  modelo?: string
  maxTokens?: number
}

async function registrarUso(input: {
  tenantId: string
  moduleId: string
  modelo: string
  tokensIn: number
  tokensOut: number
}) {
  try {
    await db.aiUsage.create({
      data: {
        tenantId: input.tenantId,
        moduleId: input.moduleId,
        modelo: input.modelo,
        tokensIn: input.tokensIn,
        tokensOut: input.tokensOut,
        custoBrl: custoBrl(input.modelo, input.tokensIn, input.tokensOut),
      },
    })
  } catch (erro) {
    console.error('[core/ai] falha ao registrar ai_usage', erro)
  }
}

async function gerarOpenAI(params: GerarParams & { modelo: string }): Promise<string> {
  const { tenantId, moduleId, prompt, system, modelo, maxTokens = 16000 } = params
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []
  if (system) messages.push({ role: 'system', content: system })
  messages.push({ role: 'user', content: prompt })

  const response = await getOpenAI().chat.completions.create({
    model: modelo,
    max_tokens: maxTokens,
    messages,
  })

  const tokensIn = response.usage?.prompt_tokens ?? 0
  const tokensOut = response.usage?.completion_tokens ?? 0
  await registrarUso({ tenantId, moduleId, modelo, tokensIn, tokensOut })

  return response.choices.map((c) => c.message?.content ?? '').join('\n').trim()
}

async function gerarAnthropic(params: GerarParams & { modelo: string }): Promise<string> {
  const { tenantId, moduleId, prompt, system, modelo, maxTokens = 16000 } = params
  const response = await getAnthropic().messages.create({
    model: modelo,
    max_tokens: maxTokens,
    ...(system ? { system } : {}),
    messages: [{ role: 'user', content: prompt }],
  })

  const tokensIn = response.usage.input_tokens
  const tokensOut = response.usage.output_tokens
  await registrarUso({ tenantId, moduleId, modelo, tokensIn, tokensOut })

  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
}

export async function gerar({
  tenantId,
  moduleId,
  prompt,
  system,
  modelo,
  maxTokens = 16000,
}: GerarParams): Promise<string> {
  const provedor = provedorAtivo()
  if (!provedor) {
    throw new Error(
      'IA não configurada. Defina OPENAI_API_KEY ou ANTHROPIC_API_KEY válida em .env.local.',
    )
  }

  if (provedor === 'openai') {
    const m =
      modelo && !modelo.startsWith('claude') ? modelo : MODELO_PADRAO_OPENAI
    return gerarOpenAI({ tenantId, moduleId, prompt, system, modelo: m, maxTokens })
  }

  const m =
    modelo && modelo.startsWith('claude') ? modelo : MODELO_PADRAO_ANTHROPIC
  // Se pediram modelo default antigo sem key Anthropic mas temos OpenAI:
  if (!temKeyAnthropic() && temKeyOpenAI()) {
    return gerarOpenAI({
      tenantId,
      moduleId,
      prompt,
      system,
      modelo: MODELO_PADRAO_OPENAI,
      maxTokens,
    })
  }
  return gerarAnthropic({ tenantId, moduleId, prompt, system, modelo: m, maxTokens })
}

export { modeloPadrao, provedorAtivo }
