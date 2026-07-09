import { requireTenantContext } from '@/core/tenant/context'
import { getActiveModuleIds } from '@/core/tenant/modules'
import { registry } from '@/modules/registry'
import { Card } from '@/core/ui/Card'
import { Badge } from '@/core/ui/Badge'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { registrarInteresse } from '../../dashboard/actions'

// Ajustes → Ferramentas: o que está ativo e o que dá para solicitar.
export default async function ModulosPage() {
  const tenant = await requireTenantContext()
  const ativos = await getActiveModuleIds(tenant.id)

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <EyebrowLabel tone="muted">ajustes · ferramentas da {tenant.nome.toLowerCase()}</EyebrowLabel>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
        {registry.map((m) => {
          const ativo = ativos.includes(m.manifest.id)
          const Icone = m.manifest.icone
          return (
            <Card key={m.manifest.id} tone="white" padding={20}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: 'var(--osso)',
                    flex: 'none',
                  }}
                >
                  <Icone size={18} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    {m.manifest.nome}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--pedra)' }}>{m.manifest.descricao}</div>
                </div>
                {ativo ? (
                  <Badge tone="dark">ativa</Badge>
                ) : (
                  <form action={registrarInteresse.bind(null, m.manifest.id)}>
                    <button
                      type="submit"
                      style={{
                        fontFamily: "var(--font-body), 'Work Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: 12.5,
                        padding: '7px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--carvao)',
                        background: 'transparent',
                        color: 'var(--carvao)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Solicitar ativação
                    </button>
                  </form>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
