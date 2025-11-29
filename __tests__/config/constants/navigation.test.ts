import { describe, it, expect, vi, afterEach } from 'vitest'
import * as navigation from '../../../config/constants/navigation'
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from '../../../config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('navigation constants - exports shape', () => {
  it('exports only the expected runtime keys', () => {
    const keys = Object.keys(navigation).sort()
    expect(keys).toEqual(
      ['DEFAULT_TRANSACTION_LIMIT', 'NAV_ICON_SIZE', 'DEFAULT_PAGINATION_PAGE_NUMBER'].sort()
    )
  })

  it('does not export NAV_TITLE at runtime', () => {
    expect('NAV_TITLE' in navigation).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(navigation, 'NAV_TITLE')).toBe(false)
  })

  it('does not export SEARCH_PARAM at runtime', () => {
    expect('SEARCH_PARAM' in navigation).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(navigation, 'SEARCH_PARAM')).toBe(false)
  })

  it('named imports equal namespace values', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(navigation.DEFAULT_TRANSACTION_LIMIT)
    expect(NAV_ICON_SIZE).toBe(navigation.NAV_ICON_SIZE)
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe(navigation.DEFAULT_PAGINATION_PAGE_NUMBER)
  })

  it('dynamic import returns the same constant values', async () => {
    const mod = await import('../../../config/constants/navigation')
    expect(mod.DEFAULT_TRANSACTION_LIMIT).toBe(DEFAULT_TRANSACTION_LIMIT)
    expect(mod.NAV_ICON_SIZE).toBe(NAV_ICON_SIZE)
    expect(mod.DEFAULT_PAGINATION_PAGE_NUMBER).toBe(DEFAULT_PAGINATION_PAGE_NUMBER)
  })
})

describe('DEFAULT_TRANSACTION_LIMIT', () => {
  it('has the correct value (30)', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('is a positive integer', () => {
    expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number')
    expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0)
  })

  it('can be used to cap an array length', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i)
    const capped = arr.slice(0, DEFAULT_TRANSACTION_LIMIT)
    expect(capped.length).toBe(DEFAULT_TRANSACTION_LIMIT)
  })

  it('doubles correctly in arithmetic operations', () => {
    expect(DEFAULT_TRANSACTION_LIMIT * 2).toBe(60)
  })

  it('is present as an own, non-writable, non-configurable, enumerable property on the module namespace', () => {
    const desc = Object.getOwnPropertyDescriptor(navigation, 'DEFAULT_TRANSACTION_LIMIT')
    expect(desc?.writable).toBe(false)
    expect(desc?.configurable).toBe(false)
    expect(desc?.enumerable).toBe(true)
  })

  it('is accessible via the "in" operator on the module namespace', () => {
    expect('DEFAULT_TRANSACTION_LIMIT' in navigation).toBe(true)
  })
})

describe('NAV_ICON_SIZE', () => {
  it('has the correct value (24)', () => {
    expect(NAV_ICON_SIZE).toBe(24)
  })

  it('is an even integer', () => {
    expect(typeof NAV_ICON_SIZE).toBe('number')
    expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true)
    expect(NAV_ICON_SIZE % 2).toBe(0)
  })

  it('can be used to build a px string for styles', () => {
    const px = `${NAV_ICON_SIZE}px`
    expect(px).toBe('24px')
  })

  it('is present as an own, non-writable, non-configurable, enumerable property on the module namespace', () => {
    const desc = Object.getOwnPropertyDescriptor(navigation, 'NAV_ICON_SIZE')
    expect(desc?.writable).toBe(false)
    expect(desc?.configurable).toBe(false)
    expect(desc?.enumerable).toBe(true)
  })
})

describe('DEFAULT_PAGINATION_PAGE_NUMBER', () => {
  it('has the correct value ("1")', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })

  it('converts to the number 1', () => {
    expect(Number(DEFAULT_PAGINATION_PAGE_NUMBER)).toBe(1)
    expect(parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)).toBe(1)
  })

  it('remains unchanged when a local copy is mutated', () => {
    let local = DEFAULT_PAGINATION_PAGE_NUMBER
    local = '2'
    expect(local).toBe('2')
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
    expect(navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })

  it('can be used to build URLSearchParams for page', () => {
    const params = new URLSearchParams({ page: DEFAULT_PAGINATION_PAGE_NUMBER })
    expect(params.toString()).toBe('page=1')
  })

  it('is present as an own, non-writable, non-configurable, enumerable property on the module namespace', () => {
    const desc = Object.getOwnPropertyDescriptor(navigation, 'DEFAULT_PAGINATION_PAGE_NUMBER')
    expect(desc?.writable).toBe(false)
    expect(desc?.configurable).toBe(false)
    expect(desc?.enumerable).toBe(true)
  })
})

describe('module namespace spread and copying', () => {
  it('spreading the module namespace produces a plain object with the same values', () => {
    const copy = { ...navigation }
    expect(Object.keys(copy).sort()).toEqual(
      ['DEFAULT_TRANSACTION_LIMIT', 'NAV_ICON_SIZE', 'DEFAULT_PAGINATION_PAGE_NUMBER'].sort()
    )
    expect(copy.DEFAULT_TRANSACTION_LIMIT).toBe(30)
    expect(copy.NAV_ICON_SIZE).toBe(24)
    expect(copy.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })
})
