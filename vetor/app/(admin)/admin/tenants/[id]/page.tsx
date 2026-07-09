import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/core/db/client'
import { registry } from '@/modules/registry'
import { Card } from '@/core/ui/Card'
import { Badge } from '@/core/ui/Badge'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { alternarModulo } from '../../actions'

const monoFont = { fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" } as const

export default async function AdminTenantDetalhe({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tenant = await db.tenant.findUnique({
    where: { id },
    include: { modules: true },
  })
  if (!tenant) notFound()

  const ativos = new Set(tenant.modules.filter((m) => m.ativo).map((m) => m.moduleId))

  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 720 }}>
      <div>
        <Link href="/admin/tenants" style={{ ...monoFont, fontSize: 11, color: 'var(--pedra)' }}>
          ← empresas
        </Link>
        <h1
          style={{
            fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 'var(--text-h2)',
            margin: '10px 0 4px',
          }}
        >
          {tenant.nome}
        </h1>
        <div style={{ ...monoFont, fontSize: 11, color: 'var(--pedra)' }}>
          {tenant.slug}
          {tenant.segmento ? ` · ${tenant.segmento}` : ''} · plano {tenant.plano} ·{' '}
          {tenant.clerkOrgId ? `clerk ${tenant.clerkOrgId}` : 'sem organização clerk'}
        </div>
      </div>

      <div>
        <div style={{ marginBottom: 12 }}>
          <EyebrowLabel>módulos</EyebrowLabel>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {registry.map((m) => {
            const ativo = ativos.has(m.manifest.id)
            const Icone = m.manifest.icone
            return (
              <Card key={m.manifest.id} tone="white" padding={18}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span
                    style={{
                      display: 'grid',
                      placeItems: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'var(--osso)',
                      flex: 'none',
                    }}
                  >
                    <Icone size={17} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600 }}>{m.manifest.nome}</span>
                    <span style={{ ...monoFont, fontSize: 10.5, color: 'var(--pedra)', marginLeft: 8 }}>
                      {m.manifest.id}
                    </span>
                  </div>
                  {ativo && <Badge tone="dark">ativo</Badge>}
                  <form
                    action={async () => {
                      'use server'
                      await alternarModulo(tenant.id, m.manifest.id, !ativo)
                    }}
                  >
                    <button
                      type="submit"
                      style={{
                        fontFamily: "var(--font-body), 'Work Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: 12.5,
                        padding: '7px 14px',
                        borderRadius: 8,
                        border: ativo ? '1px solid var(--areia)' : '1px solid transparent',
                        background: ativo ? 'transparent' : 'var(--carvao)',
                        color: ativo ? 'var(--pedra)' : 'var(--osso)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ativo ? 'Desligar' : 'Ligar'}
                    </button>
                  </form>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
