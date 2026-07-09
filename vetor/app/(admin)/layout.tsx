import type { ReactNode } from 'react'
import Link from 'next/link'
import { requireSuperAdmin } from '@/core/auth/guards'
import { Logo } from '@/core/ui/Logo'

// Área (admin) — só eu (SUPER_ADMIN via publicMetadata do Clerk).
// ADR-004: aqui vive a saúde dos tenants, nunca os dados operacionais deles.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireSuperAdmin()

  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        style={{
          background: 'var(--carvao)',
          color: 'var(--osso)',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <Link href="/admin" style={{ textDecoration: 'none' }}>
          <Logo variant="full" tone="negative" size={20} />
        </Link>
        <span
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'var(--vermelho-vetor)',
          }}
        >
          admin
        </span>
        <nav style={{ display: 'flex', gap: 18, marginLeft: 'auto', fontSize: 13.5 }}>
          <Link href="/admin" style={{ color: 'var(--osso)', opacity: 0.85 }}>
            Saúde
          </Link>
          <Link href="/admin/tenants" style={{ color: 'var(--osso)', opacity: 0.85 }}>
            Tenants
          </Link>
          <Link href="/dashboard" style={{ color: 'var(--osso)', opacity: 0.55 }}>
            ← plataforma
          </Link>
        </nav>
      </header>
      <main style={{ padding: 'clamp(20px, 4vw, 40px)', maxWidth: 1080, margin: '0 auto' }}>
        {children}
      </main>
    </div>
  )
}
