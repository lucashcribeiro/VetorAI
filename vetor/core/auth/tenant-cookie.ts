import 'server-only'
import { cookies } from 'next/headers'

export const TENANT_COOKIE = 'vetor_tenant'

export async function getActiveTenantIdFromCookie(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(TENANT_COOKIE)?.value ?? null
}

export async function setActiveTenantCookie(tenantId: string): Promise<void> {
  const jar = await cookies()
  jar.set(TENANT_COOKIE, tenantId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function clearActiveTenantCookie(): Promise<void> {
  const jar = await cookies()
  jar.delete(TENANT_COOKIE)
}
