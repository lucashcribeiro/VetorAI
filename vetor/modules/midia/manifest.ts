import type { ModuleManifest } from '../types'
import { IconAnuncios } from '@/core/ui/icons'

export const manifest: ModuleManifest = {
  id: 'midia',
  slug: 'anuncios',
  nome: 'Anúncios',
  descricao: 'Seus anúncios no Google e Instagram, medidos por uma coisa só: quanto custa trazer um cliente novo.',
  icone: IconAnuncios,
  status: 'em_breve',
  planoMinimo: 'essencial',
}
