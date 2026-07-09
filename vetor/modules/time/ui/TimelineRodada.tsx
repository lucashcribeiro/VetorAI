'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/core/ui/Badge'
import { Card } from '@/core/ui/Card'
import { PIPELINE, getAgente, labelEtapa } from '../agents'
import { labelStatusRodada } from '../lib'

export function TimelineRodada({
  status,
  etapaAtual,
  log,
  poll,
}: {
  status: string
  etapaAtual: string
  log: Array<{ em: string; etapa: string; status: string; detalhe?: string }>
  poll: boolean
}) {
  const router = useRouter()

  useEffect(() => {
    if (!poll) return
    const t = setInterval(() => router.refresh(), 4000)
    return () => clearInterval(t)
  }, [poll, router])

  const idxAtual = PIPELINE.indexOf(etapaAtual as (typeof PIPELINE)[number])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Badge
          tone={
            status === 'concluido' ? 'dark' : status === 'erro' ? 'accent' : 'outline'
          }
        >
          {labelStatusRodada(status)}
        </Badge>
        {status === 'rodando' || status === 'qa' || status === 'retrabalho' ? (
          <span
            style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--pedra)',
            }}
          >
            agora: {labelEtapa(etapaAtual)} · atualiza sozinho
          </span>
        ) : null}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {PIPELINE.map((id, i) => {
          const a = getAgente(id)!
          const done =
            status === 'concluido' ||
            (idxAtual > i && status !== 'erro') ||
            log.some((l) => l.etapa === id && (l.status === 'ok' || l.status === 'retrabalho' || l.status === 'qa_ok'))
          const active =
            (status === 'rodando' || status === 'qa' || status === 'retrabalho') &&
            etapaAtual === id
          const failed = status === 'erro' && etapaAtual === id

          return (
            <div
              key={id}
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'stretch',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 24,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: failed
                      ? 'var(--erro)'
                      : done
                        ? 'var(--carvao)'
                        : active
                          ? 'var(--vermelho-vetor)'
                          : 'var(--areia)',
                    boxShadow: active ? '0 0 0 4px rgba(224,74,31,.2)' : undefined,
                  }}
                />
                {i < PIPELINE.length - 1 && (
                  <div
                    style={{
                      width: 2,
                      flex: 1,
                      minHeight: 28,
                      background: done ? 'var(--carvao)' : 'var(--areia)',
                    }}
                  />
                )}
              </div>
              <div style={{ paddingBottom: 20 }}>
                <div style={{ fontWeight: 700 }}>{a.codinome}</div>
                <div
                  style={{
                    fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: 'var(--pedra)',
                  }}
                >
                  {a.cargo}
                  {id === 'analista_bi' ? ' · QA de qualidade' : ''}
                </div>
                <div style={{ fontSize: 13, color: 'var(--pedra)', marginTop: 4 }}>
                  {failed
                    ? 'falhou'
                    : active
                      ? id === 'analista_bi'
                        ? 'revisando o pacote…'
                        : 'trabalhando…'
                      : done
                        ? 'feito'
                        : 'na fila'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {log.length > 0 && (
        <Card tone="osso" padding={16}>
          <div
            style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--pedra)',
              marginBottom: 10,
            }}
          >
            trilha
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...log].reverse().slice(0, 12).map((l, i) => (
              <div key={`${l.em}-${i}`} style={{ fontSize: 13, lineHeight: 1.4 }}>
                <strong>{labelEtapa(l.etapa)}</strong>
                {' · '}
                <span style={{ color: 'var(--pedra)' }}>{l.status}</span>
                {l.detalhe ? (
                  <div style={{ color: 'var(--pedra)', fontSize: 12, marginTop: 2 }}>
                    {l.detalhe.slice(0, 280)}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
