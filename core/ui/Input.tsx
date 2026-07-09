'use client'

import { useState, type CSSProperties, type ChangeEvent } from 'react'

/** Campo de texto VETOR — plano sobre branco/osso, anel de foco vermelho. */
export function Input({
  label,
  hint,
  name,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  required = false,
  onChange,
  disabled = false,
  style,
}: {
  label?: string
  hint?: string
  name?: string
  type?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  required?: boolean
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  style?: CSSProperties
}) {
  const [focus, setFocus] = useState(false)

  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        fontFamily: "var(--font-body), 'Work Sans', sans-serif",
        ...style,
      }}
    >
      {label && (
        <span
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontWeight: 500,
            fontSize: 11,
            color: 'var(--carvao, #171717)',
            opacity: 0.65,
          }}
        >
          {label}
        </span>
      )}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        required={required}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          fontFamily: "var(--font-body), 'Work Sans', sans-serif",
          fontSize: 14,
          color: 'var(--carvao, #171717)',
          background: '#FFFFFF',
          borderRadius: 8,
          padding: '11px 14px',
          outline: 'none',
          border: focus
            ? '1px solid var(--accent, #E04A1F)'
            : '1px solid var(--border-subtle, rgba(0,0,0,.12))',
          boxShadow: focus ? '0 0 0 2px rgba(224,74,31,.15)' : 'none',
          opacity: disabled ? 0.45 : 1,
          transition: 'border-color .12s ease, box-shadow .12s ease',
        }}
      />
      {hint && <span style={{ fontSize: 12, color: 'var(--pedra, #7A756C)' }}>{hint}</span>}
    </label>
  )
}
