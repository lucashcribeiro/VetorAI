import 'server-only'
import { db } from '@/core/db/client'

// Módulos ligados no self-service para o dono ver valor em < 15 min.
export const MODULOS_ONBOARDING = ['relatorios', 'conteudo', 'midia'] as const

export function slugifyEmpresa(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48)
}

/** Garante slug único (sufixo numérico se colidir). */
export async function slugUnico(base: string): Promise<string> {
  let slug = base || 'empresa'
  let n = 0
  while (await db.tenant.findUnique({ where: { slug } })) {
    n += 1
    slug = `${base}-${n}`
  }
  return slug
}
