import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { requireTenantContext } from '@/core/tenant/context'
import { getActiveModuleIds } from '@/core/tenant/modules'
import { registry, getModuleById } from '@/modules/registry'
import { db } from '@/core/db/client'
import { Card } from '@/core/ui/Card'
import { Badge } from '@/core/ui/Badge'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { registrarInteresse } from './actions'

function saudacao(hora: number): string {
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

const displayFont = {
  fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
  fontWeight: 700,
} as const

const monoFont = {
  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
} as const

export default async function DashboardPage() {
  const tenant = await requireTenantContext()
  const user = await currentUser()
  const ativos = await getActiveModuleIds(tenant.id)

  const [pendentes, atividades] = await Promise.all([
    db.event.count({ where: { tenantId: tenant.id, processado: false } }),
    db.activityLog.findMany({
      where: { tenantId: tenant.id },
      orderBy: { criadoEm: 'desc' },
      take: 8,
    }),
  ])

  const modulosAtivos = ativos
    .map((id) => getModuleById(id))
    .filter((m) => m !== undefined)
  const upsell = registry.find((m) => !ativos.includes(m.manifest.id))

  const agora = new Date()
  const dataFmt = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(agora)

  return (
    <div>
      {/* Topo: contexto + saudação + pendências */}
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <EyebrowLabel tone="muted">
            {tenant.nome.toLowerCase()} · {dataFmt}
          </EyebrowLabel>
          <Link
            href="/configuracoes/equipe"
            style={{
              ...monoFont,
              fontSize: 11,
              color: 'var(--carvao)',
              border: '1px solid var(--areia)',
              borderRadius: 999,
              padding: '6px 14px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Convidar equipe
          </Link>
        </div>
        <h1 style={{ ...displayFont, fontSize: 'var(--text-h1)', margin: '12px 0 6px', lineHeight: 1.15 }}>
          {saudacao(Number(new Intl.DateTimeFormat('pt-BR', { hour: 'numeric', hour12: false, timeZone: 'America/Sao_Paulo' }).format(agora)))}
          {user?.firstName ? `, ${user.firstName}.` : '.'}
        </h1>
        <p style={{ margin: 0, color: 'var(--pedra)' }}>
          {pendentes > 0 ? (
            <>
              <strong style={{ color: 'var(--vermelho-vetor)' }}>{pendentes}</strong>{' '}
              {pendentes === 1 ? 'item aguarda' : 'itens aguardam'} sua atenção.
            </>
          ) : (
            'Tudo em dia — nada esperando por você.'
          )}
        </p>
      </header>

      {/* Ferramentas ativas */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 14 }}>
          <EyebrowLabel tone="muted">
            suas ferramentas · {modulosAtivos.length} {modulosAtivos.length === 1 ? 'ativa' : 'ativas'}
          </EyebrowLabel>
        </div>

        {modulosAtivos.length === 0 ? (
          <Card tone="white" padding={28}>
            <p style={{ margin: 0, color: 'var(--pedra)' }}>
              Nenhuma ferramenta ativa ainda. Assim que o diagnóstico terminar, elas aparecem aqui.
            </p>
          </Card>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {modulosAtivos.map((m) => {
              const Icone = m.manifest.icone
              return (
                <Link
                  key={m.manifest.id}
                  href={`/tools/${m.manifest.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Card tone="white" padding={22} elevated style={{ height: '100%' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          display: 'grid',
                          placeItems: 'center',
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: 'var(--osso)',
                          color: 'var(--carvao)',
                        }}
                      >
                        <Icone size={18} />
                      </span>
                      <Badge tone="outline">
                        {m.manifest.status === 'em_breve' ? 'em preparação' : 'saudável'}
                      </Badge>
                    </div>
                    <div style={{ ...displayFont, fontSize: 18, marginBottom: 6 }}>
                      {m.manifest.nome}
                    </div>
                    <p style={{ margin: 0, fontSize: 13.5, color: 'var(--pedra)', lineHeight: 1.55 }}>
                      {m.manifest.descricao}
                    </p>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Duas colunas: atividade recente + upsell */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        <Card tone="white" padding={24}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <span style={{ ...displayFont, fontSize: 16 }}>Atividade recente</span>
            <EyebrowLabel tone="muted">últimos registros</EyebrowLabel>
          </div>
          {atividades.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--pedra)' }}>
              Nada por aqui ainda. Quando a IA gerar algo ou alguém aprovar, aparece nesta lista.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {atividades.map((a) => (
                <li
                  key={a.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '9px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontSize: 13.5,
                  }}
                >
                  <span>{a.acao}</span>
                  <span style={{ ...monoFont, fontSize: 10.5, color: 'var(--pedra)', whiteSpace: 'nowrap' }}>
                    {new Intl.DateTimeFormat('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'America/Sao_Paulo',
                    }).format(a.criadoEm)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {upsell && (
          <div
            style={{
              border: '1.5px dashed var(--areia)',
              borderRadius: 10,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <EyebrowLabel tone="muted">não contratada</EyebrowLabel>
            <div style={{ ...displayFont, fontSize: 16 }}>
              {upsell.manifest.nome}
              {upsell.manifest.id === 'zelo' && (
                <span style={{ ...monoFont, fontWeight: 500, fontSize: 10.5, color: 'var(--pedra)' }}>
                  {' '}
                  · by vetor
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--pedra)', lineHeight: 1.55 }}>
              {upsell.manifest.descricao}
            </p>
            <form action={registrarInteresse.bind(null, upsell.manifest.id)} style={{ marginTop: 'auto' }}>
              <button
                type="submit"
                style={{
                  fontFamily: "var(--font-body), 'Work Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 13,
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: '1px solid var(--carvao)',
                  background: 'transparent',
                  color: 'var(--carvao)',
                  cursor: 'pointer',
                }}
              >
                Tenho interesse
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  )
}
