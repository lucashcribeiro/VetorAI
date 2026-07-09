import { db } from '@/core/db/client'
import { Card } from '@/core/ui/Card'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'

const displayFont = {
  fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
  fontWeight: 700,
} as const

function CardMetrica({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <Card tone="white" padding={22}>
      <div
        style={{
          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          fontSize: 11,
          color: 'var(--pedra)',
          marginBottom: 8,
        }}
      >
        {rotulo}
      </div>
      <div style={{ ...displayFont, fontSize: 30, lineHeight: 1.1 }}>{valor}</div>
    </Card>
  )
}

// Saúde da operação (ADR-004): uso, flags e custo — nada de dados operacionais.
export default async function AdminHome() {
  const inicioDoMes = new Date()
  inicioDoMes.setDate(1)
  inicioDoMes.setHours(0, 0, 0, 0)

  const [tenants, modulosAtivos, eventosPendentes, custoMes] = await Promise.all([
    db.tenant.count({ where: { status: 'ativo' } }),
    db.tenantModule.count({ where: { ativo: true } }),
    db.event.count({ where: { processado: false } }),
    db.aiUsage.aggregate({
      _sum: { custoBrl: true },
      where: { criadoEm: { gte: inicioDoMes } },
    }),
  ])

  const custo = Number(custoMes._sum.custoBrl ?? 0)

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <EyebrowLabel>saúde da operação</EyebrowLabel>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        <CardMetrica rotulo="empresas ativas" valor={String(tenants)} />
        <CardMetrica rotulo="módulos ligados" valor={String(modulosAtivos)} />
        <CardMetrica rotulo="eventos na fila" valor={String(eventosPendentes)} />
        <CardMetrica
          rotulo="custo de ia no mês"
          valor={custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        />
      </div>
    </div>
  )
}
