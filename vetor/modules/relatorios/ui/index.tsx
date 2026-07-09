import { ModuloEmConstrucao } from '@/core/ui/ModuloEmConstrucao'

import { manifest } from '../manifest'

export default function RelatoriosUi() {
  return (
    <ModuloEmConstrucao
      nome={manifest.nome}
      descricao={manifest.descricao}
      previsao="fase 2 · geração por ia a partir dos seus números"
    />
  )
}
