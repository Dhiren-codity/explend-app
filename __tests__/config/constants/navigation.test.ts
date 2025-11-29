import { describe, it, expect, vi, afterEach } from 'vitest'
import * as constants from '../../../config/constants/navigation'
import { DEFAULT_TRANSACTION_LIMIT, NAV_ICON_SIZE, DEFAULT_PAGINATION_PAGE_NUMBER } from '../../../config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('config/constants/navigation exports', () => {
  it('only exports runtime constants', () => {
    const keys = Object.keys(constants).sort()
    expect(keys).toEqual([
      'DEFAULT_PAGINATION_PAGE_NUMBER',
      'DEFAULT_TRANSACTION_LIMIT',
      'NAV_ICON_SIZE',
    ])
  })


describe('DEFAULT_TRANSACTION_LIMIT', () => {
  it('equals 30', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('is a positive, finite integer', () => {
    expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number')
    expect(Number.isFinite(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0)
  })

  it('can be used to slice a larger dataset to limit size', () => {
    const data = Array.from({ length: 100 }, (_, i) => i)
    const page = data.slice(0, DEFAULT_TRANSACTION_LIMIT)
    expect(page.length).toBe(30)
    expect(page[0]).toBe(0)
    expect(page[page.length - 1]).toBe(29)
  })

  it('returns entire dataset when dataset size is below limit', () => {
    const data = Array.from({ length: 10 }, (_, i) => i)
    const page = data.slice(0, DEFAULT_TRANSACTION_LIMIT)
    expect(page.length).toBe(10)
    expect(page).toEqual(data)
  })

  it('computes page count correctly from arbitrary dataset sizes', () => {
    const sizes = [0, 1, 30, 31, 59, 60, 61, 90, 91]
    const pages = sizes.map((size) => Math.ceil(size / DEFAULT_TRANSACTION_LIMIT))
    expect(pages).toEqual([0, 1, 1, 2, 2, 2, 3, 3, 4])
  })
})

describe('NAV_ICON_SIZE', () => {
  it('equals 24', () => {
    expect(NAV_ICON_SIZE).toBe(24)
  })

  it('is a positive, finite integer', () => {
    expect(typeof NAV_ICON_SIZE).toBe('number')
    expect(Number.isFinite(NAV_ICON_SIZE)).toBe(true)
    expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true)
    expect(NAV_ICON_SIZE).toBeGreaterThan(0)
  })

  it('can be used in a style object for icons', () => {
    const style = { width: NAV_ICON_SIZE, height: NAV_ICON_SIZE }
    expect(style).toEqual({ width: 24, height: 24 })
  })

  it('can be converted to pixel CSS values', () => {
    const css = `${NAV_ICON_SIZE}px`
    expect(css).toBe('24px')
  })

  it('area computation with icon size is consistent', () => {
    const area = NAV_ICON_SIZE * NAV_ICON_SIZE
    expect(area).toBe(576)
  })
})

describe('DEFAULT_PAGINATION_PAGE_NUMBER', () => {
  it('equals "1"', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })

  it('is a numeric string convertible to number 1', () => {
    const n = Number(DEFAULT_PAGINATION_PAGE_NUMBER)
    expect(n).toBe(1)
    expect(Number.isInteger(n)).toBe(true)
  })

  it('computes zero-based offset correctly with the default page and limit', () => {
    const page = parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)
    const offset = (page - 1) * DEFAULT_TRANSACTION_LIMIT
    expect(offset).toBe(0)
  })

  it('can be used to build URLs with correct page param', () => {
    const url = new URL('https://example.com/')
    url.searchParams.set('page', DEFAULT_PAGINATION_PAGE_NUMBER)
    expect(url.searchParams.get('page')).toBe('1')
  })
})
