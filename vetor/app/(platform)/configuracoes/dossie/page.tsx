import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { Card } from '@/core/ui/Card'
import { Badge } from '@/core/ui/Badge'
import { requireTenantContext } from '@/core/tenant/context'
import { requireRole } from '@/core/auth/guards'
import { obterDossieAtual } from '@/core/tenant/dossie'
import { DossieForm } from './DossieForm'

export default async function DossiePage() {
  const tenant = await requireTenantContext()
  const { role } = await requireRole('MEMBER')
  const dossie = await obterDossieAtual(tenant.id)
  const podeEditar = role === 'OWNER' || role === 'SUPER_ADMIN'

  return (
    <div>
      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        <EyebrowLabel tone="muted">configurações · dossiê do cliente</EyebrowLabel>
        {dossie && <Badge tone="outline">v{dossie.versao}</Badge>}
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 28,
          margin: '0 0 8px',
        }}
      >
        Dossiê
      </h1>
      <p style={{ margin: '0 0 24px', color: 'var(--pedra)', maxWidth: 520, lineHeight: 1.5 }}>
        Contexto compartilhado de todas as ferramentas de IA da {tenant.nome}. Quanto mais claro,
        melhor o relatório, a pauta e as sugestões do Zelo.
      </p>

      {podeEditar ? (
        <Card tone="white" elevated padding={28}>
          <DossieForm inicial={dossie?.conteudo ?? {}} />
        </Card>
      ) : (
        <Card tone="osso" padding={24}>
          <p style={{ margin: 0, color: 'var(--pedra)' }}>
            Só o dono da empresa pode editar o dossiê. Peça a quem tem perfil de dono.
          </p>
          {dossie?.conteudo.resumo && (
            <p style={{ margin: '16px 0 0', lineHeight: 1.5 }}>{dossie.conteudo.resumo}</p>
          )}
        </Card>
      )}
    </div>
  )
}
