'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/core/ui/Button'
import { Badge } from '@/core/ui/Badge'
import { Card } from '@/core/ui/Card'
import {
  formatarTempoResposta,
  labelStatusConversa,
  mascararTelefone,
} from '../lib'
import {
  aprovarRespostaAction,
  escalarAction,
  regenerarSugestaoAction,
} from '../server/actions'

export interface MsgView {
  id: string
  direcao: string
  corpo: string
  status: string
  criadoEm: string
}

export function DetalheConversa({
  conversaId,
  nomeContato,
  waId,
  status,
  tempoPrimeiraRespostaMs,
  mensagens,
  sugestaoPendente,
}: {
  conversaId: string
  nomeContato: string | null
  waId: string
  status: string
  tempoPrimeiraRespostaMs: number | null
  mensagens: MsgView[]
  sugestaoPendente: MsgView | null
}) {
  const router = useRouter()
  const [texto, setTexto] = useState(sugestaoPendente?.corpo ?? '')
  const [seedId, setSeedId] = useState(sugestaoPendente?.id ?? '')
  const [erro, setErro] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const sugId = sugestaoPendente?.id ?? ''

  useEffect(() => {
    if (sugestaoPendente && sugestaoPendente.id !== seedId) {
      setSeedId(sugestaoPendente.id)
      setTexto(sugestaoPendente.corpo)
    }
  }, [sugestaoPendente, seedId])

  function enviar() {
    setErro(null)
    const fd = new FormData()
    fd.set('conversaId', conversaId)
    fd.set('texto', texto)
    if (sugId) fd.set('sugestaoId', sugId)
    startTransition(async () => {
      const r = await aprovarRespostaAction(fd)
      if (!r.ok) setErro(r.erro)
      else {
        setTexto('')
        router.refresh()
      }
    })
  }

  function escalar() {
    setErro(null)
    const fd = new FormData()
    fd.set('conversaId', conversaId)
    fd.set('motivo', 'Secretária assumiu o atendimento')
    startTransition(async () => {
      const r = await escalarAction(fd)
      if (!r.ok) setErro(r.erro)
      else router.refresh()
    })
  }

  function regenerar() {
    setErro(null)
    startTransition(async () => {
      const r = await regenerarSugestaoAction(conversaId)
      if (!r.ok) setErro(r.erro)
      else {
        router.refresh()
      }
    })
  }

  const thread = mensagens.filter((m) => m.direcao === 'entrada' || m.direcao === 'saida')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
      <div>
        <Link
          href="/tools/zelo"
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'var(--pedra)',
            textDecoration: 'none',
          }}
        >
          ← fila do zelo
        </Link>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginTop: 10,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 'var(--text-h2, 30px)',
                margin: '0 0 6px',
              }}
            >
              {nomeContato || mascararTelefone(waId)}
            </h1>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                fontSize: 12,
                color: 'var(--pedra)',
              }}
            >
              {mascararTelefone(waId)}
              {tempoPrimeiraRespostaMs != null
                ? ` · 1ª resposta em ${formatarTempoResposta(tempoPrimeiraRespostaMs)}`
                : ''}
            </p>
          </div>
          <Badge
            tone={
              status === 'aguardando' ? 'accent' : status === 'respondida' ? 'dark' : 'outline'
            }
          >
            {labelStatusConversa(status)}
          </Badge>
        </div>
      </div>

      <Card tone="white" elevated padding={20}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {thread.length === 0 && (
            <p style={{ margin: 0, color: 'var(--pedra)' }}>Sem mensagens ainda.</p>
          )}
          {thread.map((m) => {
            const entrada = m.direcao === 'entrada'
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: entrada ? 'flex-start' : 'flex-end',
                  maxWidth: '85%',
                  background: entrada ? 'var(--osso)' : 'var(--carvao)',
                  color: entrada ? 'var(--carvao)' : 'var(--osso)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontSize: 14,
                  lineHeight: 1.45,
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.corpo}</div>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                    fontSize: 10,
                    opacity: 0.65,
                  }}
                >
                  {entrada ? 'contato' : m.status === 'erro' ? 'falha no envio' : 'equipe'}
                  {' · '}
                  {new Intl.DateTimeFormat('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo',
                  }).format(new Date(m.criadoEm))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {status !== 'escalada' && (
        <Card tone="osso" padding={22}>
          <p
            style={{
              margin: '0 0 10px',
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--pedra)',
            }}
          >
            sugestão do zelo · revise antes de enviar
          </p>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={4}
            placeholder={
              sugestaoPendente
                ? undefined
                : 'Sem sugestão ainda — escreva a resposta ou regenere com IA.'
            }
            style={{
              width: '100%',
              boxSizing: 'border-box',
              fontFamily: "var(--font-body), 'Work Sans', sans-serif",
              fontSize: 14,
              borderRadius: 8,
              padding: '12px 14px',
              border: '1px solid var(--areia)',
              resize: 'vertical',
              background: '#fff',
            }}
          />
          {erro && (
            <p role="alert" style={{ margin: '10px 0 0', color: 'var(--erro)', fontSize: 14 }}>
              {erro}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
            <Button type="button" variant="primary" disabled={pending || !texto.trim()} onClick={enviar}>
              {pending ? 'Enviando…' : 'Aprovar e enviar'}
            </Button>
            <Button type="button" variant="secondary" disabled={pending} onClick={regenerar}>
              Nova sugestão
            </Button>
            <Button type="button" variant="ghost" disabled={pending} onClick={escalar}>
              Assumir (escalar)
            </Button>
          </div>
        </Card>
      )}

      {status === 'escalada' && (
        <Card tone="white" padding={20}>
          <p style={{ margin: 0, color: 'var(--pedra)' }}>
            Conversa com a equipe humana. O Zelo não sugere mais respostas até nova mensagem do
            contato (volta para a fila).
          </p>
        </Card>
      )}
    </div>
  )
}
