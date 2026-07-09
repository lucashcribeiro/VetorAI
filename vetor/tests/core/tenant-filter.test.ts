import { describe, it, expect } from 'vitest'
import { scopeArgs, isTenantScoped } from '@/core/db/tenant-filter'

const TENANT = 'tnt_123'

describe('isTenantScoped', () => {
  it('marca modelos operacionais como tenant-scoped', () => {
    for (const m of [
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
      'MidiaMetrica',
      'MidiaAlerta',
    ]) {
      expect(isTenantScoped(m)).toBe(true)
    }
  })

  it('não marca modelos globais (Tenant, User)', () => {
    expect(isTenantScoped('Tenant')).toBe(false)
    expect(isTenantScoped('User')).toBe(false)
  })
})

describe('scopeArgs — leitura', () => {
  it('injeta tenantId em findMany sem where', () => {
    const out = scopeArgs('Event', 'findMany', {}, TENANT)
    expect(out.where).toEqual({ tenantId: TENANT })
  })

  it('preserva where existente combinando com AND', () => {
    const out = scopeArgs('Event', 'findMany', { where: { tipo: 'relatorio.gerado' } }, TENANT)
    expect(out.where).toEqual({ AND: [{ tenantId: TENANT }, { tipo: 'relatorio.gerado' }] })
  })

  it('injeta em count/aggregate/groupBy/findFirst/updateMany/deleteMany', () => {
    for (const op of ['count', 'aggregate', 'groupBy', 'findFirst', 'updateMany', 'deleteMany']) {
      const out = scopeArgs('ActivityLog', op, {}, TENANT)
      expect(out.where).toEqual({ tenantId: TENANT })
    }
  })
})

describe('scopeArgs — escrita', () => {
  it('injeta tenantId em create.data', () => {
    const out = scopeArgs('ActivityLog', 'create', { data: { acao: 'x' } }, TENANT)
    expect(out.data).toEqual({ acao: 'x', tenantId: TENANT })
  })

  it('injeta tenantId em cada linha de createMany', () => {
    const out = scopeArgs('Event', 'createMany', { data: [{ tipo: 'a' }, { tipo: 'b' }] }, TENANT)
    expect(out.data).toEqual([
      { tipo: 'a', tenantId: TENANT },
      { tipo: 'b', tenantId: TENANT },
    ])
  })

  it('injeta em upsert (create) e mantém update', () => {
    const out = scopeArgs(
      'Dossie',
      'upsert',
      { where: { id: 'd1' }, create: { versao: 1 }, update: { versao: 2 } },
      TENANT,
    )
    expect(out.create).toEqual({ versao: 1, tenantId: TENANT })
    expect(out.update).toEqual({ versao: 2 })
  })
})

describe('scopeArgs — fora de escopo', () => {
  it('não toca em modelo global', () => {
    const args = { where: { slug: 'dra-mirilaini' } }
    expect(scopeArgs('Tenant', 'findMany', args, TENANT)).toBe(args)
  })

  it('não toca em operação de linha única por chave (findUnique/update/delete)', () => {
    const args = { where: { id: 'e1' } }
    expect(scopeArgs('Event', 'findUnique', args, TENANT)).toBe(args)
  })
})
