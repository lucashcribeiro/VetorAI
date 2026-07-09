import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { Card } from '@/core/ui/Card'
import { Badge } from '@/core/ui/Badge'
import { requireTenantContext } from '@/core/tenant/context'
import { requireRole } from '@/core/auth/guards'
import { db } from '@/core/db/client'
import { ConviteForm } from './ConviteForm'
import { RemoverBotao } from './RemoverBotao'

export default async function EquipePage() {
  const tenant = await requireTenantContext()
  const { role } = await requireRole('MEMBER')
  const podeGerir = role === 'OWNER' || role === 'SUPER_ADMIN'

  const membros = await db.membership.findMany({
    where: { tenantId: tenant.id },
    include: { user: true },
    orderBy: { user: { nome: 'asc' } },
  })

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <EyebrowLabel tone="muted">equipe · quem pode entrar e o que pode fazer</EyebrowLabel>
        <h1
          style={{
            fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 28,
            margin: '10px 0 0',
          }}
        >
          Equipe
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {membros.map((m) => (
          <Card
            key={m.id}
            tone="white"
            elevated
            padding={16}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{m.user.nome}</div>
              <div
                style={{
                  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: 'var(--pedra)',
                }}
              >
                {m.user.email}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Badge tone={m.papel === 'OWNER' ? 'dark' : 'outline'}>
                {m.papel === 'OWNER' ? 'dono' : 'membro'}
              </Badge>
              {podeGerir && m.papel !== 'OWNER' && <RemoverBotao userId={m.userId} />}
            </div>
          </Card>
        ))}
        {membros.length === 0 && (
          <Card tone="osso" padding={20}>
            <p style={{ margin: 0, color: 'var(--pedra)' }}>Nenhum membro ainda.</p>
          </Card>
        )}
      </div>

      {podeGerir && (
        <Card tone="white" elevated padding={24} style={{ maxWidth: 480 }}>
          <h2
            style={{
              fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 18,
              margin: '0 0 16px',
            }}
          >
            Convidar / adicionar
          </h2>
          <ConviteForm />
        </Card>
      )}
    </div>
  )
}
