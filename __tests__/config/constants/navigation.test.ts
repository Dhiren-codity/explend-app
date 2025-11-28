import { describe, it, expect, vi, afterEach } from 'vitest'
import * as nav from '../../../config/constants/navigation'
import { DEFAULT_TRANSACTION_LIMIT, NAV_ICON_SIZE, DEFAULT_PAGINATION_PAGE_NUMBER } from '../../../config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('navigation constants - module exports', () => {
  it('exports only runtime constants', () => {
    const keys = Object.keys(nav).sort()
    expect(keys).toEqual(['DEFAULT_PAGINATION_PAGE_NUMBER', 'DEFAULT_TRANSACTION_LIMIT', 'NAV_ICON_SIZE'].sort())
  })

  it('does not export const enums at runtime', () => {
    expect('NAV_TITLE' in nav).toBe(false)
    expect('SEARCH_PARAM' in nav).toBe(false)
  })

  it('named exports match namespace exports', () => {
    expect(nav.DEFAULT_TRANSACTION_LIMIT).toBe(DEFAULT_TRANSACTION_LIMIT)
    expect(nav.NAV_ICON_SIZE).toBe(NAV_ICON_SIZE)
    expect(nav.DEFAULT_PAGINATION_PAGE_NUMBER).toBe(DEFAULT_PAGINATION_PAGE_NUMBER)
  })
})

describe('DEFAULT_TRANSACTION_LIMIT', () => {
  it('has expected numeric value', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('is a positive, finite integer', () => {
    expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0)
    expect(Number.isFinite(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
  })

  it('can be used to slice arrays correctly', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i + 1)
    const result = arr.slice(0, DEFAULT_TRANSACTION_LIMIT)
    expect(result.length).toBe(30)
    expect(result[0]).toBe(1)
    expect(result[result.length - 1]).toBe(30)
  })

  it('divides 60 evenly', () => {
    expect(60 % DEFAULT_TRANSACTION_LIMIT).toBe(0)
  })

  it('string representation is "30"', () => {
    expect(String(DEFAULT_TRANSACTION_LIMIT)).toBe('30')
  })

  it('is greater than NAV_ICON_SIZE', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(NAV_ICON_SIZE)
  })
})

describe('NAV_ICON_SIZE', () => {
  it('has expected numeric value', () => {
    expect(NAV_ICON_SIZE).toBe(24)
  })

  it('is part of common icon sizes', () => {
    const common = [16, 20, 24, 28, 32]
    expect(common.includes(NAV_ICON_SIZE)).toBe(true)
  })

  it('produces valid px string', () => {
    expect(`${NAV_ICON_SIZE}px`).toBe('24px')
  })

  it('doubles to 48 and halves to 12', () => {
    expect(NAV_ICON_SIZE * 2).toBe(48)
    expect(NAV_ICON_SIZE / 2).toBe(12)
  })

  it('is divisible by 2 and 3', () => {
    expect(NAV_ICON_SIZE % 2).toBe(0)
    expect(NAV_ICON_SIZE % 3).toBe(0)
  })

  it('can be used in a style-like object', () => {
    const style = { width: NAV_ICON_SIZE, height: NAV_ICON_SIZE }
    expect(style).toEqual({ width: 24, height: 24 })
  })
})

describe('DEFAULT_PAGINATION_PAGE_NUMBER', () => {
  it('has expected string value', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })

  it('parses to number 1', () => {
    expect(parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)).toBe(1)
  })

  it('can be used to initialize URLSearchParams', () => {
    const params = new URLSearchParams({ page: DEFAULT_PAGINATION_PAGE_NUMBER })
    expect(params.get('page')).toBe('1')
  })

  it('can be used in UI labels', () => {
    const label = `Page ${DEFAULT_PAGINATION_PAGE_NUMBER}`
    expect(label).toBe('Page 1')
  })

  it('numeric value is within DEFAULT_TRANSACTION_LIMIT range', () => {
    const num = Number(DEFAULT_PAGINATION_PAGE_NUMBER)
    expect(num).toBeGreaterThanOrEqual(1)
    expect(num).toBeLessThanOrEqual(DEFAULT_TRANSACTION_LIMIT)
  })

  it('exists alongside the other constants in the module', () => {
    const keys = Object.keys(nav)
    expect(keys).toContain('DEFAULT_PAGINATION_PAGE_NUMBER')
    expect(nav.DEFAULT_PAGINATION_PAGE_NUMBER).toBe(DEFAULT_PAGINATION_PAGE_NUMBER)
  })
})
