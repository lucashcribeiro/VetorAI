import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getModuleBySlug, registry } from '@/modules/registry'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { Badge } from '@/core/ui/Badge'
import { Card } from '@/core/ui/Card'
import { LeadForm } from '../../components/LeadForm'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return registry.map((m) => ({ slug: m.manifest.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const mod = getModuleBySlug(slug)
  if (!mod) return { title: 'Ferramenta — VETOR' }
  return {
    title: `${mod.manifest.nome} — VETOR`,
    description: mod.manifest.descricao,
    openGraph: {
      title: `${mod.manifest.nome} · VETOR`,
      description: mod.manifest.headlineVenda ?? mod.manifest.descricao,
    },
  }
}

function statusLabel(status: string): string {
  if (status === 'disponivel') return 'disponível'
  if (status === 'beta') return 'beta'
  return 'em breve'
}

export default async function FerramentaVendaPage({ params }: Props) {
  const { slug } = await params
  const mod = getModuleBySlug(slug)
  if (!mod) notFound()

  const { manifest } = mod
  const Icon = manifest.icone
  const emBreve = manifest.status === 'em_breve'
  const beneficios = manifest.beneficios ?? [manifest.descricao]

  return (
    <main style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px 80px' }}>
      <Link
        href="/ferramentas"
        style={{
          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          fontSize: 11,
          color: 'var(--pedra)',
          textDecoration: 'none',
        }}
      >
        ← todas as ferramentas
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 40,
          marginTop: 24,
          alignItems: 'start',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'var(--osso)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Icon size={24} />
            </div>
            <Badge
              tone={
                manifest.status === 'disponivel'
                  ? 'dark'
                  : manifest.status === 'beta'
                    ? 'accent'
                    : 'outline'
              }
            >
              {statusLabel(manifest.status)}
            </Badge>
          </div>
          <EyebrowLabel>
            ferramenta · {manifest.nome.toLowerCase()}
            {manifest.id === 'zelo' ? ' · by vetor' : ''}
          </EyebrowLabel>
          <h1
            style={{
              fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(28px, 4vw, 40px)',
              lineHeight: 1.15,
              margin: '12px 0 16px',
            }}
          >
            {manifest.headlineVenda ?? manifest.nome}
          </h1>
          <p style={{ margin: '0 0 28px', color: 'var(--pedra)', fontSize: 17, lineHeight: 1.55 }}>
            {manifest.descricao}
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {beneficios.map((b) => (
              <li
                key={b}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  fontSize: 15,
                  lineHeight: 1.45,
                }}
              >
                <span style={{ color: 'var(--vermelho-vetor)', fontWeight: 700, flex: 'none' }}>·</span>
                {b}
              </li>
            ))}
          </ul>

          {!emBreve && (
            <p style={{ marginTop: 28, fontSize: 14, color: 'var(--pedra)' }}>
              Já é cliente?{' '}
              <Link href={`/tools/${manifest.slug}`} style={{ color: 'var(--carvao)', fontWeight: 600 }}>
                Abrir na plataforma
              </Link>{' '}
              (requer login e módulo ativo).
            </p>
          )}
        </div>

        <Card tone="white" elevated padding={28}>
          <h2
            style={{
              fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 20,
              margin: '0 0 8px',
            }}
          >
            {emBreve ? 'Tenho interesse' : 'Agendar diagnóstico'}
          </h2>
          <p style={{ margin: '0 0 20px', color: 'var(--pedra)', fontSize: 14, lineHeight: 1.5 }}>
            {emBreve
              ? 'Essa ferramenta ainda não está no ar. Deixe seu contato — usamos isso para priorizar o roadmap.'
              : 'Quer essa ferramenta no seu negócio? Começamos por um diagnóstico curto.'}
          </p>
          <LeadForm
            origem={emBreve ? 'ferramenta' : 'diagnostico'}
            moduleId={manifest.id}
            submitLabel={emBreve ? 'Quero ser avisado' : 'Agendar diagnóstico'}
            mensagemPlaceholder={
              emBreve
                ? 'Por que essa ferramenta importa pra você?'
                : 'Conte o segmento e o que dói hoje…'
            }
          />
        </Card>
      </div>
    </main>
  )
}
