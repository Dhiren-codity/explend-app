import { describe, it, expect, vi, afterEach } from 'vitest'
import { DISABLED_ROUTES, ROUTE } from '../../../config/constants/routes'

const importFreshRoutes = async () => {
  vi.resetModules()
  return await import('../../../config/constants/routes')
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('DISABLED_ROUTES - basic structure', () => {
  it('is defined', () => {
    expect(DISABLED_ROUTES).toBeDefined()
  })

  it('is an array', () => {
    expect(Array.isArray(DISABLED_ROUTES)).toBe(true)
  })

  it('is initially empty', () => {
    expect(DISABLED_ROUTES.length).toBe(0)
  })

  it('does not include HOME initially', () => {
    expect(DISABLED_ROUTES.includes(ROUTE.HOME)).toBe(false)
  })
})

describe('DISABLED_ROUTES - mutation behavior (fresh module each test)', () => {
  it('push adds a single route and updates length and includes', async () => {
    const mod = await importFreshRoutes()
    mod.DISABLED_ROUTES.push(ROUTE.SIGNIN)
    expect(mod.DISABLED_ROUTES.length).toBe(1)
    expect(mod.DISABLED_ROUTES.includes(ROUTE.SIGNIN)).toBe(true)
  })

  it('push can add duplicates and increases length accordingly', async () => {
    const mod = await importFreshRoutes()
    mod.DISABLED_ROUTES.push(ROUTE.SIGNIN, ROUTE.SIGNIN)
    expect(mod.DISABLED_ROUTES.length).toBe(2)
    expect(mod.DISABLED_ROUTES[0]).toBe(ROUTE.SIGNIN)
    expect(mod.DISABLED_ROUTES[1]).toBe(ROUTE.SIGNIN)
  })

  it('pop removes last element', async () => {
    const mod = await importFreshRoutes()
    mod.DISABLED_ROUTES.push(ROUTE.CHART, ROUTE.CATEGORIES)
    const removed = mod.DISABLED_ROUTES.pop()
    expect(removed).toBe(ROUTE.CATEGORIES)
    expect(mod.DISABLED_ROUTES.length).toBe(1)
    expect(mod.DISABLED_ROUTES.includes(ROUTE.CHART)).toBe(true)
    expect(mod.DISABLED_ROUTES.includes(ROUTE.CATEGORIES)).toBe(false)
  })

  it('setting length = 0 clears the array', async () => {
    const mod = await importFreshRoutes()
    mod.DISABLED_ROUTES.push(ROUTE.ISSUE, ROUTE.FEEDBACK, ROUTE.SETTINGS)
    expect(mod.DISABLED_ROUTES.length).toBe(3)
    mod.DISABLED_ROUTES.length = 0
    expect(mod.DISABLED_ROUTES.length).toBe(0)
    expect(mod.DISABLED_ROUTES.includes(ROUTE.ISSUE)).toBe(false)
  })

  it('splice removes elements at specified index', async () => {
    const mod = await importFreshRoutes()
    mod.DISABLED_ROUTES.push(ROUTE.EXPORT, ROUTE.SITEMAP, ROUTE.DISABLED_ROUTE)
    const removed = mod.DISABLED_ROUTES.splice(1, 1)
    expect(removed).toEqual([ROUTE.SITEMAP])
    expect(mod.DISABLED_ROUTES).toEqual([ROUTE.EXPORT, ROUTE.DISABLED_ROUTE])
  })

  it('array is not frozen or sealed and allows extra properties', async () => {
    const mod = await importFreshRoutes()
    expect(Object.isFrozen(mod.DISABLED_ROUTES)).toBe(false)
    expect(Object.isSealed(mod.DISABLED_ROUTES)).toBe(false)
    ;(mod.DISABLED_ROUTES as any).customProp = 42
    expect((mod.DISABLED_ROUTES as any).customProp).toBe(42)
  })

  it('JSON.stringify on fresh array returns []', async () => {
    const mod = await importFreshRoutes()
    expect(JSON.stringify(mod.DISABLED_ROUTES)).toBe('[]')
  })

  it('order is preserved on pushes', async () => {
    const mod = await importFreshRoutes()
    const sequence = [ROUTE.HOME, ROUTE.CHART, ROUTE.ISSUE]
    mod.DISABLED_ROUTES.push(...sequence)
    expect(mod.DISABLED_ROUTES).toEqual(sequence)
  })

  it('indexOf returns -1 for routes not present', async () => {
    const mod = await importFreshRoutes()
    expect(mod.DISABLED_ROUTES.indexOf(ROUTE.CATEGORIES)).toBe(-1)
  })
})

describe('DISABLED_ROUTES - module caching and reset behavior', () => {
  it('is a singleton across imports without module reset', async () => {
    const mod1 = await import('../../../config/constants/routes')
    mod1.DISABLED_ROUTES.push(ROUTE.EXPORT)
    const mod2 = await import('../../../config/constants/routes')
    expect(mod2.DISABLED_ROUTES.includes(ROUTE.EXPORT)).toBe(true)
    expect(mod1.DISABLED_ROUTES).toBe(mod2.DISABLED_ROUTES)
    mod1.DISABLED_ROUTES.length = 0
  })

  it('vi.resetModules resets the exported array instance and state', async () => {
    let mod = await importFreshRoutes()
    const prevRef = mod.DISABLED_ROUTES
    mod.DISABLED_ROUTES.push(ROUTE.LIMITS)
    expect(mod.DISABLED_ROUTES.length).toBe(1)

    mod = await importFreshRoutes()
    const newRef = mod.DISABLED_ROUTES
    expect(newRef.length).toBe(0)
    expect(prevRef === newRef).toBe(false)
  })
})

describe('ROUTE runtime behavior (const enum)', () => {
  it('runtime module does not export ROUTE as a value', async () => {
    const mod: any = await import('../../../config/constants/routes')
    expect(mod.ROUTE).toBeUndefined()
    expect(Object.prototype.hasOwnProperty.call(mod, 'ROUTE')).toBe(false)
  })

  it('pushing all known routes results in expected membership and length', async () => {
    const mod = await importFreshRoutes()
    const allRoutes = [
      ROUTE.HOME,
      ROUTE.SIGNIN,
      ROUTE.MONTHLY_REPORT,
      ROUTE.CHART,
      ROUTE.LIMITS,
      ROUTE.SUBSCRIPTIONS,
      ROUTE.CATEGORIES,
      ROUTE.EXPORT,
      ROUTE.SETTINGS,
      ROUTE.FEEDBACK,
      ROUTE.ISSUE,
      ROUTE.SITEMAP,
      ROUTE.DISABLED_ROUTE,
    ]
    mod.DISABLED_ROUTES.push(...allRoutes)
    expect(mod.DISABLED_ROUTES.length).toBe(allRoutes.length)
    for (const r of allRoutes) {
      expect(mod.DISABLED_ROUTES.includes(r)).toBe(true)
    }
  })

  it('clearing after adding some routes makes includes return false', async () => {
    const mod = await importFreshRoutes()
    mod.DISABLED_ROUTES.push(ROUTE.SIGNIN, ROUTE.CHART)
    expect(mod.DISABLED_ROUTES.includes(ROUTE.SIGNIN)).toBe(true)
    mod.DISABLED_ROUTES.length = 0
    expect(mod.DISABLED_ROUTES.includes(ROUTE.SIGNIN)).toBe(false)
    expect(mod.DISABLED_ROUTES.includes(ROUTE.CHART)).toBe(false)
  })
})
