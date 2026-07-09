import { Card } from './Card'
import { EyebrowLabel } from './EyebrowLabel'
import { Badge } from './Badge'

/** Estado padrão de ferramenta ativa cuja funcionalidade chega numa fase futura. */
export function ModuloEmConstrucao({
  nome,
  descricao,
  previsao,
}: {
  nome: string
  descricao: string
  previsao: string
}) {
  return (
    <Card tone="white" padding={32} style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <EyebrowLabel>ferramenta · {nome.toLowerCase()}</EyebrowLabel>
        <Badge tone="outline">em construção</Badge>
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 'var(--text-h2, 30px)',
          lineHeight: 'var(--leading-heading, 1.25)',
          margin: '0 0 12px',
        }}
      >
        {nome}
      </h1>
      <p style={{ margin: 0, color: 'var(--pedra)', maxWidth: 520 }}>{descricao}</p>
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid var(--divider)',
          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          fontSize: 11,
          color: 'var(--pedra)',
        }}
      >
        {previsao}
      </div>
    </Card>
  )
}
