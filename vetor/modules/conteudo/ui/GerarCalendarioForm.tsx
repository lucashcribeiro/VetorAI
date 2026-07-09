'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/core/ui/Button'
import { Input } from '@/core/ui/Input'
import { gerarCalendarioAction } from '../server/actions'

export function GerarCalendarioForm({ semanaDefault }: { semanaDefault: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    setOk(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const r = await gerarCalendarioAction(fd)
      if (!r.ok) {
        setErro(r.erro)
        return
      }
      setOk(`${r.qtd ?? 0} posts gerados — revise e aprove.`)
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
      <Input
        label="semana (segunda)"
        name="semanaInicio"
        type="date"
        defaultValue={semanaDefault}
        required
        style={{ minWidth: 180 }}
      />
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'Gerando pauta…' : 'Gerar calendário da semana'}
      </Button>
      {erro && (
        <p role="alert" style={{ margin: 0, width: '100%', color: 'var(--erro)', fontSize: 14 }}>
          {erro}
        </p>
      )}
      {ok && (
        <p style={{ margin: 0, width: '100%', color: 'var(--pedra)', fontSize: 14 }}>{ok}</p>
      )}
    </form>
  )
}
