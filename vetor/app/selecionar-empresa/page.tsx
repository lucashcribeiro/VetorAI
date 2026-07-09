import Link from 'next/link'
import { Logo } from '@/core/ui/Logo'
import { Card } from '@/core/ui/Card'
import { Button } from '@/core/ui/Button'
import { requireUser } from '@/core/auth/guards'
import { db } from '@/core/db/client'
import { escolherEmpresa } from './actions'
import { CriarEmpresaForm } from './CriarEmpresaForm'
import { logoutAction } from '@/app/(auth)/actions'

export default async function SelecionarEmpresaPage() {
  const user = await requireUser()

  const memberships = await db.membership.findMany({
    where: { userId: user.id },
    include: { tenant: true },
    orderBy: { tenant: { nome: 'asc' } },
  })

  const tenants =
    user.role === 'SUPER_ADMIN'
      ? await db.tenant.findMany({
          where: { status: 'ativo' },
          orderBy: { nome: 'asc' },
        })
      : memberships.map((m) => m.tenant)

  const podeCriar = user.role !== 'SUPER_ADMIN' || tenants.length === 0

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 24,
      }}
    >
      <Logo variant="full" tone="positive" size={28} />
      <div style={{ width: '100%', maxWidth: 440 }}>
        <h1
          style={{
            fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 24,
            margin: '0 0 8px',
            textAlign: 'center',
          }}
        >
          {tenants.length === 0 ? 'Bem-vindo à plataforma' : 'Escolha a empresa'}
        </h1>
        <p style={{ margin: '0 0 20px', textAlign: 'center', color: 'var(--pedra)', fontSize: 14 }}>
          Olá, {user.nome.split(' ')[0]}.
          {tenants.length === 0
            ? ' Crie sua empresa para começar — ou aguarde um convite.'
            : ' Em qual empresa você quer entrar?'}
        </p>

        {tenants.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {tenants.map((t) => (
              <form key={t.id} action={escolherEmpresa.bind(null, t.id)}>
                <Card
                  tone="white"
                  elevated
                  padding={18}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {t.nome}
                    </div>
                    {t.segmento && (
                      <div
                        style={{
                          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                          fontSize: 11,
                          color: 'var(--pedra)',
                          marginTop: 4,
                        }}
                      >
                        {t.segmento}
                      </div>
                    )}
                  </div>
                  <Button type="submit" variant="primary" size="sm">
                    Entrar
                  </Button>
                </Card>
              </form>
            ))}
          </div>
        )}

        {podeCriar && <CriarEmpresaForm />}

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
          <Link href="/" style={{ fontSize: 13, color: 'var(--pedra)' }}>
            Site
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--pedra)',
                fontSize: 13,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
