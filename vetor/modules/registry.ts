import type { RegisteredModule } from './types'
import { relatorios } from './relatorios'
import { conteudo } from './conteudo'
import { midia } from './midia'
import { zelo } from './zelo'
import { time } from './time'

// Lista de todos os módulos instalados. Sidebar, cardápio e guard leem daqui.
// Adicionar ferramenta = criar pasta + registrar aqui + migration. Nada mais.
export const registry: RegisteredModule[] = [relatorios, conteudo, midia, zelo, time]

export function getModuleBySlug(slug: string): RegisteredModule | undefined {
  return registry.find((m) => m.manifest.slug === slug)
}

export function getModuleById(id: string): RegisteredModule | undefined {
  return registry.find((m) => m.manifest.id === id)
}
