import type { ComponentType } from 'react'
import type { IconProps } from '@/core/ui/icons'

// O contrato que todo módulo assina (README §9: "o manifest é o contrato").
// Sidebar, cardápio e guard são genéricos: leem o registry e se montam sozinhos.

export type ModuleStatus = 'disponivel' | 'beta' | 'em_breve'

export interface ModuleManifest {
  /** Chave em tenant_modules.module_id (ex.: "midia"). */
  id: string
  /** Segmento de URL em /tools/<slug> (ex.: "anuncios"). */
  slug: string
  /** Nome exibido na sidebar e nos cards (ex.: "Anúncios"). */
  nome: string
  /** Descrição em língua de dono de negócio. */
  descricao: string
  icone: ComponentType<IconProps>
  status: ModuleStatus
  planoMinimo: 'essencial' | 'completo'
}

export interface ModuleUiProps {
  /** Caminho interno da ferramenta: /tools/<slug>/<...path>. */
  path: string[]
  tenantId: string
}

export interface RegisteredModule {
  manifest: ModuleManifest
  Ui: ComponentType<ModuleUiProps>
}
