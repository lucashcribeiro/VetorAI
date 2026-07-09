import localFont from 'next/font/local'

/* Google Fonts (OFL) autohospedadas — woff2 variáveis, subset latin (cobre PT-BR). */

export const spaceGrotesk = localFont({
  src: '../brand/fonts/space-grotesk-var.woff2',
  weight: '300 700',
  variable: '--font-display',
  display: 'swap',
})

export const workSans = localFont({
  src: '../brand/fonts/work-sans-var.woff2',
  weight: '100 900',
  variable: '--font-body',
  display: 'swap',
})

export const jetbrainsMono = localFont({
  src: '../brand/fonts/jetbrains-mono-var.woff2',
  weight: '100 800',
  variable: '--font-mono',
  display: 'swap',
})
