import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from '../../../config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('DEFAULT_TRANSACTION_LIMIT', () => {
  it('is a positive, finite integer', () => {
    expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number')
    expect(Number.isFinite(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0)
  })

  it('can be used to slice a larger dataset to limit size', () => {
    const limit = DEFAULT_TRANSACTION_LIMIT
    const dataLength = Math.max(limit * 3, limit + 10)
    const data = Array.from({ length: dataLength }, (_, i) => i)
    const page = data.slice(0, limit)
    expect(page.length).toBe(limit)
    expect(page[0]).toBe(0)
    expect(page[page.length - 1]).toBe(limit - 1)
  })

  it('returns entire dataset when dataset size is below limit', () => {
    const limit = DEFAULT_TRANSACTION_LIMIT
    const dataSize = Math.max(1, limit - 1)
    const data = Array.from({ length: dataSize }, (_, i) => i)
    const page = data.slice(0, limit)
    expect(page.length).toBe(data.length)
    expect(page).toEqual(data)
  })

  it('computes page count correctly at boundaries', () => {
    const n = DEFAULT_TRANSACTION_LIMIT
    const sizes = [0, 1, n, n + 1, 2 * n, 2 * n + 1, 3 * n]
    const pages = sizes.map((size) => Math.ceil(size / n))
    expect(pages[0]).toBe(0) // size 0 -> 0 pages
    expect(pages[1]).toBe(1) // size 1 -> 1 page
    expect(pages[2]).toBe(1) // size n -> 1 page
    expect(pages[3]).toBe(2) // size n+1 -> 2 pages
    expect(pages[4]).toBe(2) // size 2n -> 2 pages
    expect(pages[5]).toBe(3) // size 2n+1 -> 3 pages
    expect(pages[6]).toBe(3) // size 3n -> 3 pages
  })
})

describe('NAV_ICON_SIZE', () => {
  it('is a positive, finite integer', () => {
    expect(typeof NAV_ICON_SIZE).toBe('number')
    expect(Number.isFinite(NAV_ICON_SIZE)).toBe(true)
    expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true)
    expect(NAV_ICON_SIZE).toBeGreaterThan(0)
  })

  it('can be used in a style object for icons', () => {
    const style = { width: NAV_ICON_SIZE, height: NAV_ICON_SIZE }
    expect(style).toEqual({ width: NAV_ICON_SIZE, height: NAV_ICON_SIZE })
  })

  it('can be converted to pixel CSS values', () => {
    const css = `${NAV_ICON_SIZE}px`
    expect(css.endsWith('px')).toBe(true)
    expect(parseInt(css, 10)).toBe(NAV_ICON_SIZE)
  })

  it('area computation with icon size is consistent', () => {
    const area = NAV_ICON_SIZE * NAV_ICON_SIZE
    expect(area).toBe(NAV_ICON_SIZE ** 2)
  })
})

describe('DEFAULT_PAGINATION_PAGE_NUMBER', () => {
  it('is a numeric string convertible to a positive integer', () => {
    expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string')
    expect(/^\d+$/.test(DEFAULT_PAGINATION_PAGE_NUMBER)).toBe(true)
    const n = Number(DEFAULT_PAGINATION_PAGE_NUMBER)
    expect(Number.isFinite(n)).toBe(true)
    expect(Number.isInteger(n)).toBe(true)
    expect(n).toBeGreaterThanOrEqual(1)
  })

  it('computes zero-based offset correctly with the default page and limit', () => {
    const page = parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)
    const offset = (page - 1) * DEFAULT_TRANSACTION_LIMIT
    expect(Number.isInteger(offset)).toBe(true)
    expect(offset).toBeGreaterThanOrEqual(0)
  })

  it('can be used to build URLs with the correct page param', () => {
    const url = new URL('https://example.com/')
    url.searchParams.set('page', DEFAULT_PAGINATION_PAGE_NUMBER)
    expect(url.searchParams.get('page')).toBe(DEFAULT_PAGINATION_PAGE_NUMBER)
  })
})