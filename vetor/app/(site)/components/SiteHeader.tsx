import Link from 'next/link'
import { Logo } from '@/core/ui/Logo'

const NAV = [
  { href: '/ferramentas', label: 'Ferramentas' },
  { href: '/contato', label: 'Contato' },
]

export function SiteHeader() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(240,238,232,.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--areia)',
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }} aria-label="VETOR — início">
          <Logo variant="full" tone="positive" size={28} />
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontFamily: "var(--font-body), 'Work Sans', sans-serif",
                fontWeight: 500,
                fontSize: 14,
                color: 'var(--carvao)',
                textDecoration: 'none',
                padding: '8px 12px',
                borderRadius: 8,
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/sign-in"
            style={{
              fontFamily: "var(--font-body), 'Work Sans', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--osso)',
              background: 'var(--carvao)',
              textDecoration: 'none',
              padding: '10px 16px',
              borderRadius: 8,
              marginLeft: 4,
            }}
          >
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  )
}
