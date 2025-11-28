import { describe, it, expect, vi, afterEach, expectTypeOf } from 'vitest'
import type { ROUTE } from '../../../config/constants/routes'

type AllRoutes =
  | '/'
  | '/sign-in'
  | '/monthly-report'
  | '/chart'
  | '/limits'
  | '/subscriptions'
  | '/categories'
  | '/export'
  | '/settings'
  | '/feedback'
  | '/issue'
  | '/sitemap.xml'
  | '/disabled-route'

afterEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
})

describe('config/constants/routes module exports', () => {
  it('exports only DISABLED_ROUTES at runtime (const enum is erased)', async () => {
    const mod = await import('../../../config/constants/routes')
    const keys = Object.keys(mod).sort()
    expect(keys).toEqual(['DISABLED_ROUTES'])
    expect('ROUTE' in mod).toBe(false)
    expect((mod as Record<string, unknown>).ROUTE).toBeUndefined()
  })

  it('DISABLED_ROUTES is an Array and initially empty', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    expect(Array.isArray(DISABLED_ROUTES)).toBe(true)
    expect(DISABLED_ROUTES.length).toBe(0)
    expect(DISABLED_ROUTES).toEqual([])
  })

  it('DISABLED_ROUTES can be mutated (array is not frozen)', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    expect(Object.isFrozen(DISABLED_ROUTES)).toBe(false)
    const item = '/disabled-route' as unknown as ROUTE
    DISABLED_ROUTES.push(item)
    expect(DISABLED_ROUTES).toHaveLength(1)
    expect(DISABLED_ROUTES[0]).toBe('/disabled-route')
  })

  it('re-importing without resetting modules returns the same mutated array reference', async () => {
    const mod1 = await import('../../../config/constants/routes')
    const r = '/disabled-route' as unknown as ROUTE
    mod1.DISABLED_ROUTES.push(r)
    const mod2 = await import('../../../config/constants/routes')
    expect(mod2.DISABLED_ROUTES).toBe(mod1.DISABLED_ROUTES)
    expect(mod2.DISABLED_ROUTES).toEqual(['/disabled-route'])
  })

  it('after vi.resetModules, a fresh instance is returned', async () => {
    const mod1 = await import('../../../config/constants/routes')
    mod1.DISABLED_ROUTES.push('/disabled-route' as unknown as ROUTE)
    expect(mod1.DISABLED_ROUTES).toHaveLength(1)

    vi.resetModules()

    const mod2 = await import('../../../config/constants/routes')
    expect(mod2.DISABLED_ROUTES).toEqual([])
    expect(mod2.DISABLED_ROUTES).not.toBe(mod1.DISABLED_ROUTES)
  })

  it('cannot reassign the exported DISABLED_ROUTES binding', async () => {
    const mod = await import('../../../config/constants/routes')
    expect(() => {
      ;(mod as any).DISABLED_ROUTES = ['x']
    }).toThrowError(TypeError)
  })

  it('can push multiple values and preserve duplicates', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    const a = '/disabled-route' as unknown as ROUTE
    DISABLED_ROUTES.push(a, a)
    expect(DISABLED_ROUTES).toEqual(['/disabled-route', '/disabled-route'])
  })

  it('can clear the array by setting length to 0', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/disabled-route' as unknown as ROUTE)
    expect(DISABLED_ROUTES.length).toBe(1)
    DISABLED_ROUTES.length = 0
    expect(DISABLED_ROUTES).toEqual([])
  })
})

describe('Type-level checks for ROUTE and DISABLED_ROUTES', () => {
  it('ROUTE is a subtype of string', () => {
    expectTypeOf<ROUTE>().toMatchTypeOf<string>()
  })

  it('string is not a subtype of ROUTE (not every string is a valid route)', () => {
    expectTypeOf<string>().not.toMatchTypeOf<ROUTE>()
  })

  it('ROUTE equals the full union of defined route string literals', () => {
    expectTypeOf<ROUTE>().toEqualTypeOf<AllRoutes>()
  })

  it('DISABLED_ROUTES has type ROUTE[]', () => {
    type DisabledRoutesType = typeof import('../../../config/constants/routes').DISABLED_ROUTES
    expectTypeOf<DisabledRoutesType>().toEqualTypeOf<ROUTE[]>()
  })

  it('"/" is assignable to ROUTE', () => {
    expectTypeOf<'/'>().toMatchTypeOf<ROUTE>()
  })

  it('"/sign-in" is assignable to ROUTE', () => {
    expectTypeOf<'/sign-in'>().toMatchTypeOf<ROUTE>()
  })

  it('"/monthly-report" is assignable to ROUTE', () => {
    expectTypeOf<'/monthly-report'>().toMatchTypeOf<ROUTE>()
  })

  it('"/chart" is assignable to ROUTE', () => {
    expectTypeOf<'/chart'>().toMatchTypeOf<ROUTE>()
  })

  it('"/limits" is assignable to ROUTE', () => {
    expectTypeOf<'/limits'>().toMatchTypeOf<ROUTE>()
  })

  it('"/subscriptions" is assignable to ROUTE', () => {
    expectTypeOf<'/subscriptions'>().toMatchTypeOf<ROUTE>()
  })

  it('"/categories" is assignable to ROUTE', () => {
    expectTypeOf<'/categories'>().toMatchTypeOf<ROUTE>()
  })

  it('"/export" is assignable to ROUTE', () => {
    expectTypeOf<'/export'>().toMatchTypeOf<ROUTE>()
  })

  it('"/settings" is assignable to ROUTE', () => {
    expectTypeOf<'/settings'>().toMatchTypeOf<ROUTE>()
  })

  it('"/feedback" is assignable to ROUTE', () => {
    expectTypeOf<'/feedback'>().toMatchTypeOf<ROUTE>()
  })

  it('"/issue" is assignable to ROUTE', () => {
    expectTypeOf<'/issue'>().toMatchTypeOf<ROUTE>()
  })

  it('"/sitemap.xml" is assignable to ROUTE', () => {
    expectTypeOf<'/sitemap.xml'>().toMatchTypeOf<ROUTE>()
  })

  it('"/disabled-route" is assignable to ROUTE', () => {
    expectTypeOf<'/disabled-route'>().toMatchTypeOf<ROUTE>()
  })

  it('an unknown path is not assignable to ROUTE', () => {
    expectTypeOf<'/unknown'>().not.toMatchTypeOf<ROUTE>()
  })
})
