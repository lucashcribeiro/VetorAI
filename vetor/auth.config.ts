import type { NextAuthConfig } from 'next-auth'

// Config edge-safe (sem Prisma/bcrypt) — usada no middleware.
export const authConfig = {
  pages: {
    signIn: '/sign-in',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const isLoggedIn = !!auth?.user

      const isProtected =
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/tools') ||
        pathname.startsWith('/configuracoes') ||
        pathname.startsWith('/suporte') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/selecionar-empresa') ||
        pathname.startsWith('/api/relatorios')

      if (isProtected && !isLoggedIn) return false
      if (
        isLoggedIn &&
        (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up'))
      ) {
        return Response.redirect(new URL('/dashboard', request.nextUrl))
      }
      return true
    },
  },
  trustHost: true,
} satisfies NextAuthConfig
