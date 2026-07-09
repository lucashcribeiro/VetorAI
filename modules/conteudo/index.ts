import type { RegisteredModule } from '../types'
import { manifest } from './manifest'
import Ui from './ui'

export const conteudo: RegisteredModule = { manifest, Ui }
