import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

// Middleware leve (edge): só checa sessão JWT, sem Prisma.
export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
