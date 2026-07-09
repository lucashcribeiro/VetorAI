import type { ModuleUiProps } from '../../types'
import { Card } from '@/core/ui/Card'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { Badge } from '@/core/ui/Badge'
import {
  buscarConversa,
  contarAguardando,
  listarConversas,
  listarMensagens,
  mediaTempoPrimeiraResposta,
} from '../db'
import { formatarTempoResposta } from '../lib'
import { ListaConversas } from './ListaConversas'
import { SimularForm } from './SimularForm'
import { DetalheConversa } from './DetalheConversa'
import { manifest } from '../manifest'

export default async function ZeloUi({ path, tenantId }: ModuleUiProps) {
  const [seg] = path
  if (seg) {
    return <PaginaDetalhe tenantId={tenantId} id={seg} />
  }
  return <PaginaFila tenantId={tenantId} />
}

async function PaginaFila({ tenantId }: { tenantId: string }) {
  const [conversas, aguardando, mediaMs] = await Promise.all([
    listarConversas(tenantId),
    contarAguardando(tenantId),
    mediaTempoPrimeiraResposta(tenantId),
  ])

  return (
    <div>
      <header style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <EyebrowLabel>ferramenta · zelo · by vetor</EyebrowLabel>
          <Badge tone="outline">v1 assistido</Badge>
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 28,
        }}
      >
        <Card tone="white" elevated padding={18}>
          <div
            style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--pedra)',
              marginBottom: 6,
            }}
          >
            aguardando você
          </div>
          <div
            style={{
              fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 28,
            }}
          >
            {aguardando}
          </div>
        </Card>
        <Card tone="white" elevated padding={18}>
          <div
            style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--pedra)',
              marginBottom: 6,
            }}
          >
            tempo médio 1ª resposta
          </div>
          <div
            style={{
              fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 28,
            }}
          >
            {formatarTempoResposta(mediaMs)}
          </div>
        </Card>
      </div>

      <h2
        style={{
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 18,
          margin: '0 0 14px',
        }}
      >
        Fila
      </h2>
      <ListaConversas conversas={conversas} />

      <div style={{ marginTop: 36, maxWidth: 560 }}>
        <h2
          style={{
            fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            margin: '0 0 8px',
          }}
        >
          Simular (dev)
        </h2>
        <p style={{ margin: '0 0 14px', color: 'var(--pedra)', fontSize: 14 }}>
          Sem número Meta ainda? Simule uma mensagem de paciente e pratique a aprovação com um toque.
        </p>
        <Card tone="white" elevated padding={22}>
          <SimularForm />
        </Card>
      </div>
    </div>
  )
}

async function PaginaDetalhe({ tenantId, id }: { tenantId: string; id: string }) {
  const conversa = await buscarConversa(tenantId, id)
  if (!conversa) {
    return (
      <Card tone="white" padding={28}>
        <p style={{ margin: 0 }}>Conversa não encontrada.</p>
      </Card>
    )
  }

  const mensagens = await listarMensagens(tenantId, id)
  const sugestao = [...mensagens]
    .reverse()
    .find((m) => m.direcao === 'sugestao' && m.status === 'pendente')

  return (
    <DetalheConversa
      conversaId={conversa.id}
      nomeContato={conversa.nomeContato}
      waId={conversa.waId}
      status={conversa.status}
      tempoPrimeiraRespostaMs={conversa.tempoPrimeiraRespostaMs}
      mensagens={mensagens.map((m) => ({
        id: m.id,
        direcao: m.direcao,
        corpo: m.corpo,
        status: m.status,
        criadoEm: m.criadoEm.toISOString(),
      }))}
      sugestaoPendente={
        sugestao
          ? {
              id: sugestao.id,
              direcao: sugestao.direcao,
              corpo: sugestao.corpo,
              status: sugestao.status,
              criadoEm: sugestao.criadoEm.toISOString(),
            }
          : null
      }
    />
  )
}
