import type { Metadata } from 'next'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { Card } from '@/core/ui/Card'
import { LeadForm } from '../components/LeadForm'

export const metadata: Metadata = {
  title: 'Contato — VETOR',
  description: 'Fale com a VETOR para agendar um diagnóstico ou tirar dúvidas sobre a plataforma.',
}

export default function ContatoPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
      <EyebrowLabel>contato</EyebrowLabel>
      <h1
        style={{
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(32px, 4vw, 40px)',
          margin: '12px 0 12px',
        }}
      >
        Vamos conversar
      </h1>
      <p style={{ margin: '0 0 32px', color: 'var(--pedra)', lineHeight: 1.55 }}>
        Diagnóstico, parceria ou dúvida sobre uma ferramenta. Resposta humana — sem funil
        automático de 12 e-mails.
      </p>
      <Card tone="white" elevated padding={28}>
        <LeadForm
          origem="contato"
          submitLabel="Enviar mensagem"
          mensagemPlaceholder="Como podemos ajudar?"
        />
      </Card>
    </main>
  )
}
