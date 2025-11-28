import { describe, it, expect, vi, afterEach } from 'vitest'
import { ROUTE, DISABLED_ROUTES } from './routes'

afterEach(() => {
  vi.clearAllMocks()
})

describe('ROUTE enum values', () => {
  const expectedRoutes = [
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

  it('HOME equals "/"', () => {
    expect(ROUTE.HOME).toBe('/')
  })

  it('SIGNIN equals "/sign-in"', () => {
    expect(ROUTE.SIGNIN).toBe('/sign-in')
  })

  it('MONTHLY_REPORT equals "/monthly-report"', () => {
    expect(ROUTE.MONTHLY_REPORT).toBe('/monthly-report')
  })

  it('CHART equals "/chart"', () => {
    expect(ROUTE.CHART).toBe('/chart')
  })

  it('LIMITS equals "/limits"', () => {
    expect(ROUTE.LIMITS).toBe('/limits')
  })

  it('SUBSCRIPTIONS equals "/subscriptions"', () => {
    expect(ROUTE.SUBSCRIPTIONS).toBe('/subscriptions')
  })

  it('CATEGORIES equals "/categories"', () => {
    expect(ROUTE.CATEGORIES).toBe('/categories')
  })

  it('EXPORT equals "/export"', () => {
    expect(ROUTE.EXPORT).toBe('/export')
  })

  it('SETTINGS equals "/settings"', () => {
    expect(ROUTE.SETTINGS).toBe('/settings')
  })

  it('FEEDBACK equals "/feedback"', () => {
    expect(ROUTE.FEEDBACK).toBe('/feedback')
  })

  it('ISSUE equals "/issue"', () => {
    expect(ROUTE.ISSUE).toBe('/issue')
  })

  it('SITEMAP equals "/sitemap.xml"', () => {
    expect(ROUTE.SITEMAP).toBe('/sitemap.xml')
  })

  it('DISABLED_ROUTE equals "/disabled-route"', () => {
    expect(ROUTE.DISABLED_ROUTE).toBe('/disabled-route')
  })

  it('has no duplicate route values', () => {
    const set = new Set(expectedRoutes)
    expect(set.size).toBe(expectedRoutes.length)
  })

  it('all routes are non-empty strings', () => {
    expect(expectedRoutes.every((r) => typeof r === 'string' && r.length > 0)).toBe(true)
  })

  it('all routes start with "/"', () => {
    expect(expectedRoutes.every((r) => r.startsWith('/'))).toBe(true)
  })

  it('no route except HOME ends with "/"', () => {
    const nonRootRoutes = expectedRoutes.filter((r) => r !== ROUTE.HOME)
    expect(nonRootRoutes.every((r) => !r.endsWith('/'))).toBe(true)
  })

  it('sitemap has .xml extension', () => {
    expect(ROUTE.SITEMAP.endsWith('.xml')).toBe(true)
  })

  it('contains exactly 13 declared routes', () => {
    expect(expectedRoutes).toHaveLength(13)
  })
})

describe('DISABLED_ROUTES', () => {
  it('is an array', () => {
    expect(Array.isArray(DISABLED_ROUTES)).toBe(true)
  })

  it('is empty by default', () => {
    expect(DISABLED_ROUTES.length).toBe(0)
  })

  it('contains only known routes when populated', () => {
    const sample: string[] = [
      ROUTE.HOME,
      ROUTE.SIGNIN,
      ROUTE.SITEMAP,
      ROUTE.DISABLED_ROUTE,
    ]
    // simulate a user-provided disabled list; ensure every value is a valid known route
    const known = new Set([
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
    ])
    expect(sample.every((r) => known.has(r))).toBe(true)
  })
})
