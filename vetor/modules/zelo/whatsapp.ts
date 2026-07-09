import 'server-only'
import { createHmac, timingSafeEqual } from 'crypto'
import { db } from '@/core/db/client'

// Cliente mínimo da WhatsApp Cloud API + resolução de tenant.

export interface ZeloWaConfig {
  phoneNumberId: string
  accessToken: string
}

export function getVerifyToken(): string {
  return process.env.WHATSAPP_VERIFY_TOKEN ?? 'vetor-zelo-dev'
}

export function getAppSecret(): string | null {
  return process.env.WHATSAPP_APP_SECRET ?? null
}

/** Valida assinatura X-Hub-Signature-256 da Meta (se secret configurado). */
export function verificarAssinatura(rawBody: string, signatureHeader: string | null): boolean {
  const secret = getAppSecret()
  if (!secret) {
    // Dev sem secret: aceita (documentado no README).
    return true
  }
  if (!signatureHeader?.startsWith('sha256=')) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const received = signatureHeader.slice('sha256='.length)
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(received))
  } catch {
    return false
  }
}

/**
 * Resolve tenant a partir do phone_number_id do webhook.
 * Config em tenant_modules.config do módulo zelo:
 * `{ "phoneNumberId": "123", "accessToken": "EAA..." }`
 * accessToken opcional — cai em WHATSAPP_ACCESS_TOKEN global.
 */
export async function resolverTenantPorPhoneNumberId(
  phoneNumberId: string,
): Promise<{ tenantId: string; config: ZeloWaConfig } | null> {
  const rows = await db.tenantModule.findMany({
    where: { moduleId: 'zelo', ativo: true },
  })

  const globalToken = process.env.WHATSAPP_ACCESS_TOKEN ?? ''

  for (const row of rows) {
    const cfg = (row.config ?? {}) as Record<string, unknown>
    const pnid = String(cfg.phoneNumberId ?? cfg.phone_number_id ?? '')
    if (pnid && pnid === phoneNumberId) {
      const accessToken = String(cfg.accessToken ?? cfg.access_token ?? globalToken)
      if (!accessToken) return null
      return {
        tenantId: row.tenantId,
        config: { phoneNumberId: pnid, accessToken },
      }
    }
  }

  // Fallback dev: um único tenant com zelo ativo + env global.
  if (process.env.WHATSAPP_PHONE_NUMBER_ID === phoneNumberId && globalToken) {
    const ativo = rows[0]
    if (ativo) {
      return {
        tenantId: ativo.tenantId,
        config: { phoneNumberId, accessToken: globalToken },
      }
    }
  }

  return null
}

export async function getWaConfigForTenant(tenantId: string): Promise<ZeloWaConfig | null> {
  const row = await db.tenantModule.findUnique({
    where: { tenantId_moduleId: { tenantId, moduleId: 'zelo' } },
  })
  if (!row?.ativo) return null
  const cfg = (row.config ?? {}) as Record<string, unknown>
  const phoneNumberId = String(
    cfg.phoneNumberId ?? cfg.phone_number_id ?? process.env.WHATSAPP_PHONE_NUMBER_ID ?? '',
  )
  const accessToken = String(
    cfg.accessToken ?? cfg.access_token ?? process.env.WHATSAPP_ACCESS_TOKEN ?? '',
  )
  if (!phoneNumberId || !accessToken) return null
  return { phoneNumberId, accessToken }
}

export async function enviarTextoWhatsApp(
  config: ZeloWaConfig,
  paraWaId: string,
  texto: string,
): Promise<{ ok: true; waMessageId: string } | { ok: false; erro: string }> {
  const url = `https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: paraWaId,
        type: 'text',
        text: { body: texto },
      }),
    })
    const json = (await res.json()) as {
      messages?: Array<{ id: string }>
      error?: { message?: string }
    }
    if (!res.ok) {
      return { ok: false, erro: json.error?.message ?? `WhatsApp HTTP ${res.status}` }
    }
    const id = json.messages?.[0]?.id
    if (!id) return { ok: false, erro: 'Resposta da API sem message id.' }
    return { ok: true, waMessageId: id }
  } catch (err) {
    return {
      ok: false,
      erro: err instanceof Error ? err.message : 'Falha de rede ao chamar WhatsApp.',
    }
  }
}

/** Quando não há token: simula envio (dev/demo). */
export function envioSimulado(texto: string): { ok: true; waMessageId: string } {
  return {
    ok: true,
    waMessageId: `sim_${Date.now()}_${texto.slice(0, 8).replace(/\s/g, '')}`,
  }
}
