import Link from 'next/link'
import { Badge } from '@/core/ui/Badge'
import { Card } from '@/core/ui/Card'
import { formatarTempoResposta, labelStatusConversa, mascararTelefone } from '../lib'
import type { ZeloConversa } from '@/core/db/generated/client'

function badgeTone(status: string): 'accent' | 'dark' | 'outline' | 'neutral' {
  if (status === 'aguardando') return 'accent'
  if (status === 'respondida') return 'dark'
  if (status === 'escalada') return 'outline'
  return 'neutral'
}

export function ListaConversas({ conversas }: { conversas: ZeloConversa[] }) {
  if (conversas.length === 0) {
    return (
      <Card tone="osso" padding={28}>
        <p style={{ margin: 0, color: 'var(--pedra)', maxWidth: 480 }}>
          Nenhuma conversa ainda. Quando o WhatsApp estiver ligado, as mensagens aparecem aqui.
          Enquanto isso, use a simulação abaixo para treinar a fila assistida.
        </p>
      </Card>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {conversas.map((c) => (
        <Link
          key={c.id}
          href={`/tools/zelo/${c.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Card
            tone="white"
            elevated
            padding={18}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  marginBottom: 2,
                }}
              >
                {c.nomeContato || mascararTelefone(c.waId)}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: 'var(--pedra)',
                  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                }}
              >
                {mascararTelefone(c.waId)}
                {c.tempoPrimeiraRespostaMs != null
                  ? ` · 1ª resposta em ${formatarTempoResposta(c.tempoPrimeiraRespostaMs)}`
                  : ''}
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
                }).format(c.ultimaMsgEm)}
              </span>
              <Badge tone={badgeTone(c.status)}>{labelStatusConversa(c.status)}</Badge>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
