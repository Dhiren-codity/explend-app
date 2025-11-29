import { describe, it, expect, vi, afterEach } from 'vitest'

afterEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
})

describe('config/constants/routes module exports', () => {
  it('exports DISABLED_ROUTES and does not export ROUTE at runtime', async () => {
    const mod = await import('../../../config/constants/routes')
    expect('DISABLED_ROUTES' in mod).toBe(true)
    expect('ROUTE' in mod).toBe(false)
    expect(Array.isArray(mod.DISABLED_ROUTES)).toBe(true)
  })

  it('DISABLED_ROUTES is initially an empty array', async () => {
    const mod = await import('../../../config/constants/routes')
    expect(Array.isArray(mod.DISABLED_ROUTES)).toBe(true)
    expect(mod.DISABLED_ROUTES.length).toBe(0)
    expect(JSON.stringify(mod.DISABLED_ROUTES)).toBe('[]')
    expect(mod.DISABLED_ROUTES.toString()).toBe('')
  })

  it('does not have a default export', async () => {
    const mod = await import('../../../config/constants/routes')
    expect('default' in mod).toBe(false)
    expect((mod as any).default).toBeUndefined()
  })

  it('DISABLED_ROUTES is the same array instance across multiple imports without reset', async () => {
    const mod1 = await import('../../../config/constants/routes')
    const mod2 = await import('../../../config/constants/routes')
    expect(mod1.DISABLED_ROUTES).toBe(mod2.DISABLED_ROUTES)
    mod1.DISABLED_ROUTES.push('/x')
    expect(mod2.DISABLED_ROUTES.includes('/x')).toBe(true)
  })

  it('mutations to DISABLED_ROUTES persist within the same module instance', async () => {
    const mod = await import('../../../config/constants/routes')
    mod.DISABLED_ROUTES.push('/x', '/y')
    expect(mod.DISABLED_ROUTES.length).toBe(2)
    expect(mod.DISABLED_ROUTES).toEqual(['/x', '/y'])
  })

  it('resetting modules yields a fresh, empty DISABLED_ROUTES array and a new instance', async () => {
    const first = await import('../../../config/constants/routes')
    const firstRef = first.DISABLED_ROUTES
    firstRef.push('/temp')
    expect(first.DISABLED_ROUTES.length).toBe(1)

    vi.resetModules()
    const second = await import('../../../config/constants/routes')
    expect(second.DISABLED_ROUTES).not.toBe(firstRef)
    expect(second.DISABLED_ROUTES.length).toBe(0)
    expect(second.DISABLED_ROUTES).toEqual([])
  })

  it('export binding for DISABLED_ROUTES is read-only on module namespace', async () => {
    const mod = await import('../../../config/constants/routes')
    expect(() => {
      ;(mod as any).DISABLED_ROUTES = []
    }).toThrow()
  })

  it('module namespace property descriptor for DISABLED_ROUTES is non-writable and non-configurable', async () => {
    const mod = await import('../../../config/constants/routes')
    const desc = Object.getOwnPropertyDescriptor(mod, 'DISABLED_ROUTES')
    expect(desc).toBeDefined()
    expect(desc?.writable).toBe(false)
    expect(desc?.configurable).toBe(false)
    expect(desc?.enumerable).toBe(true)
  })

  it('mutating DISABLED_ROUTES through a separate reference affects the export', async () => {
    const mod = await import('../../../config/constants/routes')
    const ref = mod.DISABLED_ROUTES
    ref.push('/abc')
    expect(mod.DISABLED_ROUTES.includes('/abc')).toBe(true)
    expect(ref).toBe(mod.DISABLED_ROUTES)
  })

  it('array mutation methods (splice) work as expected and preserve identity', async () => {
    const mod = await import('../../../config/constants/routes')
    const ref = mod.DISABLED_ROUTES
    ref.push('/a', '/b', '/c')
    const removed = ref.splice(1, 1)
    expect(removed).toEqual(['/b'])
    expect(ref).toBe(mod.DISABLED_ROUTES)
    expect(mod.DISABLED_ROUTES).toEqual(['/a', '/c'])
  })

  it('clearing DISABLED_ROUTES via length = 0 empties the array', async () => {
    const mod = await import('../../../config/constants/routes')
    mod.DISABLED_ROUTES.push('/one', '/two')
    expect(mod.DISABLED_ROUTES.length).toBe(2)
    mod.DISABLED_ROUTES.length = 0
    expect(mod.DISABLED_ROUTES.length).toBe(0)
    expect(mod.DISABLED_ROUTES).toEqual([])
  })

  it('Object.freeze on DISABLED_ROUTES prevents further mutations and throws on push', async () => {
    const mod = await import('../../../config/constants/routes')
    Object.freeze(mod.DISABLED_ROUTES)
    expect(Object.isFrozen(mod.DISABLED_ROUTES)).toBe(true)
    expect(() => {
      mod.DISABLED_ROUTES.push('/cannot-add')
    }).toThrow()
  })

  it('DISABLED_ROUTES initially does not include known route-like paths', async () => {
    const mod = await import('../../../config/constants/routes')
    expect(mod.DISABLED_ROUTES.includes('/')).toBe(false)
    expect(mod.DISABLED_ROUTES.includes('/sign-in')).toBe(false)
    expect(mod.DISABLED_ROUTES.includes('/monthly-report')).toBe(false)
  })

  it('multiple imports still report array nature via Array.isArray', async () => {
    const mod1 = await import('../../../config/constants/routes')
    const mod2 = await import('../../../config/constants/routes')
    expect(Array.isArray(mod1.DISABLED_ROUTES)).toBe(true)
    expect(Array.isArray(mod2.DISABLED_ROUTES)).toBe(true)
  })

  it('JSON serialization reflects current contents', async () => {
    const mod = await import('../../../config/constants/routes')
    expect(JSON.stringify(mod.DISABLED_ROUTES)).toBe('[]')
    mod.DISABLED_ROUTES.push('/a', '/b')
    expect(JSON.stringify(mod.DISABLED_ROUTES)).toBe(JSON.stringify(['/a', '/b']))
  })

  it('Array.prototype.includes reflects updates', async () => {
    const mod = await import('../../../config/constants/routes')
    mod.DISABLED_ROUTES.push('/limits')
    expect(mod.DISABLED_ROUTES.includes('/limits')).toBe(true)
    expect(mod.DISABLED_ROUTES.includes('/non-existent')).toBe(false)
  })

  it('toString reflects items joined by commas', async () => {
    const mod = await import('../../../config/constants/routes')
    mod.DISABLED_ROUTES.push('/x', '/y', '/z')
    expect(mod.DISABLED_ROUTES.toString()).toBe('/x,/y,/z')
  })
})
