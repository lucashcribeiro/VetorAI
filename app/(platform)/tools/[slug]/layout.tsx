import type { ReactNode } from 'react'

// Camada fina de propósito: o guard real (módulo existe? está ativo?)
// roda na page, que resolve slug + tenant. Aqui vive só o error boundary
// (error.tsx irmão) — erro num módulo não derruba o shell da plataforma.
export default function ToolLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
