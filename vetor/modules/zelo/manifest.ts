import type { ModuleManifest } from '../types'
import { IconZelo } from '@/core/ui/icons'

export const manifest: ModuleManifest = {
  id: 'zelo',
  slug: 'zelo',
  nome: 'Zelo',
  descricao: 'Recepcionista de IA no WhatsApp: atende, qualifica e agenda — com a sua equipe aprovando cada resposta no começo.',
  icone: IconZelo,
  status: 'beta',
  planoMinimo: 'completo',
  headlineVenda: 'WhatsApp atendido com carinho — a IA sugere, a sua equipe decide.',
  beneficios: [
    'Sugestão de resposta em segundos, com tom da sua marca',
    'Nada sai sem um toque de aprovação (v1 assistido)',
    'Fila clara: quem espera, o que foi dito, o que fazer',
    'Mede tempo de primeira resposta — métrica que vira valor',
  ],
}
