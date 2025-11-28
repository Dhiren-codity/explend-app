import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ROUTE } from '../../../config/constants/routes'

const HOME: ROUTE = '/'
const SIGNIN: ROUTE = '/sign-in'
const CHART: ROUTE = '/chart'
const LIMITS: ROUTE = '/limits'
const EXPORT_R: ROUTE = '/export'
const SETTINGS: ROUTE = '/settings'
const SITEMAP: ROUTE = '/sitemap.xml'
const DISABLED_ROUTE_PATH: ROUTE = '/disabled-route'

describe('config/constants/routes', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('exports DISABLED_ROUTES as an array', async () => {
    const mod = await import('../../../config/constants/routes')
    expect('DISABLED_ROUTES' in mod).toBe(true)
    expect(Array.isArray(mod.DISABLED_ROUTES)).toBe(true)
  })

  it('DISABLED_ROUTES is initially empty', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    expect(DISABLED_ROUTES.length).toBe(0)
    expect(DISABLED_ROUTES).toEqual([])
  })

  it('allows pushing a single route', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push(SIGNIN)
    expect(DISABLED_ROUTES.length).toBe(1)
    expect(DISABLED_ROUTES[0]).toBe('/sign-in')
    expect(DISABLED_ROUTES.includes('/sign-in')).toBe(true)
  })

  it('maintains order when pushing multiple routes', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push(SETTINGS)
    DISABLED_ROUTES.push(EXPORT_R)
    DISABLED_ROUTES.push(CHART)
    expect(DISABLED_ROUTES).toEqual(['/settings', '/export', '/chart'])
  })

  it('allows duplicate routes', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push(LIMITS)
    DISABLED_ROUTES.push(LIMITS)
    expect(DISABLED_ROUTES.length).toBe(2)
    expect(DISABLED_ROUTES[0]).toBe('/limits')
    expect(DISABLED_ROUTES[1]).toBe('/limits')
  })

  it('module import returns the same array reference within the same module instance', async () => {
    const mod1 = await import('../../../config/constants/routes')
    const mod2 = await import('../../../config/constants/routes')
    expect(mod1.DISABLED_ROUTES).toBe(mod2.DISABLED_ROUTES)

    mod1.DISABLED_ROUTES.push(SITEMAP)
    expect(mod2.DISABLED_ROUTES.includes('/sitemap.xml')).toBe(true)
    expect(mod2.DISABLED_ROUTES.length).toBe(1)
  })

  it('resetting modules gives a fresh DISABLED_ROUTES array', async () => {
    const mod1 = await import('../../../config/constants/routes')
    mod1.DISABLED_ROUTES.push(CHART)
    expect(mod1.DISABLED_ROUTES.length).toBe(1)

    vi.resetModules()
    const mod2 = await import('../../../config/constants/routes')
    expect(mod2.DISABLED_ROUTES.length).toBe(0)
    expect(mod2.DISABLED_ROUTES).not.toBe(mod1.DISABLED_ROUTES)
  })

  it('export binding cannot be reassigned on the module namespace', async () => {
    const mod = await import('../../../config/constants/routes')
    expect(() => {
      // @ts-expect-error - intentional reassignment to test read-only binding
      ;(mod as any).DISABLED_ROUTES = []
    }).toThrow()
  })

  it('array is mutable: push and pop work as expected', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push(EXPORT_R)
    expect(DISABLED_ROUTES).toEqual(['/export'])

    const popped = DISABLED_ROUTES.pop()
    expect(popped).toBe('/export')
    expect(DISABLED_ROUTES.length).toBe(0)
  })

  it('JSON serialization reflects current contents', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push(SETTINGS, EXPORT_R)
    expect(JSON.stringify(DISABLED_ROUTES)).toBe('["/settings","/export"]')
  })

  it('join() returns a delimiter-separated string of routes', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push(HOME, SIGNIN, CHART)
    expect(DISABLED_ROUTES.join('|')).toBe('|||/sign-in|/chart'.replace('||', '/').replace('||', '/')) // ensure HOME is '/'
    // Simpler explicit expectation:
    expect(DISABLED_ROUTES.join(',')).toBe(',,/sign-in,/chart'.replace(',,', '/')) // HOME is '/'
  })

  it('includes() correctly reports presence of a route', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push(DISABLED_ROUTE_PATH)
    expect(DISABLED_ROUTES.includes('/disabled-route')).toBe(true)
    expect(DISABLED_ROUTES.includes('/non-existent')).toBe(false)
  })

  it('clearing via length resets the array contents', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push(SIGNIN, CHART, LIMITS)
    expect(DISABLED_ROUTES.length).toBe(3)
    DISABLED_ROUTES.length = 0
    expect(DISABLED_ROUTES.length).toBe(0)
    expect(DISABLED_ROUTES).toEqual([])
  })

  it('splice can remove specific indexes', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push(SETTINGS, EXPORT_R, CHART)
    const removed = DISABLED_ROUTES.splice(1, 1)
    expect(removed).toEqual(['/export'])
    expect(DISABLED_ROUTES).toEqual(['/settings', '/chart'])
  })

  it('every element is a string starting with "/" after pushing known routes', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push(HOME, SIGNIN, LIMITS, SITEMAP)
    const allStartWithSlash = DISABLED_ROUTES.every((r) => typeof r === 'string' && r.startsWith('/'))
    expect(allStartWithSlash).toBe(true)
  })

  it('indexOf returns the first occurrence for duplicates', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push(SIGNIN, CHART, SIGNIN, LIMITS)
    expect(DISABLED_ROUTES.indexOf('/sign-in')).toBe(0)
    expect(DISABLED_ROUTES.lastIndexOf('/sign-in')).toBe(2)
  })

  it('copying the array with spread results in a shallow copy separate from the original', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push(SETTINGS, EXPORT_R)
    const copy = [...DISABLED_ROUTES]
    expect(copy).toEqual(['/settings', '/export'])

    DISABLED_ROUTES.push(CHART)
    expect(copy).toEqual(['/settings', '/export'])
    expect(DISABLED_ROUTES).toEqual(['/settings', '/export', '/chart'])
  })

  it('Array.from creates a copy with identical contents', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push(HOME, SIGNIN)
    const arr = Array.from(DISABLED_ROUTES)
    expect(arr).toEqual(['/', '/sign-in'])
    expect(arr).not.toBe(DISABLED_ROUTES)
  })

  it('slice returns a subarray without modifying the original', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push(CHART, LIMITS, EXPORT_R, SETTINGS)
    const sub = DISABLED_ROUTES.slice(1, 3)
    expect(sub).toEqual(['/limits', '/export'])
    expect(DISABLED_ROUTES).toEqual(['/chart', '/limits', '/export', '/settings'])
  })
})
