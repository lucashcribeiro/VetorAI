'use server'

import { hash } from 'bcryptjs'
import { AuthError } from 'next-auth'
import { signIn, signOut } from '@/auth'
import { db } from '@/core/db/client'
import { clearActiveTenantCookie } from '@/core/auth/tenant-cookie'

export type AuthFormResult = { ok: false; erro: string } | { ok: true }

export async function loginAction(
  _prev: AuthFormResult | null,
  formData: FormData,
): Promise<AuthFormResult> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { ok: false, erro: 'Informe e-mail e senha.' }
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, erro: 'E-mail ou senha incorretos.' }
    }
    // signIn redireciona com NEXT_REDIRECT — rethrow
    throw err
  }
  return { ok: true }
}

export async function registerAction(
  _prev: AuthFormResult | null,
  formData: FormData,
): Promise<AuthFormResult> {
  const nome = String(formData.get('nome') ?? '').trim()
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!nome || !email || !password) {
    return { ok: false, erro: 'Preencha nome, e-mail e senha.' }
  }
  if (password.length < 8) {
    return { ok: false, erro: 'Senha com pelo menos 8 caracteres.' }
  }

  const existe = await db.user.findUnique({ where: { email } })
  if (existe) {
    return { ok: false, erro: 'Já existe conta com este e-mail.' }
  }

  await db.user.create({
    data: {
      nome,
      email,
      passwordHash: await hash(password, 12),
      role: 'MEMBER',
    },
  })

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/selecionar-empresa',
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, erro: 'Conta criada, mas o login falhou. Tente entrar.' }
    }
    throw err
  }
  return { ok: true }
}

export async function logoutAction() {
  await clearActiveTenantCookie()
  await signOut({ redirectTo: '/' })
}
