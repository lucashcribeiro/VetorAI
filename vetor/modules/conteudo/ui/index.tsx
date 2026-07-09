import type { ModuleUiProps } from '../../types'
import { Card } from '@/core/ui/Card'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { Badge } from '@/core/ui/Badge'
import { contarPendentes, listarPosts } from '../db'
import { labelSemana, segundaDaSemana } from '../lib'
import { GerarCalendarioForm } from './GerarCalendarioForm'
import { FilaPosts } from './FilaPosts'
import { manifest } from '../manifest'

export default async function ConteudoUi({ tenantId }: ModuleUiProps) {
  const semana = segundaDaSemana()
  const [posts, pendentes] = await Promise.all([
    listarPosts(tenantId),
    contarPendentes(tenantId),
  ])

  const semanas = [...new Set(posts.map((p) => p.semanaInicio))]

  return (
    <div>
      <header style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <EyebrowLabel>ferramenta · conteúdo</EyebrowLabel>
          <Badge tone="outline">aprovação em lote</Badge>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 'var(--text-h1, 36px)',
            margin: '0 0 8px',
            lineHeight: 1.15,
          }}
        >
          {manifest.nome}
        </h1>
        <p style={{ margin: 0, color: 'var(--pedra)', maxWidth: 520 }}>{manifest.descricao}</p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 28,
        }}
      >
        <Card tone="white" elevated padding={18}>
          <div
            style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--pedra)',
              marginBottom: 6,
            }}
          >
            aguardando aprovação
          </div>
          <div
            style={{
              fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 28,
            }}
          >
            {pendentes}
          </div>
        </Card>
        <Card tone="white" elevated padding={18}>
          <div
            style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--pedra)',
              marginBottom: 6,
            }}
          >
            semana atual
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{labelSemana(semana)}</div>
        </Card>
      </div>

      <Card tone="white" elevated padding={24} style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            margin: '0 0 14px',
          }}
        >
          Nova pauta
        </h2>
        <p style={{ margin: '0 0 16px', color: 'var(--pedra)', fontSize: 14, maxWidth: 520 }}>
          A IA usa o dossiê e o segmento da empresa (conformidade CFO para dental, SUSEP para
          seguros). Nada publica sozinho.
        </p>
        <GerarCalendarioForm semanaDefault={semana} />
      </Card>

      {semanas.length > 0 && (
        <p
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'var(--pedra)',
            marginBottom: 12,
          }}
        >
          semanas na fila: {semanas.map(labelSemana).join(' · ')}
        </p>
      )}

      <FilaPosts
        posts={posts.map((p) => ({
          id: p.id,
          titulo: p.titulo,
          texto: p.texto,
          hashtags: p.hashtags,
          status: p.status,
          canal: p.canal,
          agendadoPara: p.agendadoPara?.toISOString() ?? null,
          semanaInicio: p.semanaInicio,
        }))}
      />
    </div>
  )
}
