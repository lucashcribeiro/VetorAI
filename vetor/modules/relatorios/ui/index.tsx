import Link from 'next/link'
import type { ModuleUiProps } from '../../types'
import { Card } from '@/core/ui/Card'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'
import { Button } from '@/core/ui/Button'
import { listarRelatorios, buscarRelatorio } from '../db'
import { GerarForm } from './GerarForm'
import { ListaRelatorios } from './ListaRelatorios'
import { DetalheRelatorio } from './DetalheRelatorio'
import { manifest } from '../manifest'

export default async function RelatoriosUi({ path, tenantId }: ModuleUiProps) {
  const [seg, ...rest] = path

  if (seg === 'novo' && rest.length === 0) {
    return <PaginaNovo />
  }

  if (seg && rest.length === 0 && seg !== 'novo') {
    return <PaginaDetalhe tenantId={tenantId} id={seg} />
  }

  return <PaginaLista tenantId={tenantId} />
}

async function PaginaLista({ tenantId }: { tenantId: string }) {
  const relatorios = await listarRelatorios(tenantId)

  return (
    <div>
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 28,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <EyebrowLabel>ferramenta · relatórios</EyebrowLabel>
          <h1
            style={{
              fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 'var(--text-h1, 36px)',
              margin: '10px 0 6px',
              lineHeight: 1.15,
            }}
          >
            {manifest.nome}
          </h1>
          <p style={{ margin: 0, color: 'var(--pedra)', maxWidth: 480 }}>{manifest.descricao}</p>
        </div>
        <Link href="/tools/relatorios/novo" style={{ textDecoration: 'none' }}>
          <Button variant="primary" type="button">
            Novo relatório
          </Button>
        </Link>
      </header>

      <ListaRelatorios relatorios={relatorios} />
    </div>
  )
}

function PaginaNovo() {
  return (
    <div style={{ maxWidth: 800 }}>
      <Link
        href="/tools/relatorios"
        style={{
          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          fontSize: 11,
          color: 'var(--pedra)',
          textDecoration: 'none',
        }}
      >
        ← relatórios
      </Link>
      <h1
        style={{
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 'var(--text-h2, 30px)',
          margin: '12px 0 8px',
        }}
      >
        Novo relatório
      </h1>
      <p style={{ margin: '0 0 24px', color: 'var(--pedra)', maxWidth: 520 }}>
        Preencha o que você já sabe do mês. Se tiver o CSV do Meta ou do Google, anexe — a IA
        transforma isso numa página que o dono entende.
      </p>
      <Card tone="white" elevated padding={28}>
        <GerarForm />
      </Card>
    </div>
  )
}

async function PaginaDetalhe({ tenantId, id }: { tenantId: string; id: string }) {
  const relatorio = await buscarRelatorio(tenantId, id)
  if (!relatorio) {
    return (
      <Card tone="white" padding={28}>
        <p style={{ margin: 0 }}>Relatório não encontrado.</p>
        <Link href="/tools/relatorios" style={{ color: 'var(--vermelho-vetor)', fontSize: 14 }}>
          Voltar
        </Link>
      </Card>
    )
  }

  return (
    <DetalheRelatorio
      id={relatorio.id}
      mes={relatorio.mes}
      status={relatorio.status}
      resumo={relatorio.resumo}
      erro={relatorio.erro}
      conteudoHtml={relatorio.conteudoHtml}
      arquivoUrl={relatorio.arquivoUrl}
    />
  )
}
