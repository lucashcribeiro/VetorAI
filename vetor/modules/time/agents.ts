// Catálogo dos 5 funcionários do Time VETOR (skills → plataforma).

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
  /** Agentes cujos entregáveis aprovados entram no contexto (se existirem). */
  dependeDe: AgenteId[]
}

export const AGENTES: AgenteDef[] = [
  {
    id: 'orquestrador',
    codinome: 'Órbita',
    cargo: 'Diretor',
    descricao: 'Recebe o brief, monta o plano e consolida o time — sem produzir entrega final sozinho.',
    promptFile: 'orquestrador.v1.md',
    tipos: ['plano-trabalho', 'sumario'],
    tipoPadrao: 'plano-trabalho',
    dependeDe: [],
  },
  {
    id: 'estrategista',
    codinome: 'Atlas',
    cargo: 'Estrategista',
    descricao: 'Nicho, posicionamento, funil e plano GTM. Primeiro a atuar em cliente novo.',
    promptFile: 'estrategista.v1.md',
    tipos: ['mapa-de-nicho', 'plano-gtm'],
    tipoPadrao: 'mapa-de-nicho',
    dependeDe: [],
  },
  {
    id: 'copywriter',
    codinome: 'Lumen',
    cargo: 'Copywriter',
    descricao: 'Copy de anúncios, posts e scripts com gate CFO/SUSEP.',
    promptFile: 'copywriter.v1.md',
    tipos: ['copy-ads', 'copy-posts', 'script-whatsapp'],
    tipoPadrao: 'copy-ads',
    dependeDe: ['estrategista'],
  },
  {
    id: 'gestor_midia',
    codinome: 'Vetor Mídia',
    cargo: 'Gestor de tráfego',
    descricao: 'Estrutura de campanha Meta Ads, verba e regras de otimização.',
    promptFile: 'gestor-midia.v1.md',
    tipos: ['estrutura-campanha'],
    tipoPadrao: 'estrutura-campanha',
    dependeDe: ['estrategista', 'copywriter'],
  },
  {
    id: 'analista_bi',
    codinome: 'Prisma',
    cargo: 'Analista de BI',
    descricao: 'Relatório mensal em língua de dono — o entregável que renova contrato.',
    promptFile: 'analista-bi.v1.md',
    tipos: ['relatorio-mensal'],
    tipoPadrao: 'relatorio-mensal',
    dependeDe: [],
  },
]

export function getAgente(id: string): AgenteDef | undefined {
  return AGENTES.find((a) => a.id === id)
}
