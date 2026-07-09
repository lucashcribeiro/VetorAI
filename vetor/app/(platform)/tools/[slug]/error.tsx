'use client'

// Proteção 3 (README Fase 1): erro dentro de uma ferramenta fica contido nela.
export default function ToolError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle, rgba(0,0,0,.12))',
        borderRadius: 10,
        padding: 32,
        maxWidth: 560,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          fontWeight: 500,
          fontSize: 12,
          color: 'var(--erro, #B3261E)',
        }}
      >
        algo deu errado nesta ferramenta
      </span>
      <h1
        style={{
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 24,
          margin: '10px 0 8px',
        }}
      >
        Isso é com a gente.
      </h1>
      <p style={{ margin: '0 0 20px', color: 'var(--pedra, #7A756C)' }}>
        O resto da plataforma segue funcionando. Já fomos avisados — tente de novo em instantes.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          fontFamily: "var(--font-body), 'Work Sans', sans-serif",
          fontWeight: 600,
          fontSize: 14,
          padding: '10px 20px',
          borderRadius: 8,
          border: '1px solid var(--carvao, #171717)',
          background: 'transparent',
          color: 'var(--carvao, #171717)',
          cursor: 'pointer',
        }}
      >
        Tentar de novo
      </button>
    </div>
  )
}
