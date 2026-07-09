'use client'

import { useState, type CSSProperties, type ReactNode } from 'react'

/** Botão VETOR — plano e preciso; vermelho só na ação primária. */
export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const SIZES: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '8px 16px', fontSize: 13 },
  md: { padding: '11px 22px', fontSize: 14 },
  lg: { padding: '14px 28px', fontSize: 15 },
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  children,
  onClick,
  style,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  type?: 'button' | 'submit'
  children: ReactNode
  onClick?: () => void
  style?: CSSProperties
}) {
  const [hover, setHover] = useState(false)
  const [press, setPress] = useState(false)

  const variants: Record<ButtonVariant, CSSProperties> = {
    primary: {
      background: hover ? 'var(--accent-hover, #C43F18)' : 'var(--accent, #E04A1F)',
      color: '#FFFFFF',
      border: '1px solid transparent',
    },
    secondary: {
      background: hover ? 'var(--carvao, #171717)' : 'transparent',
      color: hover ? 'var(--osso, #F0EEE8)' : 'var(--carvao, #171717)',
      border: '1px solid var(--carvao, #171717)',
    },
    dark: {
      background: hover ? '#2E2E2E' : 'var(--carvao, #171717)',
      color: 'var(--osso, #F0EEE8)',
      border: '1px solid transparent',
    },
    ghost: {
      background: hover ? 'rgba(0,0,0,.06)' : 'transparent',
      color: 'var(--carvao, #171717)',
      border: '1px solid transparent',
    },
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false)
        setPress(false)
      }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        fontFamily: "var(--font-body), 'Work Sans', sans-serif",
        fontWeight: 600,
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : press ? 0.85 : 1,
        transition: 'background .12s ease, color .12s ease, opacity .12s ease',
        ...SIZES[size],
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  )
}
