'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/core/ui/Button'
import { iniciarPipelineAction } from '../server/actions'

export function IniciarPipelineForm() {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const r = await iniciarPipelineAction(fd)
      if (!r.ok) {
        setErro(r.erro)
        return
      }
      if (r.rodadaId) router.push(`/tools/time/rodada/${r.rodadaId}`)
      else router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 500,
            opacity: 0.65,
          }}
        >
          brief do cliente
        </span>
        <textarea
          name="brief"
          required
          rows={8}
          placeholder={`Exemplo:
Cliente: Dra. Mirilaini — clínica odontológica em SP.
Procedimentos: lentes, clareamento, avaliação.
Ticket médio avaliação R$ X. Região: raio 15 km.
Verba mídia: R$ 3.000/mês. Já rodou Meta Ads com CPL alto.
Diferencial: atendimento humanizado e agenda noturna.
Objetivo: encher agenda de avaliações em 30 dias.`}
          style={{
            fontFamily: "var(--font-body), 'Work Sans', sans-serif",
            fontSize: 14,
            borderRadius: 8,
            padding: '12px 14px',
            border: '1px solid var(--border-subtle, rgba(0,0,0,.12))',
            resize: 'vertical',
            lineHeight: 1.45,
          }}
        />
      </label>

      <p style={{ margin: 0, fontSize: 13, color: 'var(--pedra)', lineHeight: 1.45 }}>
        O time roda sozinho:{' '}
        <strong>Órbita → Atlas → Lumen → Vetor Mídia → Prisma (QA)</strong>. Se o Prisma achar
        problema, devolve automaticamente para quem errou e refaz.
      </p>

      {erro && (
        <p role="alert" style={{ margin: 0, color: 'var(--erro)', fontSize: 14 }}>
          {erro}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'Acionando o time…' : 'Iniciar estruturação completa'}
      </Button>
    </form>
  )
}
