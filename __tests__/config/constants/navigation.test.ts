import { describe, it, expect, vi, afterEach } from 'vitest'
import * as navigationModule from '../../../config/constants/navigation'
import { DEFAULT_TRANSACTION_LIMIT, NAV_ICON_SIZE, DEFAULT_PAGINATION_PAGE_NUMBER } from '../../../config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('config/constants/navigation exports', () => {
  it('exports expected named constants', () => {
    const keys = Object.keys(navigationModule)
    expect(keys).toEqual(expect.arrayContaining([
      'DEFAULT_TRANSACTION_LIMIT',
      'NAV_ICON_SIZE',
      'DEFAULT_PAGINATION_PAGE_NUMBER',
    ]))
  })


})

describe('DEFAULT_TRANSACTION_LIMIT', () => {
  it('has the exact value specified by the source', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('is a finite positive integer', () => {
    expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number')
    expect(Number.isFinite(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0)
  })

  it('matches the value from namespace import', () => {
    expect(navigationModule.DEFAULT_TRANSACTION_LIMIT).toBe(DEFAULT_TRANSACTION_LIMIT)
  })
})

describe('NAV_ICON_SIZE', () => {
  it('has the exact value specified by the source', () => {
    expect(NAV_ICON_SIZE).toBe(24)
  })

  it('is a finite positive integer', () => {
    expect(typeof NAV_ICON_SIZE).toBe('number')
    expect(Number.isFinite(NAV_ICON_SIZE)).toBe(true)
    expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true)
    expect(NAV_ICON_SIZE).toBeGreaterThan(0)
  })

  it('matches the value from namespace import', () => {
    expect(navigationModule.NAV_ICON_SIZE).toBe(NAV_ICON_SIZE)
  })
})

describe('DEFAULT_PAGINATION_PAGE_NUMBER', () => {
  it('has the exact value specified by the source', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })

  it('is a numeric string representing the first page', () => {
    expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string')
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toMatch(/^\d+$/)
    expect(parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)).toBe(1)
    expect(JSON.parse(DEFAULT_PAGINATION_PAGE_NUMBER)).toBe(1)
  })

  it('has no surrounding whitespace', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER.trim()).toBe(DEFAULT_PAGINATION_PAGE_NUMBER)
  })

  it('matches the value from namespace import', () => {
    expect(navigationModule.DEFAULT_PAGINATION_PAGE_NUMBER).toBe(DEFAULT_PAGINATION_PAGE_NUMBER)
  })
})

describe('module namespace behavior', () => {
  it('module namespace is not extensible (frozen-like)', () => {
    expect(Object.isExtensible(navigationModule)).toBe(false)
    expect(Object.isFrozen(navigationModule)).toBe(true)
  })

  it('exported properties are non-writable and non-configurable', () => {
    const d1 = Object.getOwnPropertyDescriptor(navigationModule, 'DEFAULT_TRANSACTION_LIMIT')
    const d2 = Object.getOwnPropertyDescriptor(navigationModule, 'NAV_ICON_SIZE')
    const d3 = Object.getOwnPropertyDescriptor(navigationModule, 'DEFAULT_PAGINATION_PAGE_NUMBER')

    expect(d1?.writable).toBe(false)
    expect(d1?.configurable).toBe(false)
    expect(d1?.enumerable).toBe(true)

    expect(d2?.writable).toBe(false)
    expect(d2?.configurable).toBe(false)
    expect(d2?.enumerable).toBe(true)

    expect(d3?.writable).toBe(false)
    expect(d3?.configurable).toBe(false)
    expect(d3?.enumerable).toBe(true)
  })

})

describe('cross-constant sanity checks', () => {
  it('constants are not equal to each other when they represent different concepts', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).not.toBe(NAV_ICON_SIZE)
    expect(String(DEFAULT_TRANSACTION_LIMIT)).not.toBe(DEFAULT_PAGINATION_PAGE_NUMBER)
  })

  it('numeric constants are even numbers (as currently defined)', () => {
    expect(DEFAULT_TRANSACTION_LIMIT % 2).toBe(0)
    expect(NAV_ICON_SIZE % 2).toBe(0)
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER coerces to a truthy number', () => {
    expect(Boolean(Number(DEFAULT_PAGINATION_PAGE_NUMBER))).toBe(true)
    expect(Number.isInteger(Number(DEFAULT_PAGINATION_PAGE_NUMBER))).toBe(true)
  })
})
