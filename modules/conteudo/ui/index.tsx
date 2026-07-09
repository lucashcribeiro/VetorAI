import { ModuloEmConstrucao } from '@/core/ui/ModuloEmConstrucao'
import type { ModuleUiProps } from '../../types'
import { manifest } from '../manifest'

export default function ConteudoUi(_props: ModuleUiProps) {
  return (
    <ModuloEmConstrucao
      nome={manifest.nome}
      descricao={manifest.descricao}
      previsao="fase 5 · calendário e fila de aprovação"
    />
  )
}
