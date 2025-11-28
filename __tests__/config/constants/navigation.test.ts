import { describe, it, expect, vi, afterEach } from 'vitest'
import * as navigation from '../../../config/constants/navigation'
import {
  DEFAULT_TRANSACTION_LIMIT as DTL,
  NAV_ICON_SIZE as NIS,
  DEFAULT_PAGINATION_PAGE_NUMBER as DPP,
} from '../../../config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('config/constants/navigation - runtime exports', () => {
  it('exports only the runtime constants (no const enums at runtime)', () => {
    const keys = Object.keys(navigation).sort()
    expect(keys).toEqual([
      'DEFAULT_PAGINATION_PAGE_NUMBER',
      'DEFAULT_TRANSACTION_LIMIT',
      'NAV_ICON_SIZE',
    ])
  })

  it('does not expose NAV_TITLE as a runtime export', () => {
    expect('NAV_TITLE' in navigation).toBe(false)
    expect((navigation as any).NAV_TITLE).toBeUndefined()
  })

  it('does not expose SEARCH_PARAM as a runtime export', () => {
    expect('SEARCH_PARAM' in navigation).toBe(false)
    expect((navigation as any).SEARCH_PARAM).toBeUndefined()
  })
})

describe('DEFAULT_TRANSACTION_LIMIT', () => {
  it('has the expected value of 30', () => {
    expect(navigation.DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('is a positive integer', () => {
    const value = navigation.DEFAULT_TRANSACTION_LIMIT
    expect(typeof value).toBe('number')
    expect(Number.isInteger(value)).toBe(true)
    expect(value).toBeGreaterThan(0)
  })

  it('is finite and not NaN', () => {
    const value = navigation.DEFAULT_TRANSACTION_LIMIT
    expect(Number.isFinite(value)).toBe(true)
    expect(Number.isNaN(value)).toBe(false)
  })

  it('cannot be reassigned via the module namespace and remains unchanged', () => {
    const before = navigation.DEFAULT_TRANSACTION_LIMIT
    try {
      ;(navigation as any).DEFAULT_TRANSACTION_LIMIT = 999
    } catch {
      // ignore potential TypeError in strict mode
    }
    expect(navigation.DEFAULT_TRANSACTION_LIMIT).toBe(before)
  })

  it('has a non-configurable, enumerable accessor descriptor', () => {
    const desc = Object.getOwnPropertyDescriptor(navigation, 'DEFAULT_TRANSACTION_LIMIT')
    expect(desc).toBeDefined()
    expect(desc?.enumerable).toBe(true)
    expect(desc?.configurable).toBe(false)
    // Module namespace properties are accessors with only a getter
    expect(typeof desc?.get).toBe('function')
    expect(desc?.set).toBeUndefined()
  })
})

describe('NAV_ICON_SIZE', () => {
  it('has the expected value of 24', () => {
    expect(navigation.NAV_ICON_SIZE).toBe(24)
  })

  it('is a positive integer number', () => {
    const value = navigation.NAV_ICON_SIZE
    expect(typeof value).toBe('number')
    expect(Number.isInteger(value)).toBe(true)
    expect(value).toBeGreaterThan(0)
  })

  it('works in arithmetic operations', () => {
    const value = navigation.NAV_ICON_SIZE
    expect(value / 2).toBe(12)
    expect(value * 2).toBe(48)
    expect(Math.min(navigation.DEFAULT_TRANSACTION_LIMIT, value)).toBe(24)
  })

  it('cannot be reassigned via the module namespace and remains unchanged', () => {
    const before = navigation.NAV_ICON_SIZE
    try {
      ;(navigation as any).NAV_ICON_SIZE = 111
    } catch {
      // ignore potential TypeError in strict mode
    }
    expect(navigation.NAV_ICON_SIZE).toBe(before)
  })

  it('has a non-configurable, enumerable accessor descriptor', () => {
    const desc = Object.getOwnPropertyDescriptor(navigation, 'NAV_ICON_SIZE')
    expect(desc).toBeDefined()
    expect(desc?.enumerable).toBe(true)
    expect(desc?.configurable).toBe(false)
    expect(typeof desc?.get).toBe('function')
    expect(desc?.set).toBeUndefined()
  })

  it('stringifies to "24"', () => {
    expect(String(navigation.NAV_ICON_SIZE)).toBe('24')
  })
})

describe('DEFAULT_PAGINATION_PAGE_NUMBER', () => {
  it('has the expected value of "1"', () => {
    expect(navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })

  it('is a string representing a positive integer', () => {
    const value = navigation.DEFAULT_PAGINATION_PAGE_NUMBER
    expect(typeof value).toBe('string')
    expect(value).toMatch(/^\d+$/)
    expect(parseInt(value, 10)).toBe(1)
  })

  it('cannot be reassigned via the module namespace and remains unchanged', () => {
    const before = navigation.DEFAULT_PAGINATION_PAGE_NUMBER
    try {
      ;(navigation as any).DEFAULT_PAGINATION_PAGE_NUMBER = '999'
    } catch {
      // ignore potential TypeError in strict mode
    }
    expect(navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBe(before)
  })

  it('has a non-configurable, enumerable accessor descriptor', () => {
    const desc = Object.getOwnPropertyDescriptor(navigation, 'DEFAULT_PAGINATION_PAGE_NUMBER')
    expect(desc).toBeDefined()
    expect(desc?.enumerable).toBe(true)
    expect(desc?.configurable).toBe(false)
    expect(typeof desc?.get).toBe('function')
    expect(desc?.set).toBeUndefined()
  })

  it('parses to number 1 and retains exact string value', () => {
    const str = navigation.DEFAULT_PAGINATION_PAGE_NUMBER
    const num = Number(str)
    expect(num).toBe(1)
    expect(String(num)).toBe('1')
  })
})

describe('consistency between named and namespace imports', () => {
  it('named and namespace imports reference the same DEFAULT_TRANSACTION_LIMIT value', () => {
    expect(DTL).toBe(navigation.DEFAULT_TRANSACTION_LIMIT)
  })

  it('named and namespace imports reference the same NAV_ICON_SIZE value', () => {
    expect(NIS).toBe(navigation.NAV_ICON_SIZE)
  })

  it('named and namespace imports reference the same DEFAULT_PAGINATION_PAGE_NUMBER value', () => {
    expect(DPP).toBe(navigation.DEFAULT_PAGINATION_PAGE_NUMBER)
  })
})
