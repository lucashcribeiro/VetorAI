import { notFound } from 'next/navigation'
import { getModuleBySlug } from '@/modules/registry'
import { requireTenantContext } from '@/core/tenant/context'
import { isModuleActive } from '@/core/tenant/modules'
import { ModuloInativo } from '@/core/ui/ModuloInativo'
import { registrarInteresse } from '../../../dashboard/actions'

// Rota genérica de TODAS as ferramentas (README §9): módulo novo não cria
// rota nova. Guard: registry → tenant_modules → delega para a UI do módulo.
export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string; path?: string[] }>
}) {
  const { slug, path = [] } = await params

  const mod = getModuleBySlug(slug)
  if (!mod) notFound()

  const tenant = await requireTenantContext()
  const ativo = await isModuleActive(tenant.id, mod.manifest.id)

  if (!ativo) {
    return (
      <ModuloInativo
        nome={mod.manifest.nome}
        descricao={mod.manifest.descricao}
        icone={mod.manifest.icone}
        solicitarAction={async () => {
          'use server'
          await registrarInteresse(mod.manifest.id)
        }}
      />
    )
  }

  const Ui = mod.Ui
  return <Ui path={path} tenantId={tenant.id} />
}
