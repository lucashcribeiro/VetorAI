import { describe, it, expect } from 'vitest'
import { dossieDeFormData } from '@/core/tenant/dossie'

describe('dossieDeFormData', () => {
  it('lê campos do FormData e ignora vazios', () => {
    const fd = new FormData()
    fd.set('resumo', '  Clínica odontológica  ')
    fd.set('tomDeVoz', 'acolhedor')
    fd.set('oferta', '')
    const d = dossieDeFormData(fd)
    expect(d.resumo).toBe('Clínica odontológica')
    expect(d.tomDeVoz).toBe('acolhedor')
    expect(d.oferta).toBeUndefined()
  })
})
