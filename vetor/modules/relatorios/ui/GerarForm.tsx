'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/core/ui/Button'
import { Input } from '@/core/ui/Input'
import { solicitarGeracaoRelatorio } from '../server/actions'

function mesDefault(): string {
  const d = new Date()
  // Mês anterior (relatório do mês que fechou).
  d.setDate(1)
  d.setMonth(d.getMonth() - 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function GerarForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [mes, setMes] = useState(mesDefault)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await solicitarGeracaoRelatorio(fd)
      if (!result.ok) {
        setErro(result.erro)
        return
      }
      router.push(`/tools/relatorios/${result.relatorioId}`)
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        <Input
          label="mês de referência"
          name="mes"
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          required
          hint="o mês que você quer entender"
        />
        <Input
          label="quanto entrou (R$)"
          name="faturamento"
          type="text"
          placeholder="ex.: 48.000"
          hint="faturamento do mês, se souber"
        />
        <Input
          label="gasto com divulgação (R$)"
          name="investimentoAds"
          type="text"
          placeholder="ex.: 3.200"
        />
        <Input
          label="pessoas que chegaram"
          name="leads"
          type="text"
          placeholder="ex.: 86"
          hint="contatos, orçamentos, leads"
        />
        <Input
          label="clientes novos"
          name="clientesNovos"
          type="text"
          placeholder="ex.: 12"
        />
        <Input
          label="ticket médio (R$)"
          name="ticketMedio"
          type="text"
          placeholder="ex.: 1.800"
        />
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontWeight: 500,
            fontSize: 11,
            color: 'var(--carvao)',
            opacity: 0.65,
          }}
        >
          observações do mês
        </span>
        <textarea
          name="observacoes"
          rows={3}
          placeholder="Algo fora da curva? campanha nova, feriado, mudança de preço…"
          style={{
            fontFamily: "var(--font-body), 'Work Sans', sans-serif",
            fontSize: 14,
            color: 'var(--carvao)',
            background: '#FFFFFF',
            borderRadius: 8,
            padding: '11px 14px',
            border: '1px solid var(--border-subtle, rgba(0,0,0,.12))',
            resize: 'vertical',
          }}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontWeight: 500,
            fontSize: 11,
            color: 'var(--carvao)',
            opacity: 0.65,
          }}
        >
          csv dos anúncios (opcional)
        </span>
        <input
          name="csv"
          type="file"
          accept=".csv,text/csv"
          style={{
            fontFamily: "var(--font-body), 'Work Sans', sans-serif",
            fontSize: 13,
            color: 'var(--pedra)',
          }}
        />
        <span style={{ fontSize: 12, color: 'var(--pedra)' }}>
          Exporte do Meta ou Google Ads e envie aqui. A API automática vem depois — por enquanto é manual.
        </span>
      </label>

      {erro && (
        <p
          role="alert"
          style={{
            margin: 0,
            padding: '12px 14px',
            background: 'rgba(179,38,30,.08)',
            color: 'var(--erro, #B3261E)',
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          {erro}
        </p>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button type="submit" disabled={pending} variant="primary">
          {pending ? 'Enfileirando…' : 'Gerar relatório'}
        </Button>
        <span
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'var(--pedra)',
          }}
        >
          leva cerca de 30–90 s · você pode sair e voltar
        </span>
      </div>
    </form>
  )
}
