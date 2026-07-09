import { describe, it, expect } from 'vitest'
import { registry } from '@/modules/registry'

describe('manifests de venda (Fase 4)', () => {
  it('todo módulo tem headline, benefícios e o que precisa de você', () => {
    for (const m of registry) {
      expect(m.manifest.headlineVenda, m.manifest.id).toBeTruthy()
      expect(m.manifest.beneficios?.length ?? 0, m.manifest.id).toBeGreaterThanOrEqual(2)
      expect(m.manifest.oQueVocePrecisa?.length ?? 0, m.manifest.id).toBeGreaterThanOrEqual(2)
    }
  })

  it('slugs de venda batem com a URL pública /ferramentas/[slug]', () => {
    const slugs = registry.map((m) => m.manifest.slug)
    expect(slugs).toEqual(expect.arrayContaining(['relatorios', 'zelo', 'conteudo', 'anuncios']))
  })
})
