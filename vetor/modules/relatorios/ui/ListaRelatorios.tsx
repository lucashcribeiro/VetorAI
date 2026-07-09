import Link from 'next/link'
import { Badge } from '@/core/ui/Badge'
import { Card } from '@/core/ui/Card'
import { mesPorExtenso } from '../lib'
import type { RelatorioGerado } from '@/core/db/generated/client'

function badgeTone(status: string): 'neutral' | 'accent' | 'dark' | 'outline' {
  if (status === 'pronto') return 'dark'
  if (status === 'processando') return 'accent'
  if (status === 'erro') return 'outline'
  return 'neutral'
}

function labelStatus(status: string): string {
  if (status === 'pronto') return 'pronto'
  if (status === 'processando') return 'gerando…'
  if (status === 'erro') return 'falhou'
  return status
}

export function ListaRelatorios({ relatorios }: { relatorios: RelatorioGerado[] }) {
  if (relatorios.length === 0) {
    return (
      <Card tone="osso" padding={28}>
        <p style={{ margin: 0, color: 'var(--pedra)', maxWidth: 480 }}>
          Ainda não há relatórios. Preencha os números do mês (e o CSV, se tiver) e gere o primeiro.
        </p>
      </Card>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {relatorios.map((r) => (
        <Link
          key={r.id}
          href={`/tools/relatorios/${r.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Card
            tone="white"
            elevated
            padding={20}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              transition: 'box-shadow .12s ease',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  marginBottom: 4,
                }}
              >
                {mesPorExtenso(r.mes)}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: 'var(--pedra)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 520,
                }}
              >
                {r.status === 'erro'
                  ? r.erro ?? 'Não foi possível gerar.'
                  : r.resumo ?? (r.status === 'processando' ? 'A IA está escrevendo o resumo…' : '—')}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }}>
              <span
                style={{
                  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: 'var(--pedra)',
                }}
              >
                {new Intl.DateTimeFormat('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'America/Sao_Paulo',
                }).format(r.criadoEm)}
              </span>
              <Badge tone={badgeTone(r.status)}>{labelStatus(r.status)}</Badge>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
