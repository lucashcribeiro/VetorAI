import type { CSSProperties } from 'react'
import Link from 'next/link'
import { Logo } from '@/core/ui/Logo'

export function SiteFooter() {
  return (
    <footer
      style={{
        marginTop: 80,
        background: 'var(--carvao)',
        color: 'var(--osso)',
        padding: '48px 24px 32px',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 32,
            marginBottom: 40,
          }}
        >
          <div>
            <Logo variant="full" tone="negative" size={26} />
            <p style={{ margin: '14px 0 0', maxWidth: 320, color: 'rgba(240,238,232,.7)', fontSize: 14 }}>
              Consultoria de IA para pequenas empresas. Ferramentas sob medida que o próprio
              cliente opera.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 40 }}>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: 'rgba(240,238,232,.5)',
                  marginBottom: 12,
                }}
              >
                site
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/ferramentas" style={linkStyle}>
                  Ferramentas
                </Link>
                <Link href="/contato" style={linkStyle}>
                  Contato
                </Link>
                <Link href="/sign-in" style={linkStyle}>
                  Entrar na plataforma
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            borderTop: '1px solid rgba(240,238,232,.12)',
            paddingTop: 20,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 12,
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'rgba(240,238,232,.45)',
          }}
        >
          <span>© {new Date().getFullYear()} VETOR · direção + intensidade</span>
          <span>feito no brasil</span>
        </div>
      </div>
    </footer>
  )
}

const linkStyle: CSSProperties = {
  color: 'var(--osso)',
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 500,
}
