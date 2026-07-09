import { ModuloEmConstrucao } from '@/core/ui/ModuloEmConstrucao'
import type { ModuleUiProps } from '../../types'
import { manifest } from '../manifest'

export default function RelatoriosUi(_props: ModuleUiProps) {
  return (
    <ModuloEmConstrucao
      nome={manifest.nome}
      descricao={manifest.descricao}
      previsao="fase 2 · geração por ia a partir dos seus números"
    />
  )
}
