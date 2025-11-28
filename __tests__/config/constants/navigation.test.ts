import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  NAV_TITLE,
  SEARCH_PARAM,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from '../../../config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('config/constants/navigation - DEFAULT_TRANSACTION_LIMIT', () => {
  it('should be 30', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('should be a number', () => {
    expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number')
  })

  it('should be a positive integer', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0)
    expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
  })

  it('should not be NaN or Infinity', () => {
    expect(Number.isNaN(DEFAULT_TRANSACTION_LIMIT)).toBe(false)
    expect(DEFAULT_TRANSACTION_LIMIT).not.toBe(Infinity)
  })

  it('stringified should be "30"', () => {
    expect(String(DEFAULT_TRANSACTION_LIMIT)).toBe('30')
  })

  it('should be within reasonable range (1..1000)', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThanOrEqual(1)
    expect(DEFAULT_TRANSACTION_LIMIT).toBeLessThanOrEqual(1000)
  })
})

describe('config/constants/navigation - NAV_ICON_SIZE', () => {
  it('should be 24', () => {
    expect(NAV_ICON_SIZE).toBe(24)
  })

  it('should be a number', () => {
    expect(typeof NAV_ICON_SIZE).toBe('number')
  })

  it('should be a positive integer', () => {
    expect(NAV_ICON_SIZE).toBeGreaterThan(0)
    expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true)
  })

  it('should not be zero', () => {
    expect(NAV_ICON_SIZE).not.toBe(0)
  })

  it('should be less than 100', () => {
    expect(NAV_ICON_SIZE).toBeLessThan(100)
  })
})

describe('config/constants/navigation - DEFAULT_PAGINATION_PAGE_NUMBER', () => {
  it('should be "1"', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })

  it('should be a string', () => {
    expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string')
  })

  it('should be numeric string equal to 1 when parsed', () => {
    expect(parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)).toBe(1)
  })

  it('should match digits only', () => {
    expect(/^\d+$/.test(DEFAULT_PAGINATION_PAGE_NUMBER)).toBe(true)
  })

  it('should not be "0" or "01"', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).not.toBe('0')
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).not.toBe('01')
  })
})

describe('config/constants/navigation - NAV_TITLE enum values', () => {
  it('HOME should be "Home"', () => {
    expect(NAV_TITLE.HOME).toBe('Home')
  })

  it('MONTHLY_REPORT should be "Monthly Report"', () => {
    expect(NAV_TITLE.MONTHLY_REPORT).toBe('Monthly Report')
  })

  it('CHART should be "Chart"', () => {
    expect(NAV_TITLE.CHART).toBe('Chart')
  })

  it('LIMITS should be "Limits"', () => {
    expect(NAV_TITLE.LIMITS).toBe('Limits')
  })

  it('SUBSCRIPTIONS should be "Subscriptions"', () => {
    expect(NAV_TITLE.SUBSCRIPTIONS).toBe('Subscriptions')
  })

  it('CATEGORIES should be "Categories"', () => {
    expect(NAV_TITLE.CATEGORIES).toBe('Categories')
  })

  it('EXPORT should be "Export"', () => {
    expect(NAV_TITLE.EXPORT).toBe('Export')
  })

  it('SETTINGS should be "Settings"', () => {
    expect(NAV_TITLE.SETTINGS).toBe('Settings')
  })

  it('FEEDBACK should be "Give Feedback"', () => {
    expect(NAV_TITLE.FEEDBACK).toBe('Give Feedback')
  })

  it('ISSUE should be "Report Issue"', () => {
    expect(NAV_TITLE.ISSUE).toBe('Report Issue')
  })

  it('SIGNIN should be "Sign In"', () => {
    expect(NAV_TITLE.SIGNIN).toBe('Sign In')
  })

  it('should have unique values across all titles', () => {
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
    expect(new Set(values).size).toBe(values.length)
  })
})

describe('config/constants/navigation - SEARCH_PARAM enum values', () => {
  it('QUERY should be "query"', () => {
    expect(SEARCH_PARAM.QUERY).toBe('query')
  })

  it('PAGE should be "page"', () => {
    expect(SEARCH_PARAM.PAGE).toBe('page')
  })

  it('should have unique values across all search params', () => {
    const values = [SEARCH_PARAM.QUERY, SEARCH_PARAM.PAGE]
    expect(new Set(values).size).toBe(values.length)
  })
})
