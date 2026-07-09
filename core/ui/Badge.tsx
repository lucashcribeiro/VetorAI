import type { CSSProperties, ReactNode } from 'react'

/** Badge/tag VETOR — chip mono pequeno para status e metadados. */
export type BadgeTone = 'neutral' | 'dark' | 'accent' | 'outline'

const TONES: Record<BadgeTone, CSSProperties> = {
  neutral: {
    background: 'var(--osso, #F0EEE8)',
    color: 'var(--carvao, #171717)',
    border: '1px solid var(--areia, #C9C4B8)',
  },
  dark: {
    background: 'var(--carvao, #171717)',
    color: 'var(--osso, #F0EEE8)',
    border: '1px solid transparent',
  },
  accent: {
    background: 'var(--vermelho-vetor, #E04A1F)',
    color: '#FFFFFF',
    border: '1px solid transparent',
  },
  outline: {
    background: 'transparent',
    color: 'var(--pedra, #7A756C)',
    border: '1px solid var(--areia, #C9C4B8)',
  },
}

export function Badge({
  children,
  tone = 'neutral',
  style,
}: {
  children: ReactNode
  tone?: BadgeTone
  style?: CSSProperties
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
        fontWeight: 500,
        fontSize: 11,
        padding: '4px 10px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
        ...TONES[tone],
        ...style,
      }}
    >
      {children}
    </span>
  )
}
