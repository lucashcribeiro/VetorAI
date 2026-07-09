import type { Metadata } from 'next'
import { registry } from '@/modules/registry'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { ModuleCard } from '../components/ModuleCard'

export const metadata: Metadata = {
  title: 'Ferramentas — VETOR',
  description:
    'Cardápio de ferramentas VETOR: Relatórios, Zelo (WhatsApp), Conteúdo e Anúncios. Gerado a partir do registry da plataforma.',
}

export default function FerramentasPage() {
  const disponiveis = registry.filter(
    (m) => m.manifest.status === 'disponivel' || m.manifest.status === 'beta',
  )
  const emBreve = registry.filter((m) => m.manifest.status === 'em_breve')

  return (
    <main style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 24px 80px' }}>
      <EyebrowLabel>cardápio</EyebrowLabel>
      <h1
        style={{
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(32px, 4vw, 44px)',
          margin: '12px 0 12px',
          lineHeight: 1.15,
        }}
      >
        Ferramentas
      </h1>
      <p style={{ margin: '0 0 40px', color: 'var(--pedra)', maxWidth: 520, lineHeight: 1.55 }}>
        Cada item abaixo é um módulo real do monólito — o mesmo que o cliente vê na sidebar depois
        do login. Clicar leva à página de venda; se já estiver logado e o módulo ativo, use a
        plataforma em <strong style={{ color: 'var(--carvao)' }}>/tools</strong>.
      </p>

      {disponiveis.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--pedra)',
              margin: '0 0 16px',
            }}
          >
            disponíveis agora
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 16,
            }}
          >
            {disponiveis.map((m) => (
              <ModuleCard key={m.manifest.id} manifest={m.manifest} />
            ))}
          </div>
        </section>
      )}

      {emBreve.length > 0 && (
        <section>
          <h2
            style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--pedra)',
              margin: '0 0 16px',
            }}
          >
            em breve · valide demanda
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 16,
            }}
          >
            {emBreve.map((m) => (
              <ModuleCard key={m.manifest.id} manifest={m.manifest} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
