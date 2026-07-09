import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/core/db/client'
import { custoBrl, MODELO_PADRAO } from './usage'

// Cliente único da plataforma (README §7): todo módulo chama a IA por aqui,
// para que cada geração fique registrada em ai_usage com custo por tenant.

const globalForAnthropic = globalThis as unknown as { anthropic?: Anthropic }

function getClient(): Anthropic {
  // maxRetries do SDK cobre 429/5xx/erros de conexão com backoff exponencial.
  globalForAnthropic.anthropic ??= new Anthropic({ maxRetries: 3 })
  return globalForAnthropic.anthropic
}

export interface GerarParams {
  tenantId: string
  moduleId: string
  prompt: string
  system?: string
  modelo?: string
  maxTokens?: number
}

export async function gerar({
  tenantId,
  moduleId,
  prompt,
  system,
  modelo = MODELO_PADRAO,
  maxTokens = 16000,
}: GerarParams): Promise<string> {
  const response = await getClient().messages.create({
    model: modelo,
    max_tokens: maxTokens,
    thinking: { type: 'adaptive' },
    ...(system ? { system } : {}),
    messages: [{ role: 'user', content: prompt }],
  })

  const tokensIn = response.usage.input_tokens
  const tokensOut = response.usage.output_tokens

  try {
    await db.aiUsage.create({
      data: {
        tenantId,
        moduleId,
        modelo,
        tokensIn,
        tokensOut,
        custoBrl: custoBrl(modelo, tokensIn, tokensOut),
      },
    })
  } catch (erro) {
    // Falha de contabilização não pode derrubar a geração já paga.
    console.error('[core/ai] falha ao registrar ai_usage', erro)
  }

  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
}
