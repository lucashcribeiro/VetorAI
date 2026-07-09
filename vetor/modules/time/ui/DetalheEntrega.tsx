'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/core/ui/Badge'
import { Button } from '@/core/ui/Button'
import { Card } from '@/core/ui/Card'
import { labelStatusEntrega } from '../lib'
import { aprovarEntregaAction } from '../server/actions'

export function DetalheEntrega({
  id,
  titulo,
  agente,
  tipo,
  status,
  conteudo,
  criadoEm,
}: {
  id: string
  titulo: string | null
  agente: string
  tipo: string
  status: string
  conteudo: string
  criadoEm: string
}) {
  const router = useRouter()
  const [pending, start] = useTransition()

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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0 10px', alignItems: 'center' }}>
        <Badge tone={status === 'aprovado' ? 'dark' : 'accent'}>{labelStatusEntrega(status)}</Badge>
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

      {status === 'rascunho' && (
        <div style={{ marginBottom: 16 }}>
          <Button
            type="button"
            variant="primary"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await aprovarEntregaAction(id)
                router.refresh()
              })
            }
          >
            {pending ? 'Aprovando…' : 'Aprovar (checkpoint Lucas)'}
          </Button>
        </div>
      )}

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
