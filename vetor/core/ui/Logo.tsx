import type { CSSProperties } from 'react'

/** Logo VETOR — símbolo + wordmark minúsculo, ordem nunca invertida. */
export type LogoVariant = 'full' | 'symbol' | 'wordmark' | 'favicon'
export type LogoTone = 'positive' | 'negative' | 'mono' | 'onRed'

export function Logo({
  variant = 'full',
  tone = 'positive',
  size = 32,
  style,
}: {
  variant?: LogoVariant
  tone?: LogoTone
  size?: number
  style?: CSSProperties
}) {
  const symFill = tone === 'negative' ? '#F0EEE8' : tone === 'onRed' ? '#FFFFFF' : '#171717'
  const dotFill = tone === 'mono' ? '#171717' : tone === 'onRed' ? '#171717' : '#E04A1F'
  const textColor = tone === 'negative' ? '#F0EEE8' : tone === 'onRed' ? '#FFFFFF' : '#171717'

  const symbol = (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <g transform="rotate(-45 16 16)">
        <polygon points="9,5 25,16 9,27 9,21.4 17,16 9,10.6" fill={symFill} />
      </g>
      {variant !== 'favicon' && <circle cx="6.5" cy="25.5" r="3" fill={dotFill} />}
    </svg>
  )

  if (variant === 'symbol' || variant === 'favicon') return symbol

  const wordmark = (
    <span
      style={{
        fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: size * 0.85,
        letterSpacing: '0.02em',
        color: textColor,
        lineHeight: 1,
      }}
    >
      vetor
    </span>
  )

  if (variant === 'wordmark') return wordmark

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.3, ...style }}>
      {symbol}
      {wordmark}
    </span>
  )
}
