'use client'

import { useActionState } from 'react'
import { Button } from '@/core/ui/Button'
import { Input } from '@/core/ui/Input'
import { convidarMembro, type EquipeResult } from './actions'

export function ConviteForm() {
  const [state, action, pending] = useActionState(convidarMembro, null as EquipeResult | null)

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Input label="nome" name="nome" placeholder="Se for conta nova" />
      <Input label="e-mail" name="email" type="email" required placeholder="pessoa@empresa.com" />
      <Input
        label="senha temporária"
        name="senhaTemp"
        type="password"
        placeholder="só se a conta ainda não existe"
        hint="mín. 8 caracteres · peça para trocar depois"
      />
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 11,
            opacity: 0.65,
          }}
        >
          papel
        </span>
        <select
          name="papel"
          defaultValue="MEMBER"
          style={{
            padding: '11px 14px',
            borderRadius: 8,
            border: '1px solid var(--border-subtle, rgba(0,0,0,.12))',
            fontSize: 14,
          }}
        >
          <option value="MEMBER">Membro</option>
          <option value="OWNER">Dono</option>
        </select>
      </label>
      {state && !state.ok && (
        <p role="alert" style={{ margin: 0, color: 'var(--erro)', fontSize: 14 }}>
          {state.erro}
        </p>
      )}
      {state?.ok && (
        <p style={{ margin: 0, color: 'var(--pedra)', fontSize: 14 }}>Membro adicionado.</p>
      )}
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'Salvando…' : 'Adicionar'}
      </Button>
    </form>
  )
}
