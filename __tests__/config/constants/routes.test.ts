import { describe, it, expect, vi, afterEach } from 'vitest'

afterEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
})

describe('config/constants/routes module runtime exports', () => {
  it('exports DISABLED_ROUTES and not ROUTE at runtime', async () => {
    const mod = await import('../../../config/constants/routes')
    expect('DISABLED_ROUTES' in mod).toBe(true)
    expect('ROUTE' in mod).toBe(false)
  })

  it('DISABLED_ROUTES is an array', async () => {
    const mod = await import('../../../config/constants/routes')
    expect(Array.isArray(mod.DISABLED_ROUTES)).toBe(true)
  })

  it('DISABLED_ROUTES starts empty', async () => {
    const mod = await import('../../../config/constants/routes')
    expect(mod.DISABLED_ROUTES.length).toBe(0)
  })

  it('can push a route string into DISABLED_ROUTES', async () => {
    const mod = await import('../../../config/constants/routes')
    const newLength = mod.DISABLED_ROUTES.push('/disabled-route')
    expect(newLength).toBe(1)
    expect(mod.DISABLED_ROUTES).toEqual(['/disabled-route'])
  })

  it('preserves order when multiple items are pushed', async () => {
    const mod = await import('../../../config/constants/routes')
    mod.DISABLED_ROUTES.push('/a')
    mod.DISABLED_ROUTES.push('/b')
    mod.DISABLED_ROUTES.push('/c')
    expect(mod.DISABLED_ROUTES).toEqual(['/a', '/b', '/c'])
  })

  it('allows clearing the array by setting length to 0', async () => {
    const mod = await import('../../../config/constants/routes')
    mod.DISABLED_ROUTES.push('/a', '/b')
    expect(mod.DISABLED_ROUTES.length).toBe(2)
    mod.DISABLED_ROUTES.length = 0
    expect(mod.DISABLED_ROUTES.length).toBe(0)
    expect(mod.DISABLED_ROUTES).toEqual([])
  })

  it('allows duplicate values', async () => {
    const mod = await import('../../../config/constants/routes')
    mod.DISABLED_ROUTES.push('/dup', '/dup')
    expect(mod.DISABLED_ROUTES.length).toBe(2)
    expect(mod.DISABLED_ROUTES).toEqual(['/dup', '/dup'])
  })

  it('keeps the same array reference across repeated imports without resetting modules', async () => {
    const mod1 = await import('../../../config/constants/routes')
    const arr1 = mod1.DISABLED_ROUTES
    arr1.push('/x')
    const mod2 = await import('../../../config/constants/routes')
    expect(mod2.DISABLED_ROUTES).toBe(arr1)
    expect(mod2.DISABLED_ROUTES.includes('/x')).toBe(true)
  })

  it('creates a fresh array after vi.resetModules', async () => {
    const mod1 = await import('../../../config/constants/routes')
    mod1.DISABLED_ROUTES.push('/persist')
    expect(mod1.DISABLED_ROUTES.length).toBe(1)

    vi.resetModules()

    const mod2 = await import('../../../config/constants/routes')
    expect(mod2.DISABLED_ROUTES).not.toBe(mod1.DISABLED_ROUTES)
    expect(mod2.DISABLED_ROUTES.length).toBe(0)
  })

  it('ROUTE is undefined at runtime', async () => {
    const mod = await import('../../../config/constants/routes')
    expect((mod as any).ROUTE).toBeUndefined()
  })

  it('ROUTE.HOME cannot be accessed at runtime (remains undefined)', async () => {
    const mod = await import('../../../config/constants/routes')
    const routeHome = (mod as any).ROUTE && (mod as any).ROUTE.HOME
    expect(routeHome).toBeUndefined()
  })

  it('Object.keys(module) includes DISABLED_ROUTES and not ROUTE', async () => {
    const mod = await import('../../../config/constants/routes')
    const keys = Object.keys(mod)
    expect(keys.includes('DISABLED_ROUTES')).toBe(true)
    expect(keys.includes('ROUTE')).toBe(false)
  })

  it('supports pop operation correctly', async () => {
    const mod = await import('../../../config/constants/routes')
    mod.DISABLED_ROUTES.push('/a', '/b', '/c')
    const popped = mod.DISABLED_ROUTES.pop()
    expect(popped).toBe('/c')
    expect(mod.DISABLED_ROUTES).toEqual(['/a', '/b'])
  })

  it('supports splice operation to remove middle item', async () => {
    const mod = await import('../../../config/constants/routes')
    mod.DISABLED_ROUTES.push('/first', '/middle', '/last')
    const removed = mod.DISABLED_ROUTES.splice(1, 1)
    expect(removed).toEqual(['/middle'])
    expect(mod.DISABLED_ROUTES).toEqual(['/first', '/last'])
  })

  it('destructuring DISABLED_ROUTES yields the same reference as module export', async () => {
    const mod = await import('../../../config/constants/routes')
    const { DISABLED_ROUTES } = mod
    expect(DISABLED_ROUTES).toBe(mod.DISABLED_ROUTES)
    DISABLED_ROUTES.push('/same-ref')
    expect(mod.DISABLED_ROUTES.includes('/same-ref')).toBe(true)
  })
})
