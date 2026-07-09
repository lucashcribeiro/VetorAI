import type { ModuleManifest } from '../types'
import { IconRelatorios } from '@/core/ui/icons'

export const manifest: ModuleManifest = {
  id: 'relatorios',
  slug: 'relatorios',
  nome: 'Relatórios',
  descricao: 'Um resumo por mês, em uma página, sem jargão — quanto entrou, quanto custou, o que fazer.',
  icone: IconRelatorios,
  status: 'disponivel',
  planoMinimo: 'essencial',
  headlineVenda: 'O mês da sua empresa, em uma página que você entende.',
  beneficios: [
    'Números em língua de dono — sem CPL, sem ROAS na primeira tela',
    'Você manda o CSV e o que já sabe; a IA escreve o resumo',
    'Três ações prioritárias para o mês que vem',
    'Pronto para imprimir ou mandar pro sócio',
  ],
  oQueVocePrecisa: [
    'Export CSV do Meta ou Google do mês (opcional)',
    'Números que você já sabe: quanto entrou, quanto gastou, quantos clientes',
    '5 minutos para revisar o texto gerado',
  ],
}
