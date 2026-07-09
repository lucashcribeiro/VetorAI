import type { ModuleManifest } from '../types'
import { IconEquipe } from '@/core/ui/icons'

export const manifest: ModuleManifest = {
  id: 'time',
  slug: 'time',
  nome: 'Time VETOR',
  descricao:
    'Os 5 funcionários de IA: Órbita, Atlas, Lumen, Vetor Mídia e Prisma — brief, checkpoint e entregáveis aprovados.',
  icone: IconEquipe,
  status: 'beta',
  planoMinimo: 'completo',
  headlineVenda: 'Seu time de operações de IA, com checkpoint humano em cada etapa.',
  beneficios: [
    'Estratégia, copy, mídia e relatório no mesmo lugar',
    'Nada vai ao cliente em rascunho — você aprova',
    'Compliance CFO/SUSEP embutido nas skills',
    'Dossiê da plataforma alimenta cada funcionário',
  ],
  oQueVocePrecisa: [
    'Brief honesto do cliente (verba, região, diferenciais)',
    'Dossiê preenchido em Configurações',
    'Sua revisão em cada checkpoint',
  ],
}
