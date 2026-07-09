import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { Card } from '@/core/ui/Card'
import { Badge } from '@/core/ui/Badge'
import { requireTenantContext } from '@/core/tenant/context'
import { requireRole } from '@/core/auth/guards'

/**
 * Cobrança manual (Fase 7): Pix/boleto + planilha.
 * Stripe/Pagar.me só depois do 5º pagante — README mestre.
 */
export default async function FaturamentoPage() {
  const tenant = await requireTenantContext()
  await requireRole('OWNER')

  const pixChave = process.env.VETOR_PIX_CHAVE ?? null
  const pixTitular = process.env.VETOR_PIX_TITULAR ?? 'VETOR Consultoria'
  const valorEssencial = process.env.VETOR_PLANO_ESSENCIAL_BRL ?? 'consultar'
  const valorCompleto = process.env.VETOR_PLANO_COMPLETO_BRL ?? 'consultar'

  return (
    <div style={{ maxWidth: 640 }}>
      <EyebrowLabel tone="muted">configurações · faturamento</EyebrowLabel>
      <h1
        style={{
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 28,
          margin: '10px 0 8px',
        }}
      >
        Faturamento
      </h1>
      <p style={{ margin: '0 0 28px', color: 'var(--pedra)', lineHeight: 1.5 }}>
        Cobrança manual neste beta: Pix ou boleto. Sem cartão automático — menos fricção e
        mais conversa enquanto validamos o produto.
      </p>

      <Card tone="white" elevated padding={24} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontWeight: 600 }}>Plano atual</span>
          <Badge tone="dark">{tenant.plano}</Badge>
        </div>
        <p style={{ margin: 0, color: 'var(--pedra)', fontSize: 14 }}>
          Empresa: <strong style={{ color: 'var(--carvao)' }}>{tenant.nome}</strong>
        </p>
        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            fontSize: 14,
          }}
        >
          <div
            style={{
              padding: 14,
              background: 'var(--osso)',
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                fontSize: 11,
                color: 'var(--pedra)',
                marginBottom: 4,
              }}
            >
              essencial
            </div>
            <div style={{ fontWeight: 700 }}>
              {valorEssencial === 'consultar' ? 'Sob consulta' : `R$ ${valorEssencial}/mês`}
            </div>
          </div>
          <div
            style={{
              padding: 14,
              background: 'var(--osso)',
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                fontSize: 11,
                color: 'var(--pedra)',
                marginBottom: 4,
              }}
            >
              completo
            </div>
            <div style={{ fontWeight: 700 }}>
              {valorCompleto === 'consultar' ? 'Sob consulta' : `R$ ${valorCompleto}/mês`}
            </div>
          </div>
        </div>
      </Card>

      <Card tone="osso" padding={24} style={{ marginBottom: 16 }}>
        <h2
          style={{
            fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            margin: '0 0 12px',
          }}
        >
          Como pagar
        </h2>
        {pixChave ? (
          <>
            <p style={{ margin: '0 0 8px', fontSize: 14 }}>
              Pix para <strong>{pixTitular}</strong>
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                fontSize: 13,
                wordBreak: 'break-all',
                padding: 12,
                background: '#fff',
                borderRadius: 8,
              }}
            >
              {pixChave}
            </p>
            <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--pedra)' }}>
              Depois do pagamento, envie o comprovante pelo suporte. Ativamos/renovamos o plano
              manualmente na planilha da VETOR.
            </p>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: 14, color: 'var(--pedra)', lineHeight: 1.5 }}>
            Chave Pix ainda não configurada neste ambiente. Fale com a VETOR pelo{' '}
            <a href="/suporte" style={{ color: 'var(--carvao)', fontWeight: 600 }}>
              suporte
            </a>{' '}
            ou pelo contato do site — geramos boleto/Pix na hora.
          </p>
        )}
      </Card>

      <Card tone="white" padding={20}>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'var(--pedra)',
          }}
        >
          stripe / pagar.me · só depois do 5º pagante (roadmap)
        </p>
      </Card>
    </div>
  )
}
