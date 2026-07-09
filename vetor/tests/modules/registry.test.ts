import { describe, it, expect } from 'vitest'
import { registry, getModuleBySlug, getModuleById } from '@/modules/registry'

describe('registry de módulos', () => {
  it('tem os módulos instalados (inclui time)', () => {
    const ids = registry.map((m) => m.manifest.id)
    expect(ids).toEqual(
      expect.arrayContaining(['relatorios', 'conteudo', 'midia', 'zelo', 'time']),
    )
  })

  it('ids e slugs são únicos', () => {
    const ids = registry.map((m) => m.manifest.id)
    const slugs = registry.map((m) => m.manifest.slug)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('todo módulo tem manifest completo e Ui', () => {
    for (const m of registry) {
      expect(m.manifest.nome).toBeTruthy()
      expect(m.manifest.descricao).toBeTruthy()
      expect(m.manifest.icone).toBeTypeOf('function')
      expect(m.Ui).toBeTypeOf('function')
    }
  })

  it('resolve por slug e por id (midia tem slug anuncios)', () => {
    expect(getModuleBySlug('anuncios')?.manifest.id).toBe('midia')
    expect(getModuleById('midia')?.manifest.slug).toBe('anuncios')
    expect(getModuleBySlug('inexistente')).toBeUndefined()
  })
})
