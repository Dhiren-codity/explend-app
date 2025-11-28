import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  DEFAULT_PAGINATION_PAGE_NUMBER,
  NAV_TITLE,
  SEARCH_PARAM,
} from './config/constants/navigation'
import * as navigation from './config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('navigation constants - base values', () => {
  it('DEFAULT_TRANSACTION_LIMIT has expected value', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(30)
    expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number')
  })

  it('NAV_ICON_SIZE has expected value', () => {
    expect(NAV_ICON_SIZE).toBe(24)
    expect(typeof NAV_ICON_SIZE).toBe('number')
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER has expected value', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
    expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string')
  })

  it('DEFAULT_TRANSACTION_LIMIT is a positive safe integer', () => {
    expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0)
    expect(DEFAULT_TRANSACTION_LIMIT).toBeLessThanOrEqual(1000)
  })

  it('NAV_ICON_SIZE is a positive reasonable icon size', () => {
    expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true)
    expect(NAV_ICON_SIZE).toBeGreaterThanOrEqual(12)
    expect(NAV_ICON_SIZE).toBeLessThanOrEqual(64)
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER represents a positive integer', () => {
    const n = Number(DEFAULT_PAGINATION_PAGE_NUMBER)
    expect(Number.isInteger(n)).toBe(true)
    expect(n).toBeGreaterThan(0)
    expect(String(n)).toBe(DEFAULT_PAGINATION_PAGE_NUMBER)
  })
})

describe('NAV_TITLE enum values', () => {
  it('has exact labels for each member', () => {
    expect(NAV_TITLE.HOME).toBe('Home')
    expect(NAV_TITLE.MONTHLY_REPORT).toBe('Monthly Report')
    expect(NAV_TITLE.CHART).toBe('Chart')
    expect(NAV_TITLE.LIMITS).toBe('Limits')
    expect(NAV_TITLE.SUBSCRIPTIONS).toBe('Subscriptions')
    expect(NAV_TITLE.CATEGORIES).toBe('Categories')
    expect(NAV_TITLE.EXPORT).toBe('Export')
    expect(NAV_TITLE.SETTINGS).toBe('Settings')
    expect(NAV_TITLE.FEEDBACK).toBe('Give Feedback')
    expect(NAV_TITLE.ISSUE).toBe('Report Issue')
    expect(NAV_TITLE.SIGNIN).toBe('Sign In')
  })

  it('values are non-empty trimmed strings', () => {
    const values = [
      NAV_TITLE.HOME,
      NAV_TITLE.MONTHLY_REPORT,
      NAV_TITLE.CHART,
      NAV_TITLE.LIMITS,
      NAV_TITLE.SUBSCRIPTIONS,
      NAV_TITLE.CATEGORIES,
      NAV_TITLE.EXPORT,
      NAV_TITLE.SETTINGS,
      NAV_TITLE.FEEDBACK,
      NAV_TITLE.ISSUE,
      NAV_TITLE.SIGNIN,
    ]
    for (const v of values) {
      expect(typeof v).toBe('string')
      expect(v.length).toBeGreaterThan(0)
      expect(v.trim()).toBe(v)
    }
  })

  it('values are unique', () => {
    const values = [
      NAV_TITLE.HOME,
      NAV_TITLE.MONTHLY_REPORT,
      NAV_TITLE.CHART,
      NAV_TITLE.LIMITS,
      NAV_TITLE.SUBSCRIPTIONS,
      NAV_TITLE.CATEGORIES,
      NAV_TITLE.EXPORT,
      NAV_TITLE.SETTINGS,
      NAV_TITLE.FEEDBACK,
      NAV_TITLE.ISSUE,
      NAV_TITLE.SIGNIN,
    ]
    const set = new Set(values)
    expect(set.size).toBe(values.length)
  })

  it('enum members can be used as object keys', () => {
    const map: Record<string, number> = {
      [NAV_TITLE.CATEGORIES]: 1,
      [NAV_TITLE.SETTINGS]: 2,
    }
    expect(map['Categories']).toBe(1)
    expect(map['Settings']).toBe(2)
  })

  it('type usage compiles and runtime is expected literal', () => {
    const pageName: NAV_TITLE = NAV_TITLE.HOME
    expect(pageName).toBe('Home')
  })
})

describe('SEARCH_PARAM enum values', () => {
  it('has exact values for each member', () => {
    expect(SEARCH_PARAM.QUERY).toBe('query')
    expect(SEARCH_PARAM.PAGE).toBe('page')
  })

  it('values are lower-case strings', () => {
    const values = [SEARCH_PARAM.QUERY, SEARCH_PARAM.PAGE]
    for (const v of values) {
      expect(typeof v).toBe('string')
      expect(v).toBe(v.toLowerCase())
      expect(v.trim()).toBe(v)
    }
  })

  it('values are unique', () => {
    const values = [SEARCH_PARAM.QUERY, SEARCH_PARAM.PAGE]
    const set = new Set(values)
    expect(set.size).toBe(values.length)
  })

  it('can be used as object keys for query construction', () => {
    const params: Record<string, string> = {
      [SEARCH_PARAM.QUERY]: 'coffee',
      [SEARCH_PARAM.PAGE]: '2',
    }
    const qs = new URLSearchParams(params).toString()
    expect(qs.includes('query=coffee')).toBe(true)
    expect(qs.includes('page=2')).toBe(true)
  })
})

describe('immutability of exported constants', () => {
  it('cannot mutate DEFAULT_TRANSACTION_LIMIT via module namespace', () => {
    expect(() => {
      ;(navigation as any).DEFAULT_TRANSACTION_LIMIT = 99
    }).toThrow()
    expect(navigation.DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('cannot mutate NAV_ICON_SIZE via module namespace', () => {
    expect(() => {
      ;(navigation as any).NAV_ICON_SIZE = 48
    }).toThrow()
    expect(navigation.NAV_ICON_SIZE).toBe(24)
  })

  it('cannot mutate DEFAULT_PAGINATION_PAGE_NUMBER via module namespace', () => {
    expect(() => {
      ;(navigation as any).DEFAULT_PAGINATION_PAGE_NUMBER = '10'
    }).toThrow()
    expect(navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })
})

describe('consistency checks', () => {
  it('DEFAULT_PAGINATION_PAGE_NUMBER equals String(1)', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe(String(1))
  })

  it('SEARCH_PARAM keys align with typical URL search patterns', () => {
    const url = new URL('https://example.com')
    url.searchParams.set(SEARCH_PARAM.QUERY, 'abc')
    url.searchParams.set(SEARCH_PARAM.PAGE, '3')
    expect(url.search).toContain('query=')
    expect(url.search).toContain('page=')
  })
})
