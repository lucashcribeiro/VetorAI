'use client'

import { useTransition } from 'react'
import { Button } from '@/core/ui/Button'
import { removerMembro } from './actions'

export function RemoverBotao({ userId }: { userId: string }) {
  const [pending, start] = useTransition()
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await removerMembro(userId)
        })
      }
    >
      Remover
    </Button>
  )
}
