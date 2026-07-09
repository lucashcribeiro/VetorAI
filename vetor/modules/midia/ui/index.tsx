import type { CSSProperties } from 'react'
import type { ModuleUiProps } from '../../types'
import { Card } from '@/core/ui/Card'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { Badge } from '@/core/ui/Badge'
import { contarAlertasAbertos, listarAlertas, listarMetricas } from '../db'
import { fmtBrl } from '../lib'
import { ImportCsvForm } from './ImportCsvForm'
import { ListaAlertas } from './ListaAlertas'
import { manifest } from '../manifest'

export default async function MidiaUi({ tenantId }: ModuleUiProps) {
  const [alertas, abertos, metricas] = await Promise.all([
    listarAlertas(tenantId, { limit: 40 }),
    contarAlertasAbertos(tenantId),
    listarMetricas(tenantId, { limit: 30 }),
  ])

  const gastoTotal = metricas.reduce((s, m) => s + Number(m.gasto), 0)
  const leadsTotal = metricas.reduce((s, m) => s + m.leads, 0)
  const cplMedio = leadsTotal > 0 ? gastoTotal / leadsTotal : null

  return (
    <div>
      <header style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <EyebrowLabel>ferramenta · anúncios</EyebrowLabel>
          <Badge tone="outline">etapa a · csv</Badge>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 'var(--text-h1, 36px)',
            margin: '0 0 8px',
            lineHeight: 1.15,
          }}
        >
          {manifest.nome}
        </h1>
        <p style={{ margin: 0, color: 'var(--pedra)', maxWidth: 520 }}>{manifest.descricao}</p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 28,
        }}
      >
        <Card tone="white" elevated padding={18}>
          <div style={monoLabel}>alertas abertos</div>
          <div style={displayNum}>{abertos}</div>
        </Card>
        <Card tone="white" elevated padding={18}>
          <div style={monoLabel}>gasto no histórico</div>
          <div style={{ ...displayNum, fontSize: 22 }}>{fmtBrl(gastoTotal)}</div>
        </Card>
        <Card tone="white" elevated padding={18}>
          <div style={monoLabel}>custo por contato</div>
          <div style={{ ...displayNum, fontSize: 22 }}>
            {cplMedio != null ? fmtBrl(cplMedio) : '—'}
          </div>
        </Card>
      </div>

      <Card tone="white" elevated padding={24} style={{ marginBottom: 32 }}>
        <h2 style={h2}>Importar números</h2>
        <ImportCsvForm />
      </Card>

      <h2 style={{ ...h2, marginBottom: 14 }}>Alertas</h2>
      <ListaAlertas
        alertas={alertas.map((a) => ({
          id: a.id,
          campanha: a.campanha,
          tipo: a.tipo,
          severidade: a.severidade,
          mensagem: a.mensagem,
          status: a.status,
          criadoEm: a.criadoEm.toISOString(),
        }))}
      />

      {metricas.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <h2 style={{ ...h2, marginBottom: 14 }}>Últimas métricas</h2>
          <Card tone="white" elevated padding={0} style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--areia)' }}>
                  {['data', 'campanha', 'gasto', 'contatos', 'custo/contato'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 14px',
                        fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                        fontWeight: 500,
                        fontSize: 11,
                        color: 'var(--pedra)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metricas.slice(0, 15).map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                    <td style={{ padding: '10px 14px' }}>
                      {m.data.toISOString().slice(0, 10)}
                    </td>
                    <td style={{ padding: '10px 14px' }}>{m.campanha}</td>
                    <td style={{ padding: '10px 14px' }}>{fmtBrl(Number(m.gasto))}</td>
                    <td style={{ padding: '10px 14px' }}>{m.leads}</td>
                    <td style={{ padding: '10px 14px' }}>
                      {m.cpl != null ? fmtBrl(Number(m.cpl)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  )
}

const monoLabel: CSSProperties = {
  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
  fontSize: 11,
  color: 'var(--pedra)',
  marginBottom: 6,
}

const displayNum: CSSProperties = {
  fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: 28,
}

const h2: CSSProperties = {
  fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: 18,
  margin: '0 0 14px',
}
