import Link from 'next/link'
import { db } from '@/core/db/client'
import { Card } from '@/core/ui/Card'
import { Badge } from '@/core/ui/Badge'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'

// Leads do site público (validação de demanda) — só SUPER_ADMIN.
export default async function AdminLeadsPage() {
  const leads = await db.lead.findMany({
    orderBy: { criadoEm: 'desc' },
    take: 100,
  })

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Link
          href="/admin"
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'var(--pedra)',
          }}
        >
          ← saúde
        </Link>
      </div>
      <EyebrowLabel>leads · site público</EyebrowLabel>
      <h1
        style={{
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 28,
          margin: '10px 0 20px',
        }}
      >
        Demanda capturada
      </h1>

      {leads.length === 0 ? (
        <Card tone="osso" padding={24}>
          <p style={{ margin: 0, color: 'var(--pedra)' }}>
            Nenhum lead ainda. Formulários de /contato, diagnóstico e tenho interesse gravam aqui.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leads.map((l) => (
            <Card key={l.id} tone="white" elevated padding={18}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <Badge tone="outline">{l.origem}</Badge>
                {l.moduleId ? <Badge tone="neutral">{l.moduleId}</Badge> : null}
                <span
                  style={{
                    fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: 'var(--pedra)',
                  }}
                >
                  {new Intl.DateTimeFormat('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                    timeZone: 'America/Sao_Paulo',
                  }).format(l.criadoEm)}
                </span>
              </div>
              <div style={{ fontWeight: 600 }}>
                {l.nome || '—'} · {l.email}
              </div>
              {l.telefone || l.empresa ? (
                <div style={{ fontSize: 13, color: 'var(--pedra)', marginTop: 4 }}>
                  {[l.telefone, l.empresa].filter(Boolean).join(' · ')}
                </div>
              ) : null}
              {l.mensagem ? (
                <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.45 }}>{l.mensagem}</p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
