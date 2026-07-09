'use client'

import { useActionState } from 'react'
import { Button } from '@/core/ui/Button'
import { Input } from '@/core/ui/Input'
import { salvarDossieAction, type DossieResult } from './actions'
import type { DossieConteudo } from '@/core/tenant/dossie'

function Area({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 3,
}: {
  label: string
  name: string
  defaultValue?: string
  placeholder?: string
  rows?: number
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span
        style={{
          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 500,
          opacity: 0.65,
        }}
      >
        {label}
      </span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        style={{
          fontFamily: "var(--font-body), 'Work Sans', sans-serif",
          fontSize: 14,
          borderRadius: 8,
          padding: '11px 14px',
          border: '1px solid var(--border-subtle, rgba(0,0,0,.12))',
          resize: 'vertical',
        }}
      />
    </label>
  )
}

export function DossieForm({ inicial }: { inicial: DossieConteudo }) {
  const [state, action, pending] = useActionState(salvarDossieAction, null as DossieResult | null)

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
      <Area
        label="resumo do negócio"
        name="resumo"
        defaultValue={inicial.resumo}
        placeholder="O que a empresa faz, para quem, em uma frase."
      />
      <Area
        label="tom de voz"
        name="tomDeVoz"
        defaultValue={inicial.tomDeVoz}
        placeholder="Ex.: acolhedor e profissional; sem gírias; trata paciente pelo nome."
      />
      <Area
        label="público"
        name="publico"
        defaultValue={inicial.publico}
        placeholder="Quem é o cliente ideal."
      />
      <Area
        label="oferta principal"
        name="oferta"
        defaultValue={inicial.oferta}
        placeholder="Serviços / produtos que mais vendem."
      />
      <Area
        label="diferenciais"
        name="diferenciais"
        defaultValue={inicial.diferenciais}
        placeholder="Por que escolhem vocês."
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="horário" name="horario" defaultValue={inicial.horario} placeholder="Seg–sex 8h–18h" />
        <Input label="endereço" name="endereco" defaultValue={inicial.endereco} placeholder="Bairro, cidade" />
      </div>
      <Area
        label="observações"
        name="observacoes"
        defaultValue={inicial.observacoes}
        placeholder="O que a IA não deve prometer, restrições CFO/SUSEP, etc."
        rows={2}
      />
      {state?.ok && (
        <p style={{ margin: 0, color: 'var(--pedra)', fontSize: 14 }}>
          Dossiê salvo como versão {state.versao}. Relatórios, conteúdo e Zelo passam a usar este
          contexto.
        </p>
      )}
      {state && !state.ok && (
        <p role="alert" style={{ margin: 0, color: 'var(--erro)', fontSize: 14 }}>
          {state.erro}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'Salvando…' : 'Salvar dossiê'}
      </Button>
    </form>
  )
}
