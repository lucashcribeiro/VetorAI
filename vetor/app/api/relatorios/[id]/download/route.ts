import { NextResponse } from 'next/server'
import { requireTenantContext } from '@/core/tenant/context'
import { isModuleActive } from '@/core/tenant/modules'
import { buscarRelatorio } from '@/modules/relatorios/db'
import { mesPorExtenso } from '@/modules/relatorios/lib'

// Download autenticado do HTML do relatório (substitui blob quando BLOB_TOKEN ausente).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const tenant = await requireTenantContext()
  const ativo = await isModuleActive(tenant.id, 'relatorios')
  if (!ativo) {
    return NextResponse.json({ erro: 'Módulo inativo' }, { status: 403 })
  }

  const relatorio = await buscarRelatorio(tenant.id, id)
  if (!relatorio || !relatorio.conteudoHtml) {
    return NextResponse.json({ erro: 'Relatório não encontrado' }, { status: 404 })
  }
  if (relatorio.status !== 'pronto') {
    return NextResponse.json({ erro: 'Relatório ainda não está pronto' }, { status: 409 })
  }

  const nome = `relatorio-${relatorio.mes}-${tenant.slug}.html`
  return new NextResponse(relatorio.conteudoHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nome}"`,
      'X-Relatorio-Mes': mesPorExtenso(relatorio.mes),
      'Cache-Control': 'private, no-store',
    },
  })
}
