import type { ModuleManifest } from '../types'
import { IconAnuncios } from '@/core/ui/icons'

export const manifest: ModuleManifest = {
  id: 'midia',
  slug: 'anuncios',
  nome: 'Anúncios',
  descricao: 'Seus anúncios no Google e Instagram, medidos por uma coisa só: quanto custa trazer um cliente novo.',
  icone: IconAnuncios,
  status: 'beta',
  planoMinimo: 'essencial',
  headlineVenda: 'Saiba se o anúncio está barato ou caro em cliente novo — todo dia.',
  beneficios: [
    'Um número que importa: quanto custa trazer cada cliente',
    'Alerta quando algo sai do eixo, antes de você perceber',
    'Começa com CSV; API da Meta quando fizer sentido',
    'Língua de dono, não de mídia',
  ],
}
