import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { Card } from '@/core/ui/Card'
import { requireTenantContext } from '@/core/tenant/context'
import { requireRole } from '@/core/auth/guards'
import { MarcaForm } from './MarcaForm'

export default async function MarcaPage() {
  const tenant = await requireTenantContext()
  await requireRole('OWNER')

  return (
    <div style={{ maxWidth: 560 }}>
      <EyebrowLabel tone="muted">configurações · marca</EyebrowLabel>
      <h1
        style={{
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 28,
          margin: '10px 0 8px',
        }}
      >
        White-label leve
      </h1>
      <p style={{ margin: '0 0 24px', color: 'var(--pedra)', lineHeight: 1.5 }}>
        A arquitetura já prevê logo e cor por empresa. Aqui você ajusta o chip da sidebar — sem
        trocar a identidade VETOR do produto.
      </p>
      <Card tone="white" elevated padding={28}>
        <MarcaForm logoUrl={tenant.logoUrl} corPrimaria={tenant.corPrimaria} />
      </Card>
    </div>
  )
}
