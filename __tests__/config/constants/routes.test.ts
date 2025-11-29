import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { DISABLED_ROUTES } from '@/config/constants/routes'
import * as routesNS from '@/config/constants/routes'

afterEach(() => {
  DISABLED_ROUTES.length = 0
  vi.clearAllMocks()
})

describe('config/constants/routes - DISABLED_ROUTES', () => {
  it('exports DISABLED_ROUTES as an array', () => {
    expect(Array.isArray(DISABLED_ROUTES)).toBe(true)
    expect(DISABLED_ROUTES instanceof Array).toBe(true)
  })

  it('allows pushing any string value (no runtime type enforcement)', () => {
    expect(() => {
      DISABLED_ROUTES.push('not-a-route' as any)
    }).not.toThrow()
    expect(DISABLED_ROUTES).toContain('not-a-route')
    expect(DISABLED_ROUTES.length).toBe(1)
  })

  it('preserves insertion order and supports includes', () => {
    DISABLED_ROUTES.push('/a', '/b', '/c')
    expect(DISABLED_ROUTES[0]).toBe('/a')
    expect(DISABLED_ROUTES[1]).toBe('/b')
    expect(DISABLED_ROUTES[2]).toBe('/c')
    expect(DISABLED_ROUTES.includes('/b')).toBe(true)
  })

  it('supports splice to remove elements and returns removed items', () => {
    DISABLED_ROUTES.push('/x', '/y', '/z')
    const removed = DISABLED_ROUTES.splice(1, 1)
    expect(removed).toEqual(['/y'])
    expect(DISABLED_ROUTES).toEqual(['/x', '/z'])
  })

  it('delete leaves a hole and keeps length unchanged', () => {
    DISABLED_ROUTES.push('/first', '/second')
    const initialLength = DISABLED_ROUTES.length
    // delete index 0
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete DISABLED_ROUTES[0]
    expect(DISABLED_ROUTES.length).toBe(initialLength)
    expect(0 in DISABLED_ROUTES).toBe(false)
    expect(DISABLED_ROUTES[0]).toBeUndefined()
    expect(DISABLED_ROUTES[1]).toBe('/second')
  })

  it('array identity is the same via named and namespace imports', () => {
    expect(routesNS.DISABLED_ROUTES).toBe(DISABLED_ROUTES)
  })

  it('dynamic import returns the same array reference', async () => {
    const mod = await import('../../../config/constants/routes')
    expect(mod.DISABLED_ROUTES).toBe(DISABLED_ROUTES)
  })

  it('mutations are visible across imports', async () => {
    DISABLED_ROUTES.push('/shared')
    const mod = await import('../../../config/constants/routes')
    expect(mod.DISABLED_ROUTES.includes('/shared')).toBe(true)
    // mutate via module namespace and observe via named import
    mod.DISABLED_ROUTES.push('/from-mod')
    expect(DISABLED_ROUTES.includes('/from-mod')).toBe(true)
  })

  it('cannot reassign export on module namespace object', async () => {
    const mod = await import('../../../config/constants/routes')
    expect(() => {
      ;(mod as any).DISABLED_ROUTES = []
    }).toThrow(TypeError)
    // Original reference intact
    expect(mod.DISABLED_ROUTES).toBe(DISABLED_ROUTES)
  })

  it('Array.isArray and instanceof checks pass', () => {
    expect(Array.isArray(DISABLED_ROUTES)).toBe(true)
    expect(DISABLED_ROUTES instanceof Array).toBe(true)
  })

  it('toString and join representations reflect content', () => {
    DISABLED_ROUTES.push('/one', '/two')
    expect(DISABLED_ROUTES.toString()).toBe('/one,/two')
    expect(DISABLED_ROUTES.join('|')).toBe('/one|/two')
  })

  it('pop and shift remove elements and return correct values', () => {
    DISABLED_ROUTES.push('/a', '/b', '/c')
    const popped = DISABLED_ROUTES.pop()
    expect(popped).toBe('/c')
    const shifted = DISABLED_ROUTES.shift()
    expect(shifted).toBe('/a')
    expect(DISABLED_ROUTES).toEqual(['/b'])
  })

  it('map and filter do not mutate original array', () => {
    DISABLED_ROUTES.push('/aa', '/bb', '/cc')
    const mapped = DISABLED_ROUTES.map((s) => s.toUpperCase())
    const filtered = DISABLED_ROUTES.filter((s) => s !== '/bb')
    expect(mapped).toEqual(['/AA', '/BB', '/CC'])
    expect(filtered).toEqual(['/aa', '/cc'])
    // original untouched
    expect(DISABLED_ROUTES).toEqual(['/aa', '/bb', '/cc'])
  })

  it('sorting works and mutates the array', () => {
    DISABLED_ROUTES.push('/d', '/b', '/a', '/c')
    DISABLED_ROUTES.sort()
    expect(DISABLED_ROUTES).toEqual(['/a', '/b', '/c', '/d'])
  })

  it('JSON serialization reflects current elements', () => {
    DISABLED_ROUTES.push('/json')
    expect(JSON.stringify(DISABLED_ROUTES)).toBe('["/json"]')
  })

  it('spread creates a shallow copy that does not affect original on mutation', () => {
    DISABLED_ROUTES.push('/orig')
    const copy = [...DISABLED_ROUTES]
    copy.push('/copy-only')
    expect(copy).toEqual(['/orig', '/copy-only'])
    expect(DISABLED_ROUTES).toEqual(['/orig'])
  })
})
