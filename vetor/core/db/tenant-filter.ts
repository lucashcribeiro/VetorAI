// ADR-003 — isolamento à prova de esquecimento.
// Função pura que reescreve os args de uma query Prisma para dentro do tenant.

const TENANT_SCOPED_MODELS = new Set([
  'TenantModule',
  'Membership',
  'ActivityLog',
  'Event',
  'AiUsage',
  'Dossie',
  'AgentRun',
  'RelatorioGerado',
  'ZeloConversa',
  'ZeloMensagem',
  'ConteudoPost',
])

// Operações cujo `where` aceita filtro arbitrário.
const WHERE_OPS = new Set([
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'count',
  'aggregate',
  'groupBy',
  'updateMany',
  'deleteMany',
])

// Operações que criam linhas — o tenantId entra nos dados.
const CREATE_OPS = new Set(['create', 'createMany', 'createManyAndReturn', 'upsert'])

type Args = Record<string, unknown>

export function isTenantScoped(model: string): boolean {
  return TENANT_SCOPED_MODELS.has(model)
}

export function scopeArgs(model: string, operation: string, args: Args, tenantId: string): Args {
  if (!isTenantScoped(model)) return args

  if (WHERE_OPS.has(operation)) {
    const where = args.where as Args | undefined
    return {
      ...args,
      where: where ? { AND: [{ tenantId }, where] } : { tenantId },
    }
  }

  if (CREATE_OPS.has(operation)) {
    const out: Args = { ...args }
    if (operation === 'upsert') {
      out.create = { ...(args.create as Args), tenantId }
      return out
    }
    const data = args.data
    out.data = Array.isArray(data)
      ? data.map((row: Args) => ({ ...row, tenantId }))
      : { ...(data as Args), tenantId }
    return out
  }

  // findUnique/update/delete operam por chave única; o filtro extra
  // quebraria a validação do Prisma. Fica a cargo dos guards de auth.
  return args
}
