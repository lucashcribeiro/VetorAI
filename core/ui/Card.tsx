import type { CSSProperties, ReactNode } from 'react'

/** Card VETOR — painel plano nas três superfícies da marca. */
export type CardTone = 'white' | 'osso' | 'dark'

const TONES: Record<CardTone, CSSProperties> = {
  white: {
    background: '#FFFFFF',
    border: '1px solid var(--border-subtle, rgba(0,0,0,.12))',
    color: 'var(--carvao, #171717)',
  },
  osso: {
    background: 'var(--osso, #F0EEE8)',
    border: 'none',
    color: 'var(--carvao, #171717)',
  },
  dark: {
    background: 'var(--carvao, #171717)',
    border: 'none',
    color: 'var(--osso, #F0EEE8)',
  },
}

export function Card({
  tone = 'white',
  elevated = false,
  padding = 24,
  radius = 10,
  children,
  style,
}: {
  tone?: CardTone
  elevated?: boolean
  padding?: number | string
  radius?: number
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        borderRadius: radius,
        padding,
        boxSizing: 'border-box',
        boxShadow: elevated ? 'var(--shadow-card, 0 3px 12px rgba(0,0,0,.08))' : 'none',
        fontFamily: "var(--font-body), 'Work Sans', sans-serif",
        ...TONES[tone],
        ...style,
      }}
    >
      {children}
    </div>
  )
}
