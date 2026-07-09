import { NextResponse } from 'next/server'
import { after } from 'next/server'
import {
  getVerifyToken,
  resolverTenantPorPhoneNumberId,
  verificarAssinatura,
} from '@/modules/zelo/whatsapp'
import { processarMensagemEntrada } from '@/modules/zelo/server/service'

// WhatsApp Cloud API webhook (Meta).
// GET: verificação do challenge. POST: mensagens de entrada.

export async function GET(req: Request) {
  const url = new URL(req.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === getVerifyToken() && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ erro: 'Verificação falhou' }, { status: 403 })
}

interface WaChange {
  value?: {
    metadata?: { phone_number_id?: string }
    contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>
    messages?: Array<{
      id?: string
      from?: string
      type?: string
      text?: { body?: string }
      timestamp?: string
    }>
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-hub-signature-256')

  if (!verificarAssinatura(rawBody, signature)) {
    return NextResponse.json({ erro: 'Assinatura inválida' }, { status: 401 })
  }

  let body: { object?: string; entry?: Array<{ changes?: WaChange[] }> }
  try {
    body = JSON.parse(rawBody) as typeof body
  } catch {
    return NextResponse.json({ erro: 'JSON inválido' }, { status: 400 })
  }

  // Responde 200 rápido; processa depois (Meta reenvia se demorar).
  const tarefas: Array<() => Promise<void>> = []

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value
      if (!value?.messages?.length) continue

      const phoneNumberId = value.metadata?.phone_number_id
      if (!phoneNumberId) continue

      const resolved = await resolverTenantPorPhoneNumberId(phoneNumberId)
      if (!resolved) {
        console.warn('[whatsapp webhook] phone_number_id sem tenant', phoneNumberId)
        continue
      }

      const nomePorWa = new Map(
        (value.contacts ?? []).map((c) => [c.wa_id ?? '', c.profile?.name ?? null]),
      )

      for (const msg of value.messages) {
        if (msg.type !== 'text' || !msg.text?.body || !msg.from) continue
        const from = msg.from
        const corpo = msg.text.body
        const waMessageId = msg.id ?? null
        const nome = nomePorWa.get(from) ?? null
        const tenantId = resolved.tenantId

        tarefas.push(async () => {
          try {
            await processarMensagemEntrada({
              tenantId,
              waId: from,
              nomeContato: nome,
              corpo,
              waMessageId,
            })
          } catch (err) {
            console.error('[whatsapp webhook] processar mensagem', err)
          }
        })
      }
    }
  }

  if (tarefas.length > 0) {
    after(async () => {
      for (const t of tarefas) await t()
    })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
