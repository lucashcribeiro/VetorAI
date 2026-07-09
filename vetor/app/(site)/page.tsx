import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { registry } from '@/modules/registry'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { Card } from '@/core/ui/Card'
import { ModuleCard } from './components/ModuleCard'
import { LeadForm } from './components/LeadForm'

export const metadata: Metadata = {
  title: 'VETOR — ferramentas de IA que o dono opera',
  description:
    'Consultoria de IA para clínicas, corretoras e comércio local. Diagnóstico + ferramentas sob medida: relatórios, WhatsApp, conteúdo e anúncios.',
  openGraph: {
    title: 'VETOR — direção + intensidade',
    description: 'Ferramentas de IA sob medida que o próprio cliente opera.',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function LandingPage() {
  const destaques = registry.slice(0, 4)

  return (
    <main>
      {/* Hero */}
      <section
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '72px 24px 56px',
        }}
      >
        <EyebrowLabel>consultoria de ia · brasil</EyebrowLabel>
        <h1
          style={{
            fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(36px, 5vw, 56px)',
            lineHeight: 1.1,
            margin: '16px 0 20px',
            maxWidth: 720,
            color: 'var(--carvao)',
          }}
        >
          Ferramentas de IA sob medida que o próprio cliente opera.
        </h1>
        <p
          style={{
            margin: '0 0 32px',
            maxWidth: 540,
            fontSize: 18,
            lineHeight: 1.55,
            color: 'var(--pedra)',
          }}
        >
          Diagnóstico honesto, plataforma multi-tenant e módulos que falam a língua do dono — sem
          jargão de mídia na tela inicial.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/contato" style={ctaPrimary}>
            Agendar diagnóstico
          </Link>
          <Link href="/ferramentas" style={ctaSecondary}>
            Ver ferramentas
          </Link>
        </div>
        <p
          style={{
            marginTop: 28,
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'var(--pedra)',
          }}
        >
          direção + intensidade
        </p>
      </section>

      {/* Como funciona */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--areia)', borderBottom: '1px solid var(--areia)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '56px 24px' }}>
          <EyebrowLabel tone="muted">como funciona</EyebrowLabel>
          <h2 style={h2}>Três passos. Sem teatro.</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 20,
              marginTop: 28,
            }}
          >
            {[
              {
                n: '01',
                t: 'Diagnóstico',
                d: 'Entendemos o problema real do negócio — não a moda da semana.',
              },
              {
                n: '02',
                t: 'Ferramentas na plataforma',
                d: 'O que construímos vira módulo no portal do cliente, com isolamento por empresa.',
              },
              {
                n: '03',
                t: 'O dono opera',
                d: 'Aprovação, números e WhatsApp no mesmo lugar. A equipe usa no dia a dia.',
              },
            ].map((step) => (
              <Card key={step.n} tone="osso" padding={24}>
                <div
                  style={{
                    fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: 'var(--vermelho-vetor)',
                    marginBottom: 12,
                  }}
                >
                  {step.n}
                </div>
                <h3
                  style={{
                    margin: '0 0 8px',
                    fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  {step.t}
                </h3>
                <p style={{ margin: 0, color: 'var(--pedra)', fontSize: 14, lineHeight: 1.5 }}>{step.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cardápio preview */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <EyebrowLabel>cardápio</EyebrowLabel>
            <h2 style={{ ...h2, marginTop: 12 }}>Ferramentas plugáveis</h2>
            <p style={{ margin: '8px 0 0', color: 'var(--pedra)', maxWidth: 480 }}>
              O mesmo registry que monta a sidebar do cliente alimenta esta vitrine. Sem prateleira
              falsa.
            </p>
          </div>
          <Link
            href="/ferramentas"
            style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: 12,
              color: 'var(--carvao)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--areia)',
              paddingBottom: 2,
            }}
          >
            ver todas →
          </Link>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
            marginTop: 28,
          }}
        >
          {destaques.map((m) => (
            <ModuleCard key={m.manifest.id} manifest={m.manifest} />
          ))}
        </div>
      </section>

      {/* CTA diagnóstico */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px 80px' }}>
        <Card tone="dark" padding={40} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            <div>
              <EyebrowLabel tone="inverse">próximo passo</EyebrowLabel>
              <h2
                style={{
                  fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: 28,
                  margin: '12px 0 12px',
                  color: 'var(--osso)',
                }}
              >
                Agende um diagnóstico
              </h2>
              <p style={{ margin: 0, color: 'rgba(240,238,232,.72)', lineHeight: 1.55, maxWidth: 400 }}>
                Uma conversa para entender se faz sentido. Sem pitch de software genérico — se não
                houver fit, a gente fala isso.
              </p>
            </div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, color: 'var(--carvao)' }}>
              <LeadForm
                origem="diagnostico"
                submitLabel="Pedir diagnóstico"
                mensagemPlaceholder="Segmento, cidade e a dor principal…"
              />
            </div>
          </div>
        </Card>
      </section>
    </main>
  )
}

const h2: CSSProperties = {
  fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: 28,
  margin: '12px 0 0',
  color: 'var(--carvao)',
}

const ctaPrimary: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontFamily: "var(--font-body), 'Work Sans', sans-serif",
  fontWeight: 600,
  fontSize: 15,
  padding: '14px 24px',
  borderRadius: 8,
  background: 'var(--accent, #E04A1F)',
  color: '#fff',
  textDecoration: 'none',
}

const ctaSecondary: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontFamily: "var(--font-body), 'Work Sans', sans-serif",
  fontWeight: 600,
  fontSize: 15,
  padding: '14px 24px',
  borderRadius: 8,
  border: '1px solid var(--carvao)',
  color: 'var(--carvao)',
  textDecoration: 'none',
  background: 'transparent',
}
