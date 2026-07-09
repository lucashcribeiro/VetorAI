import Link from 'next/link'
import { Badge } from '@/core/ui/Badge'
import { Card } from '@/core/ui/Card'
import type { ModuleManifest } from '@/modules/types'

function statusLabel(status: ModuleManifest['status']): string {
  if (status === 'disponivel') return 'disponível'
  if (status === 'beta') return 'beta'
  return 'em breve'
}

function statusTone(status: ModuleManifest['status']): 'dark' | 'accent' | 'outline' {
  if (status === 'disponivel') return 'dark'
  if (status === 'beta') return 'accent'
  return 'outline'
}

export function ModuleCard({ manifest }: { manifest: ModuleManifest }) {
  const Icon = manifest.icone
  return (
    <Link href={`/ferramentas/${manifest.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Card
        tone="white"
        elevated
        padding={24}
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          transition: 'transform .12s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--osso)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--carvao)',
            }}
          >
            <Icon size={20} />
          </div>
          <Badge tone={statusTone(manifest.status)}>{statusLabel(manifest.status)}</Badge>
        </div>
        <div>
          <h3
            style={{
              margin: '0 0 8px',
              fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            {manifest.nome}
          </h3>
          <p style={{ margin: 0, color: 'var(--pedra)', fontSize: 14, lineHeight: 1.5 }}>
            {manifest.descricao}
          </p>
        </div>
        <span
          style={{
            marginTop: 'auto',
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'var(--vermelho-vetor)',
          }}
        >
          {manifest.status === 'em_breve' ? 'tenho interesse →' : 'conhecer →'}
        </span>
      </Card>
    </Link>
  )
}
