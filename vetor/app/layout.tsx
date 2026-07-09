import type { Metadata } from 'next'
import { spaceGrotesk, workSans, jetbrainsMono } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://vetor.ai',
  ),
  title: {
    default: 'VETOR — ferramentas de IA que o dono opera',
    template: '%s · VETOR',
  },
  description:
    'Consultoria de IA para pequenas empresas brasileiras. Ferramentas sob medida que o próprio cliente opera. Direção + intensidade.',
  openGraph: {
    siteName: 'VETOR',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${spaceGrotesk.variable} ${workSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
