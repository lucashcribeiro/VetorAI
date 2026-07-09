import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'

export const metadata: Metadata = {
  title: 'Política de privacidade — VETOR',
  description: 'Como a VETOR trata dados pessoais (LGPD).',
}

export default function PrivacidadePage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
      <EyebrowLabel>legal · lgpd</EyebrowLabel>
      <h1 style={h1}>Política de privacidade</h1>
      <p style={muted}>
        Última atualização: julho de 2026. Alinhada à Lei nº 13.709/2018 (LGPD). Documento-base do
        beta.
      </p>

      <section style={section}>
        <h2 style={h2}>1. Controlador</h2>
        <p style={p}>
          A VETOR é controladora dos dados do site (leads de contato/diagnóstico) e operadora dos
          dados que o cliente coloca na plataforma em nome da empresa dele (tenants). Em relação
          aos dados operacionais do cliente, atuamos sob instruções do cliente (contrato/proposta).
        </p>
      </section>

      <section style={section}>
        <h2 style={h2}>2. Dados que coletamos</h2>
        <p style={p}>
          <strong>Site:</strong> nome, e-mail, telefone, empresa e mensagem em formulários de
          lead.
          <br />
          <strong>Plataforma:</strong> dados de conta (nome, e-mail, senha com hash), memberships,
          métricas e conteúdos que você ou sua equipe enviarem (CSV, textos, conversas do Zelo,
          etc.).
          <br />
          <strong>Técnicos:</strong> logs de acesso, cookies de sessão e preferência de empresa
          ativa.
        </p>
      </section>

      <section style={section}>
        <h2 style={h2}>3. Finalidades e bases</h2>
        <p style={p}>
          Execução de contrato e procedimentos preliminares (art. 7º, V); legítimo interesse para
          segurança e melhoria do produto (art. 7º, IX); consentimento quando aplicável em
          marketing. Não vendemos dados pessoais.
        </p>
      </section>

      <section style={section}>
        <h2 style={h2}>4. Compartilhamento</h2>
        <p style={p}>
          Usamos subprocessadores de infraestrutura (ex.: hospedagem em nuvem, banco Postgres,
          provedor de modelos de IA) sob contratos e apenas o necessário. Dados de um tenant não
          são expostos a outro tenant. O painel admin da VETOR prioriza saúde do sistema, não
          leitura operacional sem necessidade de suporte.
        </p>
      </section>

      <section style={section}>
        <h2 style={h2}>5. Retenção e segurança</h2>
        <p style={p}>
          Mantemos dados enquanto a conta/contrato estiver ativo e pelos prazos legais. Senhas são
          armazenadas com hash. Em caso de incidente relevante, comunicaremos conforme a LGPD.
        </p>
      </section>

      <section style={section}>
        <h2 style={h2}>6. Seus direitos</h2>
        <p style={p}>
          Acesso, correção, portabilidade, eliminação, informação sobre compartilhamentos e
          revogação de consentimento, quando couber. Solicite pelo contato do site ou suporte
          logado. Você pode reclamar à ANPD.
        </p>
      </section>

      <section style={section}>
        <h2 style={h2}>7. Contato do encarregado (DPO)</h2>
        <p style={p}>
          No beta, use o canal de contato do site com o assunto “LGPD / privacidade”. Atualizaremos
          e-mail dedicado de DPO quando o volume de titulares exigir.
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
