import { ModuloEmConstrucao } from '@/core/ui/ModuloEmConstrucao'

import { manifest } from '../manifest'

export default function ZeloUi() {
  return (
    <ModuloEmConstrucao
      nome={manifest.nome}
      descricao={manifest.descricao}
      previsao="fase 3 · v1 assistida: a ia sugere, sua equipe aprova"
    />
  )
}
