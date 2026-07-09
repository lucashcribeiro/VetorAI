import { task } from '@trigger.dev/sdk/v3'
import {
  executarGeracaoRelatorio,
  type GerarRelatorioPayload,
} from './gerar-relatorio'

// Task Trigger.dev — só roda quando a conta/Trigger estiver configurada.
// O fallback local (after()) chama executarGeracaoRelatorio direto.
export const gerarRelatorioTask = task({
  id: 'gerar-relatorio',
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: GerarRelatorioPayload) => {
    const resultado = await executarGeracaoRelatorio(payload)
    if (!resultado.ok) {
      throw new Error(resultado.erro)
    }
    return resultado
  },
})
