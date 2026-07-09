// Catálogo + pipeline automática do Time VETOR.

export type AgenteId =
  | 'orquestrador'
  | 'estrategista'
  | 'copywriter'
  | 'gestor_midia'
  | 'analista_bi'

export interface AgenteDef {
  id: AgenteId
  codinome: string
  cargo: string
  descricao: string
  promptFile: string
  tipos: string[]
  tipoPadrao: string
}

export const AGENTES: AgenteDef[] = [
  {
    id: 'orquestrador',
    codinome: 'Órbita',
    cargo: 'Diretor',
    descricao: 'Lê o brief, monta o plano de trabalho e consolida o time.',
    promptFile: 'orquestrador.v1.md',
    tipos: ['plano-trabalho', 'sumario'],
    tipoPadrao: 'plano-trabalho',
  },
  {
    id: 'estrategista',
    codinome: 'Atlas',
    cargo: 'Estrategista',
    descricao: 'Nicho, posicionamento, funil e plano GTM.',
    promptFile: 'estrategista.v1.md',
    tipos: ['mapa-de-nicho', 'plano-gtm'],
    tipoPadrao: 'mapa-de-nicho',
  },
  {
    id: 'copywriter',
    codinome: 'Lumen',
    cargo: 'Copywriter',
    descricao: 'Copy de anúncios e posts com compliance CFO/SUSEP.',
    promptFile: 'copywriter.v1.md',
    tipos: ['copy-ads', 'copy-posts'],
    tipoPadrao: 'copy-ads',
  },
  {
    id: 'gestor_midia',
    codinome: 'Vetor Mídia',
    cargo: 'Gestor de tráfego',
    descricao: 'Estrutura de campanha Meta Ads, verba e otimização.',
    promptFile: 'gestor-midia.v1.md',
    tipos: ['estrutura-campanha'],
    tipoPadrao: 'estrutura-campanha',
  },
  {
    id: 'analista_bi',
    codinome: 'Prisma',
    cargo: 'BI + QA',
    descricao: 'Analisa qualidade do pacote, aponta retrabalho e consolida o relatório.',
    promptFile: 'analista-bi.v1.md',
    tipos: ['qa', 'relatorio-mensal', 'sumario'],
    tipoPadrao: 'qa',
  },
]

/** Ordem fixa da pipeline automática (sem escolher funcionário). */
export const PIPELINE: AgenteId[] = [
  'orquestrador',
  'estrategista',
  'copywriter',
  'gestor_midia',
  'analista_bi',
]

export const MAX_TENTATIVAS_QA = 2

export function getAgente(id: string): AgenteDef | undefined {
  return AGENTES.find((a) => a.id === id)
}

export function labelEtapa(id: string): string {
  return getAgente(id)?.codinome ?? id
}
