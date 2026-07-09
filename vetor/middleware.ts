import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Protege tudo que é (platform) e (admin); site público e webhooks ficam livres.
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/tools(.*)',
  '/configuracoes(.*)',
  '/suporte(.*)',
  '/admin(.*)',
  '/selecionar-empresa(.*)',
  '/api/relatorios(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    // Pula internals do Next e arquivos estáticos, exceto quando em query
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Sempre roda para rotas de API
    '/(api|trpc)(.*)',
  ],
}
