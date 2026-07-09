import { ModuloEmConstrucao } from '@/core/ui/ModuloEmConstrucao'

import { manifest } from '../manifest'

export default function MidiaUi() {
  return (
    <ModuloEmConstrucao
      nome={manifest.nome}
      descricao={manifest.descricao}
      previsao="fase 6 · monitor com alerta antes do prejuízo"
    />
  )
}
