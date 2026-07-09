import type { ReactNode } from 'react'
import { requireTenantContext } from '@/core/tenant/context'
import { getActiveModuleIds } from '@/core/tenant/modules'
import { getModuleById } from '@/modules/registry'
import { AppShell, type NavModule } from '@/core/ui/AppShell'

export default async function PlatformLayout({ children }: { children: ReactNode }) {
  const tenant = await requireTenantContext()
  const ativos = await getActiveModuleIds(tenant.id)

  // Sidebar = registry × tenant_modules; módulo inativo não aparece.
  const modulos: NavModule[] = ativos
    .map((id) => getModuleById(id))
    .filter((m) => m !== undefined)
    .map((m) => ({
      slug: m.manifest.slug,
      nome: m.manifest.nome,
      icone: m.manifest.icone,
    }))

  return (
    <AppShell tenantNome={tenant.nome} tenantSegmento={tenant.segmento} modulos={modulos}>
      {children}
    </AppShell>
  )
}
