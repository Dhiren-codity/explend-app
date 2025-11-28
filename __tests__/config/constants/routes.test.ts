import { describe, it, expect, vi, afterEach } from 'vitest'

afterEach(async () => {
  vi.clearAllMocks()
  const mod = await import('../../../config/constants/routes')
  if (Array.isArray(mod.DISABLED_ROUTES)) {
    mod.DISABLED_ROUTES.length = 0
    for (const key of Object.keys(mod.DISABLED_ROUTES)) {
      if (!/^\d+$/.test(key)) {
        delete (mod.DISABLED_ROUTES as any)[key]
      }
    }
  }
})

describe('config/constants/routes runtime exports', () => {
  it('exports DISABLED_ROUTES at runtime', async () => {
    const mod = await import('../../../config/constants/routes')
    expect('DISABLED_ROUTES' in mod).toBe(true)
  })

  it('does not export ROUTE const enum at runtime', async () => {
    const mod = await import('../../../config/constants/routes')
    expect('ROUTE' in mod).toBe(false)
    expect((mod as any).ROUTE).toBeUndefined()
  })
})

describe('DISABLED_ROUTES basics', () => {
  it('is an array', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    expect(Array.isArray(DISABLED_ROUTES)).toBe(true)
    expect(typeof DISABLED_ROUTES).toBe('object')
  })

  it('is initially empty', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    expect(DISABLED_ROUTES.length).toBe(0)
    expect(JSON.stringify(DISABLED_ROUTES)).toBe('[]')
  })

  it('allows pushing strings and tracks length', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/disabled-route')
    expect(DISABLED_ROUTES.length).toBe(1)
    expect(DISABLED_ROUTES[0]).toBe('/disabled-route')
    expect(DISABLED_ROUTES.includes('/disabled-route')).toBe(true)
  })

  it('preserves order when multiple entries are added', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/a', '/b', '/c')
    expect(DISABLED_ROUTES).toEqual(['/a', '/b', '/c'])
  })

  it('supports splice to remove entries', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/first', '/second')
    const removed = DISABLED_ROUTES.splice(0, 1)
    expect(removed).toEqual(['/first'])
    expect(DISABLED_ROUTES).toEqual(['/second'])
  })

  it('accepts values of any type at runtime', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    const obj = { a: 1 }
    DISABLED_ROUTES.push(123 as unknown as string, obj as unknown as string)
    expect(DISABLED_ROUTES.length).toBe(2)
    expect(DISABLED_ROUTES[0]).toBe(123)
    expect(DISABLED_ROUTES[1]).toBe(obj)
  })

  it('is not frozen and remains mutable', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    expect(Object.isFrozen(DISABLED_ROUTES)).toBe(false)
    DISABLED_ROUTES.push('/mutable')
    expect(DISABLED_ROUTES[0]).toBe('/mutable')
  })

  it('allows setting arbitrary properties on the array object', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    ;(DISABLED_ROUTES as any).foo = 'bar'
    expect((DISABLED_ROUTES as any).foo).toBe('bar')
  })

  it('can be cleared by setting length to 0', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/x', '/y')
    expect(DISABLED_ROUTES.length).toBe(2)
    DISABLED_ROUTES.length = 0
    expect(DISABLED_ROUTES.length).toBe(0)
    expect(JSON.stringify(DISABLED_ROUTES)).toBe('[]')
  })
})

describe('Module caching and reset behavior for DISABLED_ROUTES', () => {
  it('multiple imports without reset return the same array instance', async () => {
    const mod1 = await import('../../../config/constants/routes')
    const mod2 = await import('../../../config/constants/routes')
    expect(mod1.DISABLED_ROUTES).toBe(mod2.DISABLED_ROUTES)
  })

  it('state persists across imports without reset', async () => {
    const mod1 = await import('../../../config/constants/routes')
    mod1.DISABLED_ROUTES.push('/persist')
    const mod2 = await import('../../../config/constants/routes')
    expect(mod2.DISABLED_ROUTES.includes('/persist')).toBe(true)
    expect(mod2.DISABLED_ROUTES.length).toBe(1)
  })

  it('vi.resetModules() provides a fresh array reference and state', async () => {
    const mod1 = await import('../../../config/constants/routes')
    mod1.DISABLED_ROUTES.push('/before-reset')
    expect(mod1.DISABLED_ROUTES.length).toBe(1)

    vi.resetModules()

    const mod2 = await import('../../../config/constants/routes')
    expect(mod2.DISABLED_ROUTES).not.toBe(mod1.DISABLED_ROUTES)
    expect(mod2.DISABLED_ROUTES.length).toBe(0)
    expect(mod2.DISABLED_ROUTES.includes('/before-reset')).toBe(false)
  })

  it('subsequent resets continue to yield new clean instances', async () => {
    let mod = await import('../../../config/constants/routes')
    mod.DISABLED_ROUTES.push('/first-cycle')
    expect(mod.DISABLED_ROUTES.length).toBe(1)

    vi.resetModules()
    mod = await import('../../../config/constants/routes')
    expect(mod.DISABLED_ROUTES.length).toBe(0)

    mod.DISABLED_ROUTES.push('/second-cycle')
    expect(mod.DISABLED_ROUTES.length).toBe(1)

    vi.resetModules()
    const mod3 = await import('../../../config/constants/routes')
    expect(mod3.DISABLED_ROUTES.length).toBe(0)
  })

  it('JSON serialization reflects current state', async () => {
    const mod = await import('../../../config/constants/routes')
    expect(JSON.stringify(mod.DISABLED_ROUTES)).toBe('[]')
    mod.DISABLED_ROUTES.push('/x')
    expect(JSON.stringify(mod.DISABLED_ROUTES)).toBe('["/x"]')
  })
})
