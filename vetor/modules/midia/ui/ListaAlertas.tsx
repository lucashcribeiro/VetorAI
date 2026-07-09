'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/core/ui/Badge'
import { Button } from '@/core/ui/Button'
import { Card } from '@/core/ui/Card'
import { labelSeveridade, labelStatusAlerta } from '../lib'
import { resolverAlertaAction } from '../server/actions'

export interface AlertaView {
  id: string
  campanha: string
  tipo: string
  severidade: string
  mensagem: string
  status: string
  criadoEm: string
}

function sevTone(s: string): 'accent' | 'dark' | 'outline' | 'neutral' {
  if (s === 'critico') return 'accent'
  if (s === 'atencao') return 'outline'
  return 'neutral'
}

export function ListaAlertas({ alertas }: { alertas: AlertaView[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  if (alertas.length === 0) {
    return (
      <Card tone="osso" padding={24}>
        <p style={{ margin: 0, color: 'var(--pedra)' }}>
          Nenhum alerta. Quando o custo por contato subir ou o gasto não trouxer gente, aparece
          aqui — em língua de dono.
        </p>
      </Card>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {alertas.map((a) => (
        <Card key={a.id} tone="white" elevated padding={18}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10, alignItems: 'center' }}>
            <Badge tone={sevTone(a.severidade)}>{labelSeveridade(a.severidade)}</Badge>
            <Badge tone={a.status === 'aberto' ? 'dark' : 'outline'}>
              {labelStatusAlerta(a.status)}
            </Badge>
            <span
              style={{
                fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                fontSize: 11,
                color: 'var(--pedra)',
              }}
            >
              {a.campanha} ·{' '}
              {new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Sao_Paulo',
              }).format(new Date(a.criadoEm))}
            </span>
          </div>
          <p style={{ margin: 0, lineHeight: 1.5, fontSize: 15 }}>{a.mensagem}</p>
          {a.status === 'aberto' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await resolverAlertaAction(a.id, 'resolvido')
                    router.refresh()
                  })
                }
              >
                Resolvido
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await resolverAlertaAction(a.id, 'ignorado')
                    router.refresh()
                  })
                }
              >
                Ignorar
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
