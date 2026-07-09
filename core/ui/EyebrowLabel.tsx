import type { CSSProperties, ReactNode } from 'react'

/** Eyebrow VETOR — o rótulo mono de seção, ex.: "ferramenta · conteúdo". */
export type EyebrowTone = 'accent' | 'muted' | 'inverse'

const COLORS: Record<EyebrowTone, string> = {
  accent: 'var(--vermelho-vetor, #E04A1F)',
  muted: 'var(--pedra, #7A756C)',
  inverse: 'var(--osso, #F0EEE8)',
}

export function EyebrowLabel({
  children,
  tone = 'accent',
  style,
}: {
  children: ReactNode
  tone?: EyebrowTone
  style?: CSSProperties
}) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
        fontWeight: 500,
        fontSize: 12,
        color: COLORS[tone],
        ...style,
      }}
    >
      {children}
    </span>
  )
}
