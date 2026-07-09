'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/core/ui/Badge'
import { Button } from '@/core/ui/Button'
import { Card } from '@/core/ui/Card'
import { labelStatus } from '../lib'
import {
  aprovarSelecionadosAction,
  aprovarUmAction,
  exportarAction,
  rejeitarAction,
} from '../server/actions'

export interface PostView {
  id: string
  titulo: string | null
  texto: string
  hashtags: string | null
  status: string
  canal: string
  agendadoPara: string | null
  semanaInicio: string
}

function badgeTone(status: string): 'accent' | 'dark' | 'outline' | 'neutral' {
  if (status === 'pendente') return 'accent'
  if (status === 'aprovado') return 'dark'
  if (status === 'exportado') return 'neutral'
  return 'outline'
}

export function FilaPosts({ posts }: { posts: PostView[] }) {
  const router = useRouter()
  const [sel, setSel] = useState<Record<string, boolean>>({})
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [exportTxt, setExportTxt] = useState<string | null>(null)

  const pendentes = useMemo(() => posts.filter((p) => p.status === 'pendente'), [posts])
  const selectedIds = Object.entries(sel)
    .filter(([, v]) => v)
    .map(([id]) => id)

  function toggle(id: string) {
    setSel((s) => ({ ...s, [id]: !s[id] }))
  }

  function selectAllPendentes() {
    const next: Record<string, boolean> = {}
    for (const p of pendentes) next[p.id] = true
    setSel(next)
  }

  function run(fn: () => Promise<void>) {
    setMsg(null)
    start(async () => {
      await fn()
      router.refresh()
    })
  }

  if (posts.length === 0) {
    return (
      <Card tone="osso" padding={28}>
        <p style={{ margin: 0, color: 'var(--pedra)' }}>
          Nenhum post ainda. Gere o calendário da semana — a IA monta a pauta e você aprova o que
          for ao ar.
        </p>
      </Card>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <Button type="button" variant="secondary" size="sm" disabled={pending || pendentes.length === 0} onClick={selectAllPendentes}>
          Selecionar pendentes
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={pending || selectedIds.length === 0}
          onClick={() =>
            run(async () => {
              const fd = new FormData()
              fd.set('postIds', selectedIds.join(','))
              const r = await aprovarSelecionadosAction(fd)
              setMsg(r.ok ? `${r.qtd} aprovado(s).` : r.erro)
              setSel({})
            })
          }
        >
          Aprovar selecionados
        </Button>
        <Button
          type="button"
          variant="dark"
          size="sm"
          disabled={pending}
          onClick={() =>
            run(async () => {
              const r = await exportarAction()
              if (!r.ok) {
                setMsg(r.erro)
                return
              }
              setMsg(`${r.qtd} exportado(s) — copie o texto abaixo.`)
              setExportTxt(r.texto ?? null)
            })
          }
        >
          Exportar aprovados
        </Button>
        {msg && <span style={{ fontSize: 13, color: 'var(--pedra)' }}>{msg}</span>}
      </div>

      {exportTxt && (
        <Card tone="white" elevated padding={16}>
          <pre
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontFamily: "var(--font-body), 'Work Sans', sans-serif",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {exportTxt}
          </pre>
        </Card>
      )}

      {posts.map((p) => (
        <Card key={p.id} tone="white" elevated padding={18}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            {p.status === 'pendente' && (
              <input
                type="checkbox"
                checked={!!sel[p.id]}
                onChange={() => toggle(p.id)}
                style={{ marginTop: 4 }}
                aria-label="Selecionar post"
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <Badge tone={badgeTone(p.status)}>{labelStatus(p.status)}</Badge>
                <span
                  style={{
                    fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: 'var(--pedra)',
                  }}
                >
                  {p.canal}
                  {p.agendadoPara
                    ? ` · ${new Intl.DateTimeFormat('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        timeZone: 'America/Sao_Paulo',
                      }).format(new Date(p.agendadoPara))}`
                    : ''}
                </span>
              </div>
              {p.titulo && (
                <div
                  style={{
                    fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  {p.titulo}
                </div>
              )}
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: 14 }}>{p.texto}</p>
              {p.hashtags && (
                <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--pedra)' }}>{p.hashtags}</p>
              )}
            </div>
            {p.status === 'pendente' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 'none' }}>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    run(async () => {
                      const r = await aprovarUmAction(p.id)
                      setMsg(r.ok ? 'Aprovado.' : r.erro)
                    })
                  }
                >
                  Aprovar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    run(async () => {
                      const r = await rejeitarAction(p.id)
                      setMsg(r.ok ? 'Rejeitado.' : r.erro)
                    })
                  }
                >
                  Rejeitar
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
