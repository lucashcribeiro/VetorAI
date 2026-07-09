import type { RegisteredModule } from '../types'
import { manifest } from './manifest'
import Ui from './ui'

// Entrada do registry. Jobs/actions ficam em paths próprios (não reexportar
// server-only daqui — o registry também é importado em testes unitários).
export const relatorios: RegisteredModule = { manifest, Ui }
