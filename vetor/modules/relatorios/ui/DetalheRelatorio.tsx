'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/core/ui/Button'
import { Badge } from '@/core/ui/Badge'
import { Card } from '@/core/ui/Card'
import { reprocessarRelatorio } from '../server/actions'
import { mesPorExtenso } from '../lib'

export function DetalheRelatorio({
  id,
  mes,
  status,
  resumo,
  erro,
  conteudoHtml,
  arquivoUrl,
}: {
  id: string
  mes: string
  status: string
  resumo: string | null
  erro: string | null
  conteudoHtml: string | null
  arquivoUrl: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  // Poll enquanto processa.
  useEffect(() => {
    if (status !== 'processando') return
    const t = setInterval(() => router.refresh(), 3000)
    return () => clearInterval(t)
  }, [status, router])

  function retry() {
    startTransition(async () => {
      await reprocessarRelatorio(id)
      router.refresh()
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <Link
            href="/tools/relatorios"
            style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--pedra)',
              textDecoration: 'none',
            }}
          >
            ← todos os relatórios
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 'var(--text-h2, 30px)',
              margin: '10px 0 8px',
              lineHeight: 1.2,
            }}
          >
            {mesPorExtenso(mes)}
          </h1>
          <Badge
            tone={
              status === 'pronto' ? 'dark' : status === 'processando' ? 'accent' : 'outline'
            }
          >
            {status === 'pronto' ? 'pronto' : status === 'processando' ? 'gerando…' : 'falhou'}
          </Badge>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {status === 'pronto' && (arquivoUrl || conteudoHtml) && (
            <a
              href={arquivoUrl ?? `/api/relatorios/${id}/download`}
              download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontFamily: "var(--font-body), 'Work Sans', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                padding: '11px 22px',
                borderRadius: 8,
                background: 'var(--accent, #E04A1F)',
                color: '#FFFFFF',
                textDecoration: 'none',
              }}
            >
              Baixar HTML
            </a>
          )}
          {status === 'erro' && (
            <Button variant="secondary" type="button" disabled={pending} onClick={retry}>
              {pending ? 'Reenfileirando…' : 'Tentar de novo'}
            </Button>
          )}
        </div>
      </div>

      {status === 'processando' && (
        <Card tone="osso" padding={28}>
          <p style={{ margin: 0, color: 'var(--carvao)', fontWeight: 500 }}>
            Estamos escrevendo o relatório em linguagem de dono…
          </p>
          <p style={{ margin: '8px 0 0', color: 'var(--pedra)', fontSize: 14 }}>
            Isso costuma levar menos de dois minutos. Esta página atualiza sozinha.
          </p>
        </Card>
      )}

      {status === 'erro' && (
        <Card tone="white" padding={28} style={{ borderColor: 'var(--erro)' }}>
          <p style={{ margin: 0, color: 'var(--erro, #B3261E)' }}>{erro ?? 'Falha na geração.'}</p>
        </Card>
      )}

      {status === 'pronto' && resumo && (
        <Card tone="osso" padding={20}>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--pedra)',
              marginBottom: 8,
            }}
          >
            em uma frase
          </p>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.45 }}>{resumo}</p>
        </Card>
      )}

      {status === 'pronto' && conteudoHtml && (
        <Card tone="white" padding={0} elevated style={{ overflow: 'hidden' }}>
          <iframe
            title={`Relatório ${mesPorExtenso(mes)}`}
            srcDoc={conteudoHtml}
            sandbox=""
            style={{
              width: '100%',
              minHeight: 720,
              border: 'none',
              background: '#F0EEE8',
              display: 'block',
            }}
          />
        </Card>
      )}
    </div>
  )
}
