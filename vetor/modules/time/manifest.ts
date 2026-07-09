import type { ModuleManifest } from '../types'
import { IconEquipe } from '@/core/ui/icons'

export const manifest: ModuleManifest = {
  id: 'time',
  slug: 'time',
  nome: 'Time VETOR',
  descricao:
    'Cole o brief e o time roda sozinho: Órbita → Atlas → Lumen → Mídia → Prisma (QA). Se falhar, volta e refaz.',
  icone: IconEquipe,
  status: 'beta',
  planoMinimo: 'completo',
  headlineVenda: 'Pipeline de operações de IA com QA automático e retrabalho.',
  beneficios: [
    'Você não escolhe funcionário — a ordem é automática',
    'Prisma revisa qualidade e devolve para quem errou',
    'Compliance CFO/SUSEP embutido',
    'Dossiê da plataforma alimenta o time',
  ],
  oQueVocePrecisa: [
    'Brief honesto do cliente (verba, região, diferenciais)',
    'Dossiê preenchido em Configurações',
    'Chave Anthropic configurada',
  ],
}
