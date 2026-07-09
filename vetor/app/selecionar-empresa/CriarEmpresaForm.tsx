'use client'

import { useActionState } from 'react'
import { Button } from '@/core/ui/Button'
import { Input } from '@/core/ui/Input'
import { Card } from '@/core/ui/Card'
import { criarMinhaEmpresa, type OnboardingResult } from './actions'

export function CriarEmpresaForm() {
  const [state, action, pending] = useActionState(criarMinhaEmpresa, null as OnboardingResult | null)

  return (
    <Card tone="white" elevated padding={24}>
      <h2
        style={{
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 18,
          margin: '0 0 8px',
        }}
      >
        Criar minha empresa
      </h2>
      <p style={{ margin: '0 0 16px', color: 'var(--pedra)', fontSize: 14, lineHeight: 1.45 }}>
        Em menos de 15 minutos você provisiona, convida a equipe e gera o primeiro relatório ou
        pauta. Módulos essenciais já vêm ligados.
      </p>
      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input label="nome da empresa" name="nome" required placeholder="Ex.: Clínica da Dra. Ana" />
        <Input
          label="segmento (opcional)"
          name="segmento"
          placeholder="odontologia · sp"
          hint="ajuda o tom das ferramentas (ex.: dental vs seguros)"
        />
        <Input label="slug (opcional)" name="slug" placeholder="clinica-ana" />
        {state && !state.ok && (
          <p role="alert" style={{ margin: 0, color: 'var(--erro)', fontSize: 14 }}>
            {state.erro}
          </p>
        )}
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Criando…' : 'Criar e entrar'}
        </Button>
      </form>
    </Card>
  )
}
