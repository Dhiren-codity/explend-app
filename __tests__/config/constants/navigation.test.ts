import { describe, it, expect, vi, afterEach } from 'vitest'
import { DEFAULT_TRANSACTION_LIMIT, NAV_ICON_SIZE, NAV_TITLE, SEARCH_PARAM, DEFAULT_PAGINATION_PAGE_NUMBER } from '../../../config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('DEFAULT_TRANSACTION_LIMIT', () => {
  it('has value 30', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('is a positive finite integer', () => {
    expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number')
    expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(Number.isFinite(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0)
  })
})

describe('NAV_ICON_SIZE', () => {
  it('equals 24', () => {
    expect(NAV_ICON_SIZE).toBe(24)
    expect(typeof NAV_ICON_SIZE).toBe('number')
  })
})

describe('DEFAULT_PAGINATION_PAGE_NUMBER', () => {
  it('equals "1"', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
    expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string')
  })

  it('parses to number 1', () => {
    expect(parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)).toBe(1)
  })
})

describe('NAV_TITLE enum values', () => {
  it('HOME equals "Home"', () => {
    expect(NAV_TITLE.HOME).toBe('Home')
  })

  it('MONTHLY_REPORT equals "Monthly Report"', () => {
    expect(NAV_TITLE.MONTHLY_REPORT).toBe('Monthly Report')
  })

  it('CHART equals "Chart"', () => {
    expect(NAV_TITLE.CHART).toBe('Chart')
  })

  it('LIMITS equals "Limits"', () => {
    expect(NAV_TITLE.LIMITS).toBe('Limits')
  })

  it('SUBSCRIPTIONS equals "Subscriptions"', () => {
    expect(NAV_TITLE.SUBSCRIPTIONS).toBe('Subscriptions')
  })

  it('CATEGORIES equals "Categories"', () => {
    expect(NAV_TITLE.CATEGORIES).toBe('Categories')
  })

  it('EXPORT equals "Export"', () => {
    expect(NAV_TITLE.EXPORT).toBe('Export')
  })

  it('SETTINGS equals "Settings"', () => {
    expect(NAV_TITLE.SETTINGS).toBe('Settings')
  })

  it('FEEDBACK equals "Give Feedback"', () => {
    expect(NAV_TITLE.FEEDBACK).toBe('Give Feedback')
  })

  it('ISSUE equals "Report Issue"', () => {
    expect(NAV_TITLE.ISSUE).toBe('Report Issue')
  })

  it('SIGNIN equals "Sign In"', () => {
    expect(NAV_TITLE.SIGNIN).toBe('Sign In')
  })

  it('all NAV_TITLE values are unique and non-empty', () => {
    const titles = [
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
      NAV_TITLE.SIGNIN
    ]
    const unique = new Set(titles)
    expect(unique.size).toBe(titles.length)
    expect(titles.every(t => typeof t === 'string' && t.trim().length > 0)).toBe(true)
  })
})

describe('SEARCH_PARAM enum values', () => {
  it('QUERY equals "query"', () => {
    expect(SEARCH_PARAM.QUERY).toBe('query')
  })

  it('PAGE equals "page"', () => {
    expect(SEARCH_PARAM.PAGE).toBe('page')
  })

  it('can be used to build and read URLSearchParams', () => {
    const qs = new URLSearchParams({
      [SEARCH_PARAM.PAGE]: DEFAULT_PAGINATION_PAGE_NUMBER,
      [SEARCH_PARAM.QUERY]: 'budget'
    })
    expect(qs.get(SEARCH_PARAM.PAGE)).toBe('1')
    expect(qs.get(SEARCH_PARAM.QUERY)).toBe('budget')
  })
})
