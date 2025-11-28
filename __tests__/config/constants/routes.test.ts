import { describe, it, expect, vi, afterEach } from 'vitest'
import { ROUTE, DISABLED_ROUTES } from '../../../config/constants/routes'

afterEach(() => {
  vi.clearAllMocks()
})

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

describe('ROUTE enum values', () => {
  it('HOME is "/"', () => {
    expect(ROUTE.HOME).toBe('/')
  })

  it('SIGNIN is "/sign-in"', () => {
    expect(ROUTE.SIGNIN).toBe('/sign-in')
  })

  it('MONTHLY_REPORT is "/monthly-report"', () => {
    expect(ROUTE.MONTHLY_REPORT).toBe('/monthly-report')
  })

  it('CHART is "/chart"', () => {
    expect(ROUTE.CHART).toBe('/chart')
  })

  it('LIMITS is "/limits"', () => {
    expect(ROUTE.LIMITS).toBe('/limits')
  })

  it('SUBSCRIPTIONS is "/subscriptions"', () => {
    expect(ROUTE.SUBSCRIPTIONS).toBe('/subscriptions')
  })

  it('CATEGORIES is "/categories"', () => {
    expect(ROUTE.CATEGORIES).toBe('/categories')
  })

  it('EXPORT is "/export"', () => {
    expect(ROUTE.EXPORT).toBe('/export')
  })

  it('SETTINGS is "/settings"', () => {
    expect(ROUTE.SETTINGS).toBe('/settings')
  })

  it('FEEDBACK is "/feedback"', () => {
    expect(ROUTE.FEEDBACK).toBe('/feedback')
  })

  it('ISSUE is "/issue"', () => {
    expect(ROUTE.ISSUE).toBe('/issue')
  })

  it('SITEMAP is "/sitemap.xml"', () => {
    expect(ROUTE.SITEMAP).toBe('/sitemap.xml')
  })

  it('DISABLED_ROUTE is "/disabled-route"', () => {
    expect(ROUTE.DISABLED_ROUTE).toBe('/disabled-route')
  })
})

describe('ROUTE enum integrity', () => {
  it('all values are strings', () => {
    const allAreStrings = allRoutes.every((r) => typeof r === 'string')
    expect(allAreStrings).toBe(true)
  })

  it('all values are unique', () => {
    const unique = new Set(allRoutes)
    expect(unique.size).toBe(allRoutes.length)
  })

  it('all routes start with "/"', () => {
    const allStartWithSlash = allRoutes.every((r) => r.startsWith('/'))
    expect(allStartWithSlash).toBe(true)
  })

  it('no route (except HOME) ends with "/"', () => {
    const nonHomeRoutes = allRoutes.filter((r) => r !== ROUTE.HOME)
    const noneEndWithSlash = nonHomeRoutes.every((r) => !r.endsWith('/'))
    expect(noneEndWithSlash).toBe(true)
  })

  it('routes contain no whitespace characters', () => {
    const hasNoWhitespace = allRoutes.every((r) => !/\s/.test(r))
    expect(hasNoWhitespace).toBe(true)
  })

  it('SITEMAP route ends with ".xml"', () => {
    expect(ROUTE.SITEMAP.endsWith('.xml')).toBe(true)
  })

  it('total number of defined route constants is 13', () => {
    expect(allRoutes.length).toBe(13)
  })
})

describe('DISABLED_ROUTES constant', () => {
  it('is an array', () => {
    expect(Array.isArray(DISABLED_ROUTES)).toBe(true)
  })

  it('is empty by default', () => {
    expect(DISABLED_ROUTES.length).toBe(0)
  })

  it('deep equals an empty array initially', () => {
    expect(DISABLED_ROUTES).toEqual([])
  })

  it('is not frozen (mutable array export)', () => {
    expect(Object.isFrozen(DISABLED_ROUTES)).toBe(false)
  })

  it('contains only valid ROUTE values (subset check)', () => {
    const allowed = new Set(allRoutes)
    const isSubset = DISABLED_ROUTES.every((r) => allowed.has(r))
    expect(isSubset).toBe(true)
  })

  it('does not contain duplicate routes', () => {
    const unique = new Set(DISABLED_ROUTES)
    expect(unique.size).toBe(DISABLED_ROUTES.length)
  })
})
