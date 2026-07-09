import type { CSSProperties } from 'react'
import Link from 'next/link'
import type { ModuleUiProps } from '../../types'
import { Card } from '@/core/ui/Card'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { Badge } from '@/core/ui/Badge'
import { AGENTES, PIPELINE } from '../agents'
import {
  buscarEntrega,
  buscarRodada,
  listarEntregasRodada,
  listarRodadas,
} from '../db'
import { labelStatusEntrega, labelStatusRodada } from '../lib'
import { IniciarPipelineForm } from './IniciarPipelineForm'
import { TimelineRodada } from './TimelineRodada'
import { DetalheEntrega } from './DetalheEntrega'
import { manifest } from '../manifest'

export default async function TimeUi({ path, tenantId }: ModuleUiProps) {
  // /tools/time/rodada/[id]  ou  /tools/time/[entregaId]
  if (path[0] === 'rodada' && path[1]) {
    return <PaginaRodada tenantId={tenantId} rodadaId={path[1]} />
  }
  if (path[0]) {
    return <PaginaEntrega tenantId={tenantId} id={path[0]} />
  }
  return <PaginaLista tenantId={tenantId} />
}

async function PaginaLista({ tenantId }: { tenantId: string }) {
  const rodadas = await listarRodadas(tenantId, 20)

  return (
    <div>
      <header style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <EyebrowLabel>ferramenta · time vetor</EyebrowLabel>
          <Badge tone="outline">pipeline automática</Badge>
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
        <p style={{ margin: 0, color: 'var(--pedra)', maxWidth: 560, lineHeight: 1.5 }}>
          Você só cola o brief. O time executa sozinho na ordem certa — e o Prisma fecha com QA:
          se algo falhar, volta para quem errou e refaz.
        </p>
      </header>

      {/* Pipeline visual estática (como “imagem” do fluxo) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
          marginBottom: 28,
        }}
      >
        {PIPELINE.map((id, i) => {
          const a = AGENTES.find((x) => x.id === id)!
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Card tone="white" elevated padding={14} style={{ minWidth: 120 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{a.codinome}</div>
                <div
                  style={{
                    fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: 'var(--pedra)',
                    marginTop: 2,
                  }}
                >
                  {id === 'analista_bi' ? 'BI + QA' : a.cargo}
                </div>
              </Card>
              {i < PIPELINE.length - 1 && (
                <span style={{ color: 'var(--pedra)', fontWeight: 700 }}>→</span>
              )}
            </div>
          )
        })}
      </div>

      <Card tone="white" elevated padding={24} style={{ marginBottom: 36, maxWidth: 640 }}>
        <h2 style={h2}>Nova estruturação</h2>
        <IniciarPipelineForm />
      </Card>

      <h2 style={{ ...h2, marginBottom: 14 }}>Rodadas</h2>
      {rodadas.length === 0 ? (
        <Card tone="osso" padding={24}>
          <p style={{ margin: 0, color: 'var(--pedra)' }}>
            Nenhuma rodada ainda. Cole um brief e inicie a estruturação completa.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rodadas.map((r) => (
            <Link
              key={r.id}
              href={`/tools/time/rodada/${r.id}`}
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
                  <div style={{ fontWeight: 600 }}>
                    {r.brief.slice(0, 80)}
                    {r.brief.length > 80 ? '…' : ''}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                      fontSize: 11,
                      color: 'var(--pedra)',
                      marginTop: 4,
                    }}
                  >
                    {new Intl.DateTimeFormat('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                      timeZone: 'America/Sao_Paulo',
                    }).format(r.criadoEm)}
                    {' · '}
                    etapa {r.etapaAtual}
                  </div>
                </div>
                <Badge
                  tone={
                    r.status === 'concluido'
                      ? 'dark'
                      : r.status === 'erro'
                        ? 'accent'
                        : 'outline'
                  }
                >
                  {labelStatusRodada(r.status)}
                </Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

async function PaginaRodada({
  tenantId,
  rodadaId,
}: {
  tenantId: string
  rodadaId: string
}) {
  const rodada = await buscarRodada(tenantId, rodadaId)
  if (!rodada) {
    return (
      <Card tone="white" padding={24}>
        <p style={{ margin: 0 }}>Rodada não encontrada.</p>
      </Card>
    )
  }

  const entregas = await listarEntregasRodada(tenantId, rodadaId)
  const poll =
    rodada.status === 'rodando' ||
    rodada.status === 'qa' ||
    rodada.status === 'retrabalho'
  const log = Array.isArray(rodada.log)
    ? (rodada.log as Array<{ em: string; etapa: string; status: string; detalhe?: string }>)
    : []

  return (
    <div style={{ maxWidth: 800 }}>
      <Link
        href="/tools/time"
        style={{
          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          fontSize: 11,
          color: 'var(--pedra)',
          textDecoration: 'none',
        }}
      >
        ← time vetor
      </Link>
      <h1
        style={{
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 28,
          margin: '12px 0 8px',
        }}
      >
        Estruturação em andamento
      </h1>
      <p style={{ margin: '0 0 24px', color: 'var(--pedra)', fontSize: 14, lineHeight: 1.5 }}>
        {rodada.brief.slice(0, 200)}
        {rodada.brief.length > 200 ? '…' : ''}
      </p>

      <TimelineRodada
        status={rodada.status}
        etapaAtual={rodada.etapaAtual}
        log={log}
        poll={poll}
      />

      {rodada.erro && (
        <Card tone="white" padding={16} style={{ marginTop: 20, border: '1px solid var(--erro)' }}>
          <p style={{ margin: 0, color: 'var(--erro)', whiteSpace: 'pre-wrap' }}>{rodada.erro}</p>
        </Card>
      )}

      <h2 style={{ ...h2, marginTop: 36, marginBottom: 14 }}>Entregas desta rodada</h2>
      {entregas.length === 0 ? (
        <Card tone="osso" padding={20}>
          <p style={{ margin: 0, color: 'var(--pedra)' }}>
            Aguardando o time produzir as primeiras peças…
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...entregas].reverse().map((e) => (
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
                <div>
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
                <Badge tone={e.status === 'aprovado' ? 'dark' : 'outline'}>
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

async function PaginaEntrega({ tenantId, id }: { tenantId: string; id: string }) {
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
      rodadaId={e.rodadaId}
    />
  )
}

const h2: CSSProperties = {
  fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: 18,
  margin: '0 0 8px',
}
