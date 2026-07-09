import type { SVGProps } from 'react'

/* Ícones da plataforma — traço 1.5, grid 20×20, extraídos do handoff do dashboard. */

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

function base({ size = 17, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    ...props,
  } as const
}

export function IconInicio(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 9.5 10 3l7 6.5V17h-4.8v-4.6H7.8V17H3V9.5Z" />
    </svg>
  )
}

export function IconConteudo(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="3" width="13" height="14" rx="1.5" />
      <path d="M7 7.5h6M7 10.5h6M7 13.5h3.5" />
    </svg>
  )
}

export function IconAnuncios(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 12.5v-5l9-4v13l-9-4Z" />
      <path d="M12 8.5c1.8 0 3 .9 3 2s-1.2 2-3 2M5.5 12.5V16" />
    </svg>
  )
}

export function IconRelatorios(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 16.5V11M10 16.5V6M16 16.5V3.5" />
    </svg>
  )
}

export function IconEquipe(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="7" cy="7" r="3" />
      <path d="M2.5 17c.6-3 2.4-4.5 4.5-4.5S10.9 14 11.5 17M13 4.5a3 3 0 0 1 0 5M14.5 12.6c1.7.6 2.7 2 3 4.4" />
    </svg>
  )
}

export function IconAjustes(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10" cy="10" r="2.8" />
      <path d="M10 3v2.2M10 14.8V17M3 10h2.2M14.8 10H17M5.1 5.1l1.6 1.6M13.3 13.3l1.6 1.6M14.9 5.1l-1.6 1.6M6.7 13.3l-1.6 1.6" />
    </svg>
  )
}

export function IconZelo(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 3.5c3.9 0 7 2.7 7 6s-3.1 6-7 6c-.8 0-1.6-.1-2.3-.3L4 16.5l.9-2.8C3.7 12.6 3 11.1 3 9.5c0-3.3 3.1-6 7-6Z" />
      <path d="M7 8.5h6M7 11h4" />
    </svg>
  )
}
