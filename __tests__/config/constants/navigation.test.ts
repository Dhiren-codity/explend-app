import { describe, it, expect, vi, afterEach } from 'vitest'
import * as navigationModule from '../../../config/constants/navigation'
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from '../../../config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('DEFAULT_TRANSACTION_LIMIT', () => {
  it('has the correct numeric value', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('is a number', () => {
    expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number')
  })

  it('is an integer', () => {
    expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
  })

  it('is positive and greater than zero', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0)
  })

  it('is within a sensible upper bound', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBeLessThanOrEqual(1000)
  })

  it('matches the value from namespace import', () => {
    expect(navigationModule.DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })
})

describe('NAV_ICON_SIZE', () => {
  it('has the correct numeric value', () => {
    expect(NAV_ICON_SIZE).toBe(24)
  })

  it('is a number', () => {
    expect(typeof NAV_ICON_SIZE).toBe('number')
  })

  it('is an integer', () => {
    expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true)
  })

  it('is positive', () => {
    expect(NAV_ICON_SIZE).toBeGreaterThan(0)
  })

  it('is divisible by 2', () => {
    expect(NAV_ICON_SIZE % 2).toBe(0)
  })

  it('is within expected icon size range', () => {
    expect(NAV_ICON_SIZE).toBeGreaterThanOrEqual(16)
    expect(NAV_ICON_SIZE).toBeLessThanOrEqual(64)
  })

  it('matches the value from namespace import', () => {
    expect(navigationModule.NAV_ICON_SIZE).toBe(24)
  })
})

describe('DEFAULT_PAGINATION_PAGE_NUMBER', () => {
  it('has the correct string value', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })

  it('is a string', () => {
    expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string')
  })

  it('represents a positive integer', () => {
    expect(/^\d+$/.test(DEFAULT_PAGINATION_PAGE_NUMBER)).toBe(true)
    expect(parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)).toBe(1)
  })

  it('converts to the correct number', () => {
    expect(Number(DEFAULT_PAGINATION_PAGE_NUMBER)).toBe(1)
  })

  it('is not an empty string', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER.length).toBeGreaterThan(0)
  })

  it('matches the value from namespace import', () => {
    expect(navigationModule.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })
})

describe('module exports', () => {
  it('exports only runtime values (no const enums)', () => {
    const keys = Object.keys(navigationModule)
    expect(keys).toContain('DEFAULT_TRANSACTION_LIMIT')
    expect(keys).toContain('NAV_ICON_SIZE')
    expect(keys).toContain('DEFAULT_PAGINATION_PAGE_NUMBER')
    expect(keys.length).toBe(3)
  })

  it('does not have NAV_TITLE as a runtime export', () => {
    const m: any = navigationModule
    expect(Object.prototype.hasOwnProperty.call(m, 'NAV_TITLE')).toBe(false)
    expect(m.NAV_TITLE).toBeUndefined()
  })

  it('does not have SEARCH_PARAM as a runtime export', () => {
    const m: any = navigationModule
    expect(Object.prototype.hasOwnProperty.call(m, 'SEARCH_PARAM')).toBe(false)
    expect(m.SEARCH_PARAM).toBeUndefined()
  })

  it('dynamic import exposes the same values', async () => {
    const mod = await import('../../../config/constants/navigation')
    expect(mod.DEFAULT_TRANSACTION_LIMIT).toBe(DEFAULT_TRANSACTION_LIMIT)
    expect(mod.NAV_ICON_SIZE).toBe(NAV_ICON_SIZE)
    expect(mod.DEFAULT_PAGINATION_PAGE_NUMBER).toBe(DEFAULT_PAGINATION_PAGE_NUMBER)
  })

  it('dynamic import does not include const enums', async () => {
    const mod: any = await import('../../../config/constants/navigation')
    expect(Object.prototype.hasOwnProperty.call(mod, 'NAV_TITLE')).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(mod, 'SEARCH_PARAM')).toBe(false)
  })
})
