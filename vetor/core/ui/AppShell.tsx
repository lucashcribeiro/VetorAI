import type { ReactNode, ComponentType } from 'react'
import Link from 'next/link'
import { Logo } from './Logo'
import { NavLink } from './NavLink'
import { IconInicio, IconEquipe, IconAjustes, type IconProps } from './icons'

// AppShell — sidebar + área de conteúdo, fiel ao handoff do Claude Design.
// A navegação NÃO é hardcoded: recebe os módulos ativos (registry × tenant_modules).

export interface NavModule {
  slug: string
  nome: string
  icone: ComponentType<IconProps>
}

export function AppShell({
  tenantNome,
  tenantSegmento,
  modulos,
  topbar,
  children,
}: {
  tenantNome: string
  tenantSegmento: string | null
  modulos: NavModule[]
  topbar?: ReactNode
  children: ReactNode
}) {
  const inicial = tenantNome.trim().charAt(0).toUpperCase() || 'V'

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        className="hidden md:flex"
        style={{
          width: 236,
          flex: 'none',
          background: 'var(--carvao)',
          color: 'var(--osso)',
          flexDirection: 'column',
          padding: '28px 0 24px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ padding: '0 24px 26px' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <Logo variant="full" tone="negative" size={24} />
          </Link>
        </div>

        {/* Chip da empresa */}
        <div
          style={{
            margin: '0 16px 22px',
            padding: '12px 14px',
            background: 'rgba(240,238,232,.07)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              flex: 'none',
              borderRadius: '50%',
              background: 'var(--osso)',
              color: 'var(--carvao)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {inicial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {tenantNome}
            </div>
            {tenantSegmento && (
              <div
                style={{
                  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                  fontSize: 10.5,
                  opacity: 0.55,
                  lineHeight: 1.4,
                }}
              >
                {tenantSegmento}
              </div>
            )}
          </div>
        </div>

        {/* Navegação: Início + módulos ativos do tenant */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
          <NavLink href="/dashboard">
            <IconInicio size={17} style={{ flex: 'none' }} />
            Início
          </NavLink>
          {modulos.map((m) => {
            const Icone = m.icone
            return (
              <NavLink key={m.slug} href={`/tools/${m.slug}`}>
                <Icone size={17} style={{ flex: 'none' }} />
                {m.nome}
              </NavLink>
            )
          })}
        </nav>

        <div style={{ height: 1, background: 'rgba(240,238,232,.14)', margin: '18px 24px' }} />

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
          <NavLink href="/configuracoes/equipe">
            <IconEquipe size={17} style={{ flex: 'none' }} />
            Equipe
          </NavLink>
          <NavLink href="/configuracoes/modulos">
            <IconAjustes size={17} style={{ flex: 'none' }} />
            Ajustes
          </NavLink>
          <NavLink href="/configuracoes/faturamento">
            <IconAjustes size={17} style={{ flex: 'none' }} />
            Faturamento
          </NavLink>
        </nav>

        <div
          style={{
            marginTop: 'auto',
            padding: '0 24px',
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 10.5,
            opacity: 0.45,
            lineHeight: 1.6,
          }}
        >
          vetor · plataforma v0.1
          <br />
          suporte: oi@vetor.com.br
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Barra mobile: logo + conteúdo do topo */}
        <div
          className="flex md:hidden"
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            background: 'var(--carvao)',
          }}
        >
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <Logo variant="full" tone="negative" size={20} />
          </Link>
        </div>

        <main style={{ flex: 1, padding: 'clamp(20px, 4vw, 40px)' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            {topbar}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
