import type { ModuleManifest } from '../types'
import { IconRelatorios } from '@/core/ui/icons'

export const manifest: ModuleManifest = {
  id: 'relatorios',
  slug: 'relatorios',
  nome: 'Relatórios',
  descricao: 'Um resumo por mês, em uma página, sem jargão — quanto entrou, quanto custou, o que fazer.',
  icone: IconRelatorios,
  status: 'em_breve',
  planoMinimo: 'essencial',
}
