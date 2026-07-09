import { Card } from '@/core/ui/Card'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'

export default function SuportePage() {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <EyebrowLabel tone="muted">suporte</EyebrowLabel>
      </div>
      <Card tone="white" padding={28} style={{ maxWidth: 560 }}>
        <h1
          style={{
            fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 'var(--text-h3)',
            margin: '0 0 10px',
          }}
        >
          Problemas ou dúvidas?
        </h1>
        <p style={{ margin: '0 0 16px', color: 'var(--pedra)' }}>
          Escreva para{' '}
          <a href="mailto:oi@vetor.com.br" style={{ color: 'var(--vermelho-vetor)', fontWeight: 600 }}>
            oi@vetor.com.br
          </a>{' '}
          — resposta em até 4h úteis.
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'var(--pedra)',
          }}
        >
          seus dados são seus: só acessamos a operação com a sua autorização
        </p>
      </Card>
    </div>
  )
}
