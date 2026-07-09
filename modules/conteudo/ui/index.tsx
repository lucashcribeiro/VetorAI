import { ModuloEmConstrucao } from '@/core/ui/ModuloEmConstrucao'

import { manifest } from '../manifest'

export default function ConteudoUi() {
  return (
    <ModuloEmConstrucao
      nome={manifest.nome}
      descricao={manifest.descricao}
      previsao="fase 5 · calendário e fila de aprovação"
    />
  )
}
