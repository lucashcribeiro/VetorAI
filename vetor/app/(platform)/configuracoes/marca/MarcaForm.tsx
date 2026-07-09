'use client'

import { useActionState } from 'react'
import { Button } from '@/core/ui/Button'
import { Input } from '@/core/ui/Input'
import { salvarMarcaAction, type MarcaResult } from './actions'

export function MarcaForm({
  logoUrl,
  corPrimaria,
}: {
  logoUrl: string | null
  corPrimaria: string | null
}) {
  const [state, action, pending] = useActionState(salvarMarcaAction, null as MarcaResult | null)

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480 }}>
      <Input
        label="url do logo"
        name="logoUrl"
        defaultValue={logoUrl ?? ''}
        placeholder="https://…"
        hint="imagem quadrada funciona melhor no avatar da sidebar"
      />
      <Input
        label="cor primária (hex)"
        name="corPrimaria"
        defaultValue={corPrimaria ?? ''}
        placeholder="#E04A1F"
        hint="usada com parcimônia no chip da empresa"
      />
      {state?.ok && (
        <p style={{ margin: 0, fontSize: 14, color: 'var(--pedra)' }}>Marca atualizada.</p>
      )}
      {state && !state.ok && (
        <p role="alert" style={{ margin: 0, fontSize: 14, color: 'var(--erro)' }}>
          {state.erro}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'Salvando…' : 'Salvar marca'}
      </Button>
    </form>
  )
}
