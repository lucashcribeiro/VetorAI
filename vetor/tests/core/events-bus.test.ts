import { describe, it, expect, vi } from 'vitest'
import { publish, fetchUnprocessed, markProcessed, type EventDb } from '@/core/events/bus'

function fakeDb() {
  return {
    event: {
      create: vi.fn().mockResolvedValue({ id: 'ev1' }),
      findMany: vi.fn().mockResolvedValue([]),
      updateMany: vi.fn().mockResolvedValue({ count: 2 }),
    },
  } as unknown as EventDb
}

describe('publish', () => {
  it('grava tenantId, tipo e payload', async () => {
    const dbc = fakeDb()
    await publish('tnt_1', 'relatorio.gerado', { mes: '2026-06' }, dbc)
    expect(dbc.event.create).toHaveBeenCalledWith({
      data: { tenantId: 'tnt_1', tipo: 'relatorio.gerado', payload: { mes: '2026-06' } },
    })
  })
})

describe('fetchUnprocessed', () => {
  it('busca só não processados, mais antigos primeiro', async () => {
    const dbc = fakeDb()
    await fetchUnprocessed({}, dbc)
    expect(dbc.event.findMany).toHaveBeenCalledWith({
      where: { processado: false },
      orderBy: { criadoEm: 'asc' },
      take: 50,
    })
  })

  it('filtra por tipo e respeita limit', async () => {
    const dbc = fakeDb()
    await fetchUnprocessed({ tipo: 'campanha.alerta_criado', limit: 10 }, dbc)
    expect(dbc.event.findMany).toHaveBeenCalledWith({
      where: { processado: false, tipo: 'campanha.alerta_criado' },
      orderBy: { criadoEm: 'asc' },
      take: 10,
    })
  })
})

describe('markProcessed', () => {
  it('marca ids como processados', async () => {
    const dbc = fakeDb()
    await markProcessed(['e1', 'e2'], dbc)
    expect(dbc.event.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['e1', 'e2'] } },
      data: { processado: true },
    })
  })

  it('ignora lista vazia sem tocar no banco', async () => {
    const dbc = fakeDb()
    await markProcessed([], dbc)
    expect(dbc.event.updateMany).not.toHaveBeenCalled()
  })
})
