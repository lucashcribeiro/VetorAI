import type { CSSProperties } from 'react'
import Link from 'next/link'
import type { ModuleUiProps } from '../../types'
import { Card } from '@/core/ui/Card'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { Badge } from '@/core/ui/Badge'
import { AGENTES } from '../agents'
import { listarEntregas, buscarEntrega } from '../db'
import { labelStatusEntrega } from '../lib'
import { RodarAgenteForm } from './RodarAgenteForm'
import { DetalheEntrega } from './DetalheEntrega'
import { manifest } from '../manifest'

export default async function TimeUi({ path, tenantId }: ModuleUiProps) {
  const [seg] = path
  if (seg) {
    return <PaginaDetalhe tenantId={tenantId} id={seg} />
  }
  return <PaginaLista tenantId={tenantId} />
}

async function PaginaLista({ tenantId }: { tenantId: string }) {
  const entregas = await listarEntregas(tenantId, { limit: 40 })

  return (
    <div>
      <header style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <EyebrowLabel>ferramenta · time vetor</EyebrowLabel>
          <Badge tone="outline">5 funcionários</Badge>
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
        <p style={{ margin: 0, color: 'var(--pedra)', maxWidth: 560 }}>{manifest.descricao}</p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {AGENTES.map((a) => (
          <Card key={a.id} tone="white" elevated padding={16}>
            <div
              style={{
                fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {a.codinome}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                fontSize: 11,
                color: 'var(--pedra)',
                marginTop: 4,
              }}
            >
              {a.cargo}
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--pedra)', lineHeight: 1.4 }}>
              {a.descricao}
            </p>
          </Card>
        ))}
      </div>

      <Card tone="white" elevated padding={24} style={{ marginBottom: 36, maxWidth: 640 }}>
        <h2 style={h2}>Acionar o time</h2>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--pedra)' }}>
          Ordem padrão: Atlas (estratégia) → Lumen (copy) → Vetor Mídia. Órbita monta plano/sumário.
          Prisma reporta com números. Cada entrega sai em <strong>rascunho</strong> até você
          aprovar.
        </p>
        <RodarAgenteForm />
      </Card>

      <h2 style={{ ...h2, marginBottom: 14 }}>Entregas</h2>
      {entregas.length === 0 ? (
        <Card tone="osso" padding={24}>
          <p style={{ margin: 0, color: 'var(--pedra)' }}>
            Nenhuma entrega ainda. Preencha o dossiê e acione o Atlas com um brief completo.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entregas.map((e) => (
            <Link
              key={e.id}
              href={`/tools/time/${e.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Card
                tone="white"
                elevated
                padding={16}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{e.titulo ?? e.tipo}</div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                      fontSize: 11,
                      color: 'var(--pedra)',
                      marginTop: 4,
                    }}
                  >
                    {e.agente} · {e.tipo}
                  </div>
                </div>
                <Badge tone={e.status === 'aprovado' ? 'dark' : 'accent'}>
                  {labelStatusEntrega(e.status)}
                </Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

async function PaginaDetalhe({ tenantId, id }: { tenantId: string; id: string }) {
  const e = await buscarEntrega(tenantId, id)
  if (!e) {
    return (
      <Card tone="white" padding={24}>
        <p style={{ margin: 0 }}>Entrega não encontrada.</p>
      </Card>
    )
  }
  return (
    <DetalheEntrega
      id={e.id}
      titulo={e.titulo}
      agente={e.agente}
      tipo={e.tipo}
      status={e.status}
      conteudo={e.conteudo}
      criadoEm={e.criadoEm.toISOString()}
    />
  )
}

const h2: CSSProperties = {
  fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: 18,
  margin: '0 0 8px',
}
