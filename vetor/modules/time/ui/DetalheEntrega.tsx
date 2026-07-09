'use client'

import Link from 'next/link'
import { Badge } from '@/core/ui/Badge'
import { Card } from '@/core/ui/Card'
import { labelStatusEntrega } from '../lib'

export function DetalheEntrega({
  titulo,
  agente,
  tipo,
  status,
  conteudo,
  criadoEm,
  rodadaId,
}: {
  id: string
  titulo: string | null
  agente: string
  tipo: string
  status: string
  conteudo: string
  criadoEm: string
  rodadaId?: string | null
}) {
  return (
    <div style={{ maxWidth: 800 }}>
      <Link
        href={rodadaId ? `/tools/time/rodada/${rodadaId}` : '/tools/time'}
        style={{
          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          fontSize: 11,
          color: 'var(--pedra)',
          textDecoration: 'none',
        }}
      >
        ← {rodadaId ? 'rodada' : 'time vetor'}
      </Link>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0 10px', alignItems: 'center' }}>
        <Badge tone={status === 'aprovado' ? 'dark' : 'outline'}>
          {labelStatusEntrega(status)}
        </Badge>
        <Badge tone="outline">{agente}</Badge>
        <Badge tone="neutral">{tipo}</Badge>
        <span
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'var(--pedra)',
          }}
        >
          {new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
            timeZone: 'America/Sao_Paulo',
          }).format(new Date(criadoEm))}
        </span>
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 28,
          margin: '0 0 16px',
        }}
      >
        {titulo ?? tipo}
      </h1>
      <Card tone="white" elevated padding={28}>
        <pre
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            fontFamily: "var(--font-body), 'Work Sans', sans-serif",
            fontSize: 14,
            lineHeight: 1.55,
          }}
        >
          {conteudo}
        </pre>
      </Card>
    </div>
  )
}
