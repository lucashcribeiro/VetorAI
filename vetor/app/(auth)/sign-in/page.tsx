import Link from 'next/link'
import { Logo } from '@/core/ui/Logo'
import { LoginForm } from './LoginForm'

export default function SignInPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 28,
      }}
    >
      <Link href="/" style={{ textDecoration: 'none' }}>
        <Logo variant="full" tone="positive" size={32} />
      </Link>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <h1
          style={{
            fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 28,
            margin: '0 0 8px',
            textAlign: 'center',
          }}
        >
          Entrar
        </h1>
        <p style={{ margin: '0 0 24px', textAlign: 'center', color: 'var(--pedra)', fontSize: 14 }}>
          Acesse a plataforma da sua empresa.
        </p>
        <LoginForm />
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--pedra)' }}>
          Não tem conta?{' '}
          <Link href="/sign-up" style={{ color: 'var(--carvao)', fontWeight: 600 }}>
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  )
}
