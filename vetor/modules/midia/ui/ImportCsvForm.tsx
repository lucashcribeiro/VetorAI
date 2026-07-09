'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/core/ui/Button'
import { importarCsvAction, reanalisarAction } from '../server/actions'

export function ImportCsvForm() {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const r = await importarCsvAction(fd)
      if (!r.ok) {
        setErro(r.erro)
        return
      }
      setMsg(
        `${r.linhas} linhas importadas` +
          (r.alertas ? ` · ${r.alertas} alerta(s) novo(s)` : ' · sem alerta novo'),
      )
      router.refresh()
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <input
          name="csv"
          type="file"
          accept=".csv,text/csv"
          required
          style={{ fontSize: 13, color: 'var(--pedra)' }}
        />
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Analisando…' : 'Importar e analisar'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setErro(null)
              setMsg(null)
              const r = await reanalisarAction()
              if (!r.ok) setErro(r.erro)
              else {
                setMsg(`Reanálise: ${r.alertas ?? 0} alerta(s) novo(s).`)
                router.refresh()
              }
            })
          }
        >
          Reanalisar histórico
        </Button>
      </form>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--pedra)', maxWidth: 520 }}>
        Exporte do Meta Ads ou Google Ads (campanha, data, gasto, resultados/leads). A API da Meta
        entra na próxima etapa — o padrão de alertas já é o mesmo.
      </p>
      {erro && (
        <p role="alert" style={{ margin: 0, color: 'var(--erro)', fontSize: 14 }}>
          {erro}
        </p>
      )}
      {msg && <p style={{ margin: 0, color: 'var(--pedra)', fontSize: 14 }}>{msg}</p>}
    </div>
  )
}
