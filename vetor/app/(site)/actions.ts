'use server'

import { db } from '@/core/db/client'

export type LeadResult = { ok: true } | { ok: false; erro: string }

function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Lead público (sem login): interesse em ferramenta, diagnóstico ou contato.
 * Grava em `leads` e loga no console (notificação por e-mail fica para Resend).
 */
export async function registrarLeadPublico(formData: FormData): Promise<LeadResult> {
  const nome = String(formData.get('nome') ?? '').trim() || null
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const telefone = String(formData.get('telefone') ?? '').trim() || null
  const empresa = String(formData.get('empresa') ?? '').trim() || null
  const origem = String(formData.get('origem') ?? 'contato').trim()
  const moduleId = String(formData.get('moduleId') ?? '').trim() || null
  const mensagem = String(formData.get('mensagem') ?? '').trim() || null

  if (!email || !emailValido(email)) {
    return { ok: false, erro: 'Informe um e-mail válido.' }
  }
  if (!['diagnostico', 'ferramenta', 'contato'].includes(origem)) {
    return { ok: false, erro: 'Origem inválida.' }
  }

  try {
    const lead = await db.lead.create({
      data: {
        nome,
        email,
        telefone,
        empresa,
        origem,
        moduleId,
        mensagem,
      },
    })

    // Notificação mínima até haver Resend: log estruturado (visível na Vercel).
    console.info('[lead]', {
      id: lead.id,
      origem,
      moduleId,
      email,
      empresa,
      nome,
    })

    return { ok: true }
  } catch (err) {
    console.error('[lead] falha ao gravar', err)
    return { ok: false, erro: 'Não foi possível enviar agora. Tente de novo em instantes.' }
  }
}
