import Link from 'next/link'
import { db } from '@/core/db/client'
import { Card } from '@/core/ui/Card'
import { Badge } from '@/core/ui/Badge'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { Input } from '@/core/ui/Input'
import { criarTenant } from '../actions'

const monoFont = { fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" } as const

export default async function AdminTenantsPage() {
  const tenants = await db.tenant.findMany({
    orderBy: { criadoEm: 'asc' },
    include: { modules: { where: { ativo: true }, select: { moduleId: true } } },
  })

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <div style={{ marginBottom: 14 }}>
          <EyebrowLabel>empresas · {tenants.length}</EyebrowLabel>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tenants.length === 0 && (
            <Card tone="white" padding={24}>
              <p style={{ margin: 0, color: 'var(--pedra)' }}>
                Nenhuma empresa ainda. Provisione a primeira abaixo (ou rode o seed).
              </p>
            </Card>
          )}
          {tenants.map((t) => (
            <Link key={t.id} href={`/admin/tenants/${t.id}`} style={{ textDecoration: 'none' }}>
              <Card tone="white" padding={18}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 600, color: 'var(--carvao)' }}>{t.nome}</span>
                    <span style={{ ...monoFont, fontSize: 11, color: 'var(--pedra)', marginLeft: 10 }}>
                      {t.slug}
                      {t.segmento ? ` · ${t.segmento}` : ''}
                    </span>
                  </div>
                  <Badge tone="outline">
                    {t.modules.length} {t.modules.length === 1 ? 'módulo' : 'módulos'}
                  </Badge>
                  <Badge tone={t.status === 'ativo' ? 'dark' : 'outline'}>{t.status}</Badge>
                  {!t.clerkOrgId && <Badge tone="accent">sem clerk</Badge>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card tone="osso" padding={24} style={{ maxWidth: 560 }}>
        <div style={{ marginBottom: 14 }}>
          <EyebrowLabel>provisionar empresa</EyebrowLabel>
        </div>
        <form action={criarTenant} style={{ display: 'grid', gap: 12 }}>
          <Input name="nome" label="nome" placeholder="Dra. Mirilaini" required />
          <Input name="slug" label="slug (opcional)" placeholder="dra-mirilaini" />
          <Input name="segmento" label="segmento (opcional)" placeholder="odontologia · sp" />
          <button
            type="submit"
            style={{
              fontFamily: "var(--font-body), 'Work Sans', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              padding: '11px 22px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--accent)',
              color: '#fff',
              cursor: 'pointer',
              justifySelf: 'start',
            }}
          >
            Criar tenant
          </button>
        </form>
      </Card>
    </div>
  )
}
