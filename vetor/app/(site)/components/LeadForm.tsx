'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { Button } from '@/core/ui/Button'
import { Input } from '@/core/ui/Input'
import { registrarLeadPublico } from '../actions'

export function LeadForm({
  origem,
  moduleId,
  submitLabel = 'Enviar',
  mensagemPlaceholder = 'Conte em uma frase o que você precisa',
}: {
  origem: 'diagnostico' | 'ferramenta' | 'contato'
  moduleId?: string
  submitLabel?: string
  mensagemPlaceholder?: string
}) {
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    const fd = new FormData(e.currentTarget)
    fd.set('origem', origem)
    if (moduleId) fd.set('moduleId', moduleId)
    startTransition(async () => {
      const r = await registrarLeadPublico(fd)
      if (!r.ok) {
        setErro(r.erro)
        return
      }
      setOk(true)
      e.currentTarget.reset()
    })
  }

  if (ok) {
    return (
      <div
        style={{
          padding: 20,
          borderRadius: 10,
          background: 'var(--osso)',
          color: 'var(--carvao)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>Recebemos. Em breve entraremos em contato.</p>
        <p style={{ margin: '8px 0 0', color: 'var(--pedra)', fontSize: 14 }}>
          Sem spam — só a conversa que você pediu.
        </p>
        <button
          type="button"
          onClick={() => setOk(false)}
          style={{
            marginTop: 14,
            background: 'none',
            border: 'none',
            color: 'var(--vermelho-vetor)',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            fontSize: 13,
          }}
        >
          Enviar outro
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="nome" name="nome" placeholder="Seu nome" />
        <Input label="empresa" name="empresa" placeholder="Clínica, corretora…" />
      </div>
      <Input label="e-mail" name="email" type="email" required placeholder="voce@empresa.com.br" />
      <Input label="telefone / whatsapp" name="telefone" placeholder="11 99999-0000" />
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 500,
            opacity: 0.65,
          }}
        >
          mensagem
        </span>
        <textarea
          name="mensagem"
          rows={3}
          placeholder={mensagemPlaceholder}
          style={{
            fontFamily: "var(--font-body), 'Work Sans', sans-serif",
            fontSize: 14,
            borderRadius: 8,
            padding: '11px 14px',
            border: '1px solid var(--border-subtle, rgba(0,0,0,.12))',
            resize: 'vertical',
          }}
        />
      </label>
      {erro && (
        <p role="alert" style={{ margin: 0, color: 'var(--erro)', fontSize: 14 }}>
          {erro}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'Enviando…' : submitLabel}
      </Button>
    </form>
  )
}
