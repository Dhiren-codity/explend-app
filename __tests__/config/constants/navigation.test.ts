import { describe, it, expect, vi, afterEach } from 'vitest'
import * as nav from '../../../config/constants/navigation'
import { DEFAULT_TRANSACTION_LIMIT, NAV_ICON_SIZE, DEFAULT_PAGINATION_PAGE_NUMBER } from '../../../config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('navigation constants - value checks', () => {
  it('DEFAULT_TRANSACTION_LIMIT equals 30', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('DEFAULT_TRANSACTION_LIMIT is a positive integer', () => {
    expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number')
    expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0)
  })

  it('NAV_ICON_SIZE equals 24', () => {
    expect(NAV_ICON_SIZE).toBe(24)
  })

  it('NAV_ICON_SIZE is divisible by 2 and 3', () => {
    expect(NAV_ICON_SIZE % 2).toBe(0)
    expect(NAV_ICON_SIZE % 3).toBe(0)
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER equals "1"', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER is a string not a number', () => {
    expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string')
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).not.toBe(1 as unknown as string)
  })
})

describe('navigation constants - usage scenarios', () => {
  it('using DEFAULT_TRANSACTION_LIMIT to slice an array produces correct length', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i)
    const sliced = arr.slice(0, DEFAULT_TRANSACTION_LIMIT)
    expect(sliced.length).toBe(DEFAULT_TRANSACTION_LIMIT)
  })

  it('parsing DEFAULT_PAGINATION_PAGE_NUMBER yields number 1', () => {
    const parsed = parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)
    expect(parsed).toBe(1)
  })

  it('NAV_ICON_SIZE can be used in arithmetic operations', () => {
    expect(NAV_ICON_SIZE * 2).toBe(48)
    expect(NAV_ICON_SIZE / 6).toBe(4)
  })

  it('constants are finite numbers or valid string as applicable', () => {
    expect(Number.isFinite(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(Number.isFinite(NAV_ICON_SIZE)).toBe(true)
    expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string')
    expect(DEFAULT_PAGINATION_PAGE_NUMBER.length).toBeGreaterThan(0)
  })
})

describe('navigation module namespace - immutability and descriptors', () => {
  it('module namespace exports have expected properties', () => {
    expect(nav).toHaveProperty('DEFAULT_TRANSACTION_LIMIT', 30)
    expect(nav).toHaveProperty('NAV_ICON_SIZE', 24)
    expect(nav).toHaveProperty('DEFAULT_PAGINATION_PAGE_NUMBER', '1')
  })

  it('module namespace object is not extensible (frozen-like)', () => {
    expect(Object.isExtensible(nav)).toBe(false)
    expect(Object.isSealed(nav)).toBe(true)
    expect(Object.isFrozen(nav)).toBe(true)
  })

  it('cannot add a new export to module namespace', () => {
    expect(() => {
      ;(nav as any).NEW_CONST = 123
    }).toThrow(TypeError)
    expect((nav as any).NEW_CONST).toBeUndefined()
  })

  it('cannot redefine a module namespace export', () => {
    expect(() => {
      Object.defineProperty(nav, 'DEFAULT_TRANSACTION_LIMIT', { value: 999 })
    }).toThrow(TypeError)
    expect(nav.DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('cannot delete a module namespace export', () => {
    expect(() => {
      // delete on non-configurable property in strict mode throws
      delete (nav as any).DEFAULT_TRANSACTION_LIMIT
    }).toThrow(TypeError)
    expect(nav.DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('export property descriptors are non-configurable and enumerable', () => {
    const d1 = Object.getOwnPropertyDescriptor(nav, 'DEFAULT_TRANSACTION_LIMIT')
    const d2 = Object.getOwnPropertyDescriptor(nav, 'NAV_ICON_SIZE')
    const d3 = Object.getOwnPropertyDescriptor(nav, 'DEFAULT_PAGINATION_PAGE_NUMBER')

    expect(d1).toBeDefined()
    expect(d2).toBeDefined()
    expect(d3).toBeDefined()

    expect(d1?.configurable).toBe(false)
    expect(d2?.configurable).toBe(false)
    expect(d3?.configurable).toBe(false)

    expect(d1?.enumerable).toBe(true)
    expect(d2?.enumerable).toBe(true)
    expect(d3?.enumerable).toBe(true)
  })
})

describe('navigation module - import caching behavior', () => {
  it('re-importing the module yields the same module instance', async () => {
    const mod1 = await import('../../../config/constants/navigation')
    const mod2 = await import('../../../config/constants/navigation')
    expect(mod1).toBe(mod2)
  })

  it('values are consistent across dynamic imports', async () => {
    const mod = await import('../../../config/constants/navigation')
    expect(mod.DEFAULT_TRANSACTION_LIMIT).toBe(DEFAULT_TRANSACTION_LIMIT)
    expect(mod.NAV_ICON_SIZE).toBe(NAV_ICON_SIZE)
    expect(mod.DEFAULT_PAGINATION_PAGE_NUMBER).toBe(DEFAULT_PAGINATION_PAGE_NUMBER)
  })
})
