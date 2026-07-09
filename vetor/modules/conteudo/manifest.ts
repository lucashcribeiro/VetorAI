import type { ModuleManifest } from '../types'
import { IconConteudo } from '@/core/ui/icons'

export const manifest: ModuleManifest = {
  id: 'conteudo',
  slug: 'conteudo',
  nome: 'Conteúdo',
  descricao: 'A IA prepara os posts com base no que funciona para o seu negócio. Nada vai ao ar sem a sua aprovação.',
  icone: IconConteudo,
  status: 'beta',
  planoMinimo: 'essencial',
  headlineVenda: 'Posts prontos com a cara do seu negócio — você só aprova.',
  beneficios: [
    'Pauta semanal a partir do dossiê da sua empresa',
    'Nada publica sozinho: você aprova em lote',
    'Tom e conformidade pensados para o seu segmento',
    'Menos “o que postar hoje?” e mais execução',
  ],
  oQueVocePrecisa: [
    'Segmento e tom da marca (dossiê ou conversa de diagnóstico)',
    'Aprovação em lote uma vez por semana (~10 min)',
    'Exportar/publicar o que foi aprovado (v1 manual)',
  ],
}
