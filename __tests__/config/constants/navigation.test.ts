import { describe, it, expect, vi, afterEach } from 'vitest'
import * as navigation from '@/config/constants/navigation'
import { DEFAULT_TRANSACTION_LIMIT, NAV_ICON_SIZE, DEFAULT_PAGINATION_PAGE_NUMBER } from '@/config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('navigation constants - values', () => {
  it('exports the correct DEFAULT_TRANSACTION_LIMIT value', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('exports the correct NAV_ICON_SIZE value', () => {
    expect(NAV_ICON_SIZE).toBe(24)
  })

  it('exports the correct DEFAULT_PAGINATION_PAGE_NUMBER value', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })
})

describe('navigation constants - types and numeric characteristics', () => {
  it('DEFAULT_TRANSACTION_LIMIT is a finite positive integer', () => {
    expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number')
    expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(Number.isFinite(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0)
  })

  it('NAV_ICON_SIZE is a finite positive integer and even', () => {
    expect(typeof NAV_ICON_SIZE).toBe('number')
    expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true)
    expect(Number.isFinite(NAV_ICON_SIZE)).toBe(true)
    expect(NAV_ICON_SIZE).toBeGreaterThan(0)
    expect(NAV_ICON_SIZE % 2).toBe(0)
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER is a string and converts to the number 1', () => {
    expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string')
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).not.toBe(1)
    expect(Number(DEFAULT_PAGINATION_PAGE_NUMBER)).toBe(1)
  })
})

describe('navigation constants - practical usage checks', () => {
  it('slicing an array with DEFAULT_TRANSACTION_LIMIT yields 30 items', () => {
    const arr = Array.from({ length: 50 }, (_, i) => i + 1)
    const slice = arr.slice(0, DEFAULT_TRANSACTION_LIMIT)
    expect(slice.length).toBe(30)
    expect(slice[0]).toBe(1)
    expect(slice.at(-1)).toBe(30)
  })

  it('NAV_ICON_SIZE can be used to build a pixel string', () => {
    const px = `${NAV_ICON_SIZE}px`
    expect(px).toBe('24px')
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER is trimmed and unchanged', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER.trim()).toBe('1')
  })

  it('DEFAULT_TRANSACTION_LIMIT is greater than NAV_ICON_SIZE', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(NAV_ICON_SIZE)
  })

  it('sum of numeric constants equals 54', () => {
    const sum = DEFAULT_TRANSACTION_LIMIT + NAV_ICON_SIZE
    expect(sum).toBe(54)
  })

  it('JSON stringification with constants has expected representation', () => {
    const payload = {
      DEFAULT_TRANSACTION_LIMIT,
      NAV_ICON_SIZE,
      DEFAULT_PAGINATION_PAGE_NUMBER,
    }
    expect(JSON.stringify(payload)).toBe('{"DEFAULT_TRANSACTION_LIMIT":30,"NAV_ICON_SIZE":24,"DEFAULT_PAGINATION_PAGE_NUMBER":"1"}')
  })

  it('splitting DEFAULT_PAGINATION_PAGE_NUMBER yields a single digit "1"', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER.split('')).toEqual(['1'])
  })
})

describe('navigation constants - module export surface', () => {
  it('module exports include expected constant names', () => {
    const keys = Object.keys(navigation)
    expect(keys).toEqual(expect.arrayContaining(['DEFAULT_TRANSACTION_LIMIT', 'NAV_ICON_SIZE', 'DEFAULT_PAGINATION_PAGE_NUMBER']))
  })

  it('attempting to mutate exported values via namespace does not change them', () => {
    try {
      ;(navigation as any).DEFAULT_TRANSACTION_LIMIT = 999
      ;(navigation as any).NAV_ICON_SIZE = 999
      ;(navigation as any).DEFAULT_PAGINATION_PAGE_NUMBER = '999'
    } catch {
      // ignore if engine throws on assignment to read-only exports
    }
    expect(navigation.DEFAULT_TRANSACTION_LIMIT).toBe(30)
    expect(navigation.NAV_ICON_SIZE).toBe(24)
    expect(navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })
})
