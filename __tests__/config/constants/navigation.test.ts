import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  DEFAULT_PAGINATION_PAGE_NUMBER
} from '../../../config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('navigation constants module', () => {
  it('exports required constants via dynamic import', async () => {
    const mod = await import('../../../config/constants/navigation')
    expect('DEFAULT_TRANSACTION_LIMIT' in mod).toBe(true)
    expect('NAV_ICON_SIZE' in mod).toBe(true)
    expect('DEFAULT_PAGINATION_PAGE_NUMBER' in mod).toBe(true)
  })

  it('DEFAULT_TRANSACTION_LIMIT has the expected value', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('DEFAULT_TRANSACTION_LIMIT is a positive, finite integer', () => {
    expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number')
    expect(Number.isFinite(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0)
  })

  it('DEFAULT_TRANSACTION_LIMIT stringifies correctly', () => {
    expect(String(DEFAULT_TRANSACTION_LIMIT)).toBe('30')
    expect(DEFAULT_TRANSACTION_LIMIT.toString()).toBe('30')
  })

  it('DEFAULT_TRANSACTION_LIMIT can be used to create fixed-length arrays', () => {
    const arr = Array.from({ length: DEFAULT_TRANSACTION_LIMIT }, (_, i) => i)
    expect(arr.length).toBe(30)
    expect(arr[0]).toBe(0)
    expect(arr[29]).toBe(29)
  })

  it('NAV_ICON_SIZE has the expected value', () => {
    expect(NAV_ICON_SIZE).toBe(24)
  })

  it('NAV_ICON_SIZE is a positive, finite, even integer', () => {
    expect(typeof NAV_ICON_SIZE).toBe('number')
    expect(Number.isFinite(NAV_ICON_SIZE)).toBe(true)
    expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true)
    expect(NAV_ICON_SIZE).toBeGreaterThan(0)
    expect(NAV_ICON_SIZE % 2).toBe(0)
  })

  it('NAV_ICON_SIZE can be used for pixel values', () => {
    const cssValue = `${NAV_ICON_SIZE}px`
    expect(cssValue).toBe('24px')
  })

  it('NAV_ICON_SIZE squared yields expected area', () => {
    const area = NAV_ICON_SIZE * NAV_ICON_SIZE
    expect(area).toBe(576)
  })

  it('DEFAULT_TRANSACTION_LIMIT is greater than NAV_ICON_SIZE', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(NAV_ICON_SIZE)
  })

  it('repeating a character NAV_ICON_SIZE times yields correct length', () => {
    const str = 'x'.repeat(NAV_ICON_SIZE)
    expect(str.length).toBe(24)
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER has the expected value', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER is a numeric string representing one', () => {
    expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string')
    expect(/^\d+$/.test(DEFAULT_PAGINATION_PAGE_NUMBER)).toBe(true)
    expect(parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)).toBe(1)
    expect(+DEFAULT_PAGINATION_PAGE_NUMBER).toBe(1)
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER length is a single character', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER.length).toBe(1)
  })

  it('parsed DEFAULT_PAGINATION_PAGE_NUMBER is within DEFAULT_TRANSACTION_LIMIT', () => {
    const pageNum = parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)
    expect(pageNum).toBeGreaterThan(0)
    expect(pageNum).toBeLessThanOrEqual(DEFAULT_TRANSACTION_LIMIT)
  })

  it('mutating a local copy does not affect DEFAULT_PAGINATION_PAGE_NUMBER', () => {
    let page = DEFAULT_PAGINATION_PAGE_NUMBER
    page = '2'
    expect(page).toBe('2')
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })

  it('derived calculations do not mutate NAV_ICON_SIZE', () => {
    const doubled = NAV_ICON_SIZE * 2
    expect(doubled).toBe(48)
    expect(NAV_ICON_SIZE).toBe(24)
  })

  it('conversions on DEFAULT_TRANSACTION_LIMIT do not mutate it', () => {
    const asString = `${DEFAULT_TRANSACTION_LIMIT}`
    const incremented = DEFAULT_TRANSACTION_LIMIT + 1
    expect(asString).toBe('30')
    expect(incremented).toBe(31)
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('dynamic import returns the same constant values', async () => {
    const mod = await import('../../../config/constants/navigation')
    expect(mod.DEFAULT_TRANSACTION_LIMIT).toBe(30)
    expect(mod.NAV_ICON_SIZE).toBe(24)
    expect(mod.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })
})
