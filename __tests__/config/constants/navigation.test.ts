import { describe, it, expect, vi, afterEach } from 'vitest'
import * as nav from '@/config/constants/navigation'
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from '@/config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('navigation constants module - export values', () => {
  it('exports DEFAULT_TRANSACTION_LIMIT = 30 (number)', () => {
    expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number')
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('exports NAV_ICON_SIZE = 24 (number)', () => {
    expect(typeof NAV_ICON_SIZE).toBe('number')
    expect(NAV_ICON_SIZE).toBe(24)
  })

  it("exports DEFAULT_PAGINATION_PAGE_NUMBER = '1' (string)", () => {
    expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string')
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })

  it('exports only the expected keys', () => {
    const keys = Object.keys(nav).sort()
    expect(keys).toEqual(
      ['DEFAULT_TRANSACTION_LIMIT', 'NAV_ICON_SIZE', 'DEFAULT_PAGINATION_PAGE_NUMBER'].sort()
    )
  })


describe('navigation constants module - numeric constraints', () => {
  it('DEFAULT_TRANSACTION_LIMIT is a positive integer', () => {
    expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0)
  })

  it('NAV_ICON_SIZE is a positive even integer', () => {
    expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true)
    expect(NAV_ICON_SIZE).toBeGreaterThan(0)
    expect(NAV_ICON_SIZE % 2).toBe(0)
  })

  it('DEFAULT_TRANSACTION_LIMIT is greater than NAV_ICON_SIZE', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(NAV_ICON_SIZE)
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER parses to integer 1', () => {
    expect(parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)).toBe(1)
  })
})

describe('navigation constants module - module namespace behavior', () => {
  it('cannot reassign exported constant through module namespace', () => {
    expect(() => {
      ;(nav as any).NAV_ICON_SIZE = 999
    }).toThrow()
    expect(NAV_ICON_SIZE).toBe(24)
  })

  it('cannot delete an exported binding', () => {
    expect(() => {
      // Attempt to delete a non-configurable property should throw in strict mode
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (nav as any).DEFAULT_TRANSACTION_LIMIT
    }).toThrow()
    expect('DEFAULT_TRANSACTION_LIMIT' in nav).toBe(true)
  })

  it('module namespace has toStringTag [object Module]', () => {
    expect(Object.prototype.toString.call(nav)).toBe('[object Module]')
  })

  it('spreading the module namespace yields a plain object with the exported values', () => {
    const spread = { ...nav }
    expect(spread).toEqual({
      DEFAULT_TRANSACTION_LIMIT: 30,
      NAV_ICON_SIZE: 24,
      DEFAULT_PAGINATION_PAGE_NUMBER: '1',
    })
  })

  it('dynamic import returns the same module namespace object instance', async () => {
    const dyn = await import('../../../config/constants/navigation')
    expect(dyn === nav).toBe(true)
  })

  it('enumerating with for...in yields only the exported names', () => {
    const enumerated: string[] = []
    // eslint-disable-next-line guard-for-in
    for (const k in nav) enumerated.push(k)
    expect(enumerated.sort()).toEqual(
      ['DEFAULT_TRANSACTION_LIMIT', 'NAV_ICON_SIZE', 'DEFAULT_PAGINATION_PAGE_NUMBER'].sort()
    )
  })

  it('Object.entries reflects the exported names and values', () => {
    const entries = Object.entries(nav).sort((a, b) => a[0].localeCompare(b[0]))
    expect(entries).toEqual(
      [
        ['DEFAULT_PAGINATION_PAGE_NUMBER', '1'],
        ['DEFAULT_TRANSACTION_LIMIT', 30],
        ['NAV_ICON_SIZE', 24],
      ].sort((a, b) => a[0].localeCompare(b[0]))
    )
  })
})
