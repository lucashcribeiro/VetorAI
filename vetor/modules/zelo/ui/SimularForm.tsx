'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/core/ui/Button'
import { Input } from '@/core/ui/Input'
import { simularMensagemEntrada } from '../server/actions'

export function SimularForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await simularMensagemEntrada(fd)
      if (!r.ok) {
        setErro(r.erro)
        return
      }
      if (r.conversaId) {
        router.push(`/tools/zelo/${r.conversaId}`)
      }
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="telefone (wa)" name="waId" defaultValue="5511999990001" hint="só dígitos" />
        <Input label="nome do contato" name="nome" defaultValue="Paciente teste" />
      </div>
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
          name="corpo"
          required
          rows={3}
          defaultValue="Oi, gostaria de agendar uma avaliação. Vocês atendem sábado?"
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
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? 'Processando…' : 'Simular mensagem de entrada'}
      </Button>
    </form>
  )
}
