'use client'

import { useState, useTransition, type CSSProperties, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/core/ui/Button'
import { AGENTES, type AgenteId } from '../agents'
import { rodarAgenteAction } from '../server/actions'

export function RodarAgenteForm({ agenteInicial }: { agenteInicial?: AgenteId }) {
  const router = useRouter()
  const [agenteId, setAgenteId] = useState<AgenteId>(agenteInicial ?? 'estrategista')
  const [pending, start] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const def = AGENTES.find((a) => a.id === agenteId)!

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const r = await rodarAgenteAction(fd)
      if (!r.ok) {
        setErro(r.erro)
        return
      }
      if (r.entregaId) router.push(`/tools/time/${r.entregaId}`)
      else router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>funcionário</span>
        <select
          name="agenteId"
          value={agenteId}
          onChange={(e) => setAgenteId(e.target.value as AgenteId)}
          style={selectStyle}
        >
          {AGENTES.map((a) => (
            <option key={a.id} value={a.id}>
              {a.codinome} — {a.cargo}
            </option>
          ))}
        </select>
        <span style={{ fontSize: 12, color: 'var(--pedra)' }}>{def.descricao}</span>
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>tipo de entregável</span>
        <select name="tipo" defaultValue={def.tipoPadrao} key={agenteId} style={selectStyle}>
          {def.tipos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>brief</span>
        <textarea
          name="brief"
          required
          rows={6}
          placeholder="Cliente, o que vende, região, verba, objetivo, diferenciais reais, o que já tentou…"
          style={{
            fontFamily: "var(--font-body), 'Work Sans', sans-serif",
            fontSize: 14,
            borderRadius: 8,
            padding: '12px 14px',
            border: '1px solid var(--border-subtle, rgba(0,0,0,.12))',
            resize: 'vertical',
          }}
        />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--pedra)' }}>
        <input type="checkbox" name="forcar" value="1" />
        Forçar sem dependências (pular mapa/copy aprovados)
      </label>

      {erro && (
        <p role="alert" style={{ margin: 0, color: 'var(--erro)', fontSize: 14 }}>
          {erro}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'O time está trabalhando…' : `Acionar ${def.codinome}`}
      </Button>
    </form>
  )
}

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
  fontSize: 11,
  fontWeight: 500,
  opacity: 0.65,
}

const selectStyle: CSSProperties = {
  padding: '11px 14px',
  borderRadius: 8,
  border: '1px solid var(--border-subtle, rgba(0,0,0,.12))',
  fontSize: 14,
  background: '#fff',
}
