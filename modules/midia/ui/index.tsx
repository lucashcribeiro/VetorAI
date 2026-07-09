import { ModuloEmConstrucao } from '@/core/ui/ModuloEmConstrucao'
import type { ModuleUiProps } from '../../types'
import { manifest } from '../manifest'

export default function MidiaUi(_props: ModuleUiProps) {
  return (
    <ModuloEmConstrucao
      nome={manifest.nome}
      descricao={manifest.descricao}
      previsao="fase 6 · monitor com alerta antes do prejuízo"
    />
  )
}
