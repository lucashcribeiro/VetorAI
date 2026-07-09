import type { ComponentType } from 'react'
import { Card } from './Card'
import { EyebrowLabel } from './EyebrowLabel'
import type { IconProps } from './icons'

/** Página "solicitar ativação" — módulo existe no catálogo mas não está contratado. */
export function ModuloInativo({
  nome,
  descricao,
  icone: Icone,
  solicitarAction,
}: {
  nome: string
  descricao: string
  icone: ComponentType<IconProps>
  solicitarAction: () => Promise<void>
}) {
  return (
    <Card tone="white" padding={32} style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 38,
            height: 38,
            borderRadius: 8,
            background: 'var(--osso)',
          }}
        >
          <Icone size={20} />
        </span>
        <EyebrowLabel tone="muted">ferramenta · não contratada</EyebrowLabel>
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 'var(--text-h2)',
          margin: '0 0 12px',
          lineHeight: 1.2,
        }}
      >
        {nome}
      </h1>
      <p style={{ margin: '0 0 24px', color: 'var(--pedra)', maxWidth: 480 }}>{descricao}</p>
      <form action={solicitarAction}>
        <button
          type="submit"
          style={{
            fontFamily: "var(--font-body), 'Work Sans', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            padding: '11px 22px',
            borderRadius: 8,
            border: '1px solid transparent',
            background: 'var(--carvao)',
            color: 'var(--osso)',
            cursor: 'pointer',
          }}
        >
          Solicitar ativação
        </button>
      </form>
      <p
        style={{
          margin: '16px 0 0',
          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          fontSize: 11,
          color: 'var(--pedra)',
        }}
      >
        você recebe o retorno em até 1 dia útil — sem cobrança automática
      </p>
    </Card>
  )
}
