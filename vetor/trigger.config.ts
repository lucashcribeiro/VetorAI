import { defineConfig } from '@trigger.dev/sdk/v3'

// Config mínima do Trigger.dev (Fase 2).
// Preencha TRIGGER_SECRET_KEY / project ref no dashboard e rode `npx trigger.dev@latest dev`.
export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? 'proj_vetor_placeholder',
  runtime: 'node',
  logLevel: 'info',
  maxDuration: 300,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 15000,
      factor: 2,
    },
  },
  dirs: ['./trigger', './modules/relatorios/jobs'],
})
