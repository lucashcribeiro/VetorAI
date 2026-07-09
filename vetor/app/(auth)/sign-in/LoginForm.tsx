'use client'

import { useActionState } from 'react'
import { Button } from '@/core/ui/Button'
import { Input } from '@/core/ui/Input'
import { Card } from '@/core/ui/Card'
import { loginAction, type AuthFormResult } from '../actions'

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null as AuthFormResult | null)

  return (
    <Card tone="white" elevated padding={28}>
      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input label="e-mail" name="email" type="email" required placeholder="voce@empresa.com.br" />
        <Input label="senha" name="password" type="password" required placeholder="••••••••" />
        {state && !state.ok && (
          <p role="alert" style={{ margin: 0, color: 'var(--erro)', fontSize: 14 }}>
            {state.erro}
          </p>
        )}
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </Card>
  )
}
