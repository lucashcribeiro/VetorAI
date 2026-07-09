// Registro central de jobs do Trigger.dev.
// Cada módulo exporta suas tasks em modules/<nome>/jobs/ e elas entram aqui.

export { gerarRelatorioTask } from '../modules/relatorios/jobs/trigger-task'
// Fase 6: análise diária de anúncios (histórico; Meta API depois)
// export { rodarAnaliseDiariaTodosTenants } from '../modules/midia/jobs/analise-diaria'
