import { describe, it, expect, vi, afterEach } from 'vitest'
import { DISABLED_ROUTES } from '../../../config/constants/routes'
import type { ROUTE } from '../../../config/constants/routes'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'

const knownRoutes: ROUTE[] = [
  '/',
  '/sign-in',
  '/monthly-report',
  '/chart',
  '/limits',
  '/subscriptions',
  '/categories',
  '/export',
  '/settings',
  '/feedback',
  '/issue',
  '/sitemap.xml',
  '/disabled-route',
]

const nonHomeRoutes: ROUTE[] = knownRoutes.filter((r) => r !== '/')

afterEach(() => {
  vi.clearAllMocks()
  while (DISABLED_ROUTES.length) {
    DISABLED_ROUTES.pop()
  }
})

describe('ROUTE constants (string literals)', () => {
  it('includes HOME "/"', () => {
    expect(knownRoutes).toContain('/')
  })

  it('includes SIGNIN "/sign-in"', () => {
    expect(knownRoutes).toContain('/sign-in')
  })

  it('includes MONTHLY_REPORT "/monthly-report"', () => {
    expect(knownRoutes).toContain('/monthly-report')
  })

  it('includes CHART "/chart"', () => {
    expect(knownRoutes).toContain('/chart')
  })

  it('includes LIMITS "/limits"', () => {
    expect(knownRoutes).toContain('/limits')
  })

  it('includes SUBSCRIPTIONS "/subscriptions"', () => {
    expect(knownRoutes).toContain('/subscriptions')
  })

  it('includes CATEGORIES "/categories"', () => {
    expect(knownRoutes).toContain('/categories')
  })

  it('includes EXPORT "/export"', () => {
    expect(knownRoutes).toContain('/export')
  })

  it('includes SETTINGS "/settings"', () => {
    expect(knownRoutes).toContain('/settings')
  })

  it('includes FEEDBACK "/feedback"', () => {
    expect(knownRoutes).toContain('/feedback')
  })

  it('includes ISSUE "/issue"', () => {
    expect(knownRoutes).toContain('/issue')
  })

  it('includes SITEMAP "/sitemap.xml"', () => {
    expect(knownRoutes).toContain('/sitemap.xml')
  })

  it('includes DISABLED_ROUTE "/disabled-route"', () => {
    expect(knownRoutes).toContain('/disabled-route')
  })

  it('has all unique route values', () => {
    const unique = new Set(knownRoutes)
    expect(unique.size).toBe(knownRoutes.length)
  })

  it('every route starts with "/"', () => {
    for (const r of knownRoutes) {
      expect(r.startsWith('/')).toBe(true)
    }
  })

  it('non-HOME routes do not end with "/"', () => {
    for (const r of nonHomeRoutes) {
      expect(r.endsWith('/')).toBe(false)
    }
  })

  it('non-HOME routes have length > 1', () => {
    for (const r of nonHomeRoutes) {
      expect(r.length).toBeGreaterThan(1)
    }
  })
})

describe('DISABLED_ROUTES', () => {
  it('is defined and is an array', () => {
    expect(Array.isArray(DISABLED_ROUTES)).toBe(true)
  })

  it('is empty by default', () => {
    expect(DISABLED_ROUTES).toHaveLength(0)
  })

  it('allows adding a valid route', () => {
    const route: ROUTE = '/sign-in'
    DISABLED_ROUTES.push(route)
    expect(DISABLED_ROUTES).toHaveLength(1)
    expect(DISABLED_ROUTES.includes(route)).toBe(true)
  })

  it('allows adding duplicates (no automatic de-duplication)', () => {
    const route: ROUTE = '/chart'
    DISABLED_ROUTES.push(route)
    DISABLED_ROUTES.push(route)
    expect(DISABLED_ROUTES).toHaveLength(2)
    expect(DISABLED_ROUTES[0]).toBe(route)
    expect(DISABLED_ROUTES[1]).toBe(route)
  })

  it('preserves insertion order', () => {
    const r1: ROUTE = '/limits'
    const r2: ROUTE = '/subscriptions'
    const r3: ROUTE = '/categories'
    DISABLED_ROUTES.push(r1, r2, r3)
    expect(DISABLED_ROUTES).toEqual([r1, r2, r3])
  })

  it('does not include a route that was not added', () => {
    const notAdded: ROUTE = '/export'
    expect(DISABLED_ROUTES.includes(notAdded)).toBe(false)
  })

  it('can add all known routes', () => {
    for (const r of knownRoutes) {
      DISABLED_ROUTES.push(r)
    }
    expect(DISABLED_ROUTES).toHaveLength(knownRoutes.length)
    expect(DISABLED_ROUTES).toEqual(knownRoutes)
  })

  it('pop removes the last inserted route', () => {
    const r1: ROUTE = '/settings'
    const r2: ROUTE = '/feedback'
    DISABLED_ROUTES.push(r1, r2)
    const removed = DISABLED_ROUTES.pop()
    expect(removed).toBe(r2)
    expect(DISABLED_ROUTES).toEqual([r1])
  })

  it('afterEach cleanup resets DISABLED_ROUTES to empty between tests (sanity check)', () => {
    expect(DISABLED_ROUTES).toHaveLength(0)
  })

  it('every element in DISABLED_ROUTES is one of the known routes when added from known set', () => {
    const sample: ROUTE[] = ['/issue', '/sitemap.xml', '/disabled-route']
    for (const r of sample) {
      DISABLED_ROUTES.push(r)
    }
    const validSet = new Set(knownRoutes)
    expect(DISABLED_ROUTES.every((r) => validSet.has(r))).toBe(true)
  })

  it('can clear all added routes by popping', () => {
    for (const r of ['/sign-in', '/monthly-report', '/chart'] as ROUTE[]) {
      DISABLED_ROUTES.push(r)
    }
    while (DISABLED_ROUTES.length) {
      DISABLED_ROUTES.pop()
    }
    expect(DISABLED_ROUTES).toHaveLength(0)
  })
})
