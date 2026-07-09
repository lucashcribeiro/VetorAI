import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'

export const metadata: Metadata = {
  title: 'Termos de uso — VETOR',
  description: 'Termos de uso da plataforma e serviços VETOR.',
}

export default function TermosPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
      <EyebrowLabel>legal</EyebrowLabel>
      <h1 style={h1}>Termos de uso</h1>
      <p style={muted}>Última atualização: julho de 2026. Documento-base do beta — pode evoluir.</p>

      <section style={section}>
        <h2 style={h2}>1. Quem somos</h2>
        <p style={p}>
          A VETOR oferece consultoria de IA e uma plataforma multi-tenant onde o cliente opera
          ferramentas (relatórios, conteúdo, anúncios, WhatsApp assistido, etc.). Estes termos
          regem o uso do site e da plataforma.
        </p>
      </section>

      <section style={section}>
        <h2 style={h2}>2. Conta e empresas</h2>
        <p style={p}>
          Você é responsável pelas credenciais da sua conta e pelos usuários que convidar. Cada
          empresa (tenant) tem dados isolados. O dono (OWNER) gerencia equipe e módulos ativos.
        </p>
      </section>

      <section style={section}>
        <h2 style={h2}>3. Uso aceitável</h2>
        <p style={p}>
          É proibido usar a plataforma para ilegalidade, spam, engenharia reversa abusiva ou
          compartilhar acesso com quem não faz parte da empresa contratante. Conteúdos gerados por
          IA devem ser revisados por humanos antes de publicação ou envio a clientes finais (Zelo
          v1 exige aprovação).
        </p>
      </section>

      <section style={section}>
        <h2 style={h2}>4. Pagamento (beta)</h2>
        <p style={p}>
          Neste beta a cobrança é <strong>manual</strong> (Pix/boleto). Valores e planos são
          combinados por proposta ou diagnóstico. Atrasos podem resultar em suspensão de acesso
          após aviso.
        </p>
      </section>

      <section style={section}>
        <h2 style={h2}>5. Propriedade intelectual</h2>
        <p style={p}>
          O software, marca VETOR, prompts e infraestrutura são da VETOR. Os dados do cliente e os
          conteúdos gerados a partir dos dados do cliente pertencem ao cliente, ressalvado o
          direito da VETOR de usar dados agregados e anonimizados para melhorar o serviço.
        </p>
      </section>

      <section style={section}>
        <h2 style={h2}>6. Limitação</h2>
        <p style={p}>
          A plataforma é fornecida “como está” no beta. Não garantimos resultados comerciais
          específicos. Em nenhuma hipótese a VETOR responde por lucros cessantes além do valor pago
          nos últimos 3 meses pelo serviço, na medida permitida pela lei.
        </p>
      </section>

      <section style={section}>
        <h2 style={h2}>7. Contato</h2>
        <p style={p}>
          Dúvidas: use a página de contato do site ou o suporte dentro da plataforma (usuários
          logados).
        </p>
      </section>
    </main>
  )
}

const h1: CSSProperties = {
  fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: 'clamp(28px, 4vw, 36px)',
  margin: '12px 0 8px',
}
const h2: CSSProperties = {
  fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: 18,
  margin: '0 0 10px',
}
const p: CSSProperties = { margin: 0, lineHeight: 1.6, color: 'var(--carvao)', fontSize: 15 }
const muted: CSSProperties = { margin: '0 0 32px', color: 'var(--pedra)', fontSize: 13 }
const section: CSSProperties = { marginBottom: 28 }
