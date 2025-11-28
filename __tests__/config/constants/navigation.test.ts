import { describe, it, expect, vi, afterEach } from 'vitest'
import * as navigation from '../../../config/constants/navigation'
import {
  DEFAULT_TRANSACTION_LIMIT as DTL,
  NAV_ICON_SIZE as NIS,
  DEFAULT_PAGINATION_PAGE_NUMBER as DPPN,
} from '../../../config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('config/constants/navigation runtime exports', () => {
  it('module object is defined', () => {
    expect(navigation).toBeDefined()
    expect(typeof navigation).toBe('object')
  })

  it('exports expected runtime constants', () => {
    expect('DEFAULT_TRANSACTION_LIMIT' in navigation).toBe(true)
    expect('NAV_ICON_SIZE' in navigation).toBe(true)
    expect('DEFAULT_PAGINATION_PAGE_NUMBER' in navigation).toBe(true)
  })

  it('does not export const enums at runtime (NAV_TITLE, SEARCH_PARAM)', () => {
    expect('NAV_TITLE' in navigation).toBe(false)
    expect('SEARCH_PARAM' in navigation).toBe(false)
    expect((navigation as any).NAV_TITLE).toBeUndefined()
    expect((navigation as any).SEARCH_PARAM).toBeUndefined()
  })

  it('has own properties for runtime constants', () => {
    expect(Object.prototype.hasOwnProperty.call(navigation, 'DEFAULT_TRANSACTION_LIMIT')).toBe(true)
    expect(Object.prototype.hasOwnProperty.call(navigation, 'NAV_ICON_SIZE')).toBe(true)
    expect(Object.prototype.hasOwnProperty.call(navigation, 'DEFAULT_PAGINATION_PAGE_NUMBER')).toBe(true)
  })

  it('DEFAULT_TRANSACTION_LIMIT equals 30', () => {
    expect(navigation.DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('DEFAULT_TRANSACTION_LIMIT is a finite number', () => {
    expect(typeof navigation.DEFAULT_TRANSACTION_LIMIT).toBe('number')
    expect(Number.isFinite(navigation.DEFAULT_TRANSACTION_LIMIT)).toBe(true)
  })

  it('DEFAULT_TRANSACTION_LIMIT is a positive integer', () => {
    expect(Number.isInteger(navigation.DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(navigation.DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0)
  })

  it('NAV_ICON_SIZE equals 24', () => {
    expect(navigation.NAV_ICON_SIZE).toBe(24)
  })

  it('NAV_ICON_SIZE is a finite number', () => {
    expect(typeof navigation.NAV_ICON_SIZE).toBe('number')
    expect(Number.isFinite(navigation.NAV_ICON_SIZE)).toBe(true)
  })

  it('NAV_ICON_SIZE is a positive integer', () => {
    expect(Number.isInteger(navigation.NAV_ICON_SIZE)).toBe(true)
    expect(navigation.NAV_ICON_SIZE).toBeGreaterThan(0)
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER equals "1"', () => {
    expect(navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER is a string and parses to 1', () => {
    expect(typeof navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string')
    expect(parseInt(navigation.DEFAULT_PAGINATION_PAGE_NUMBER, 10)).toBe(1)
  })

  it('module namespace object is non-extensible and sealed', () => {
    expect(Object.isExtensible(navigation)).toBe(false)
    expect(Object.isSealed(navigation)).toBe(true)
  })

  it('exported properties are non-writable, non-configurable, enumerable (DEFAULT_TRANSACTION_LIMIT)', () => {
    const desc = Object.getOwnPropertyDescriptor(navigation, 'DEFAULT_TRANSACTION_LIMIT')
    expect(desc).toBeDefined()
    expect(desc?.writable).toBe(false)
    expect(desc?.configurable).toBe(false)
    expect(desc?.enumerable).toBe(true)
  })

  it('exported properties are non-writable, non-configurable, enumerable (NAV_ICON_SIZE)', () => {
    const desc = Object.getOwnPropertyDescriptor(navigation, 'NAV_ICON_SIZE')
    expect(desc).toBeDefined()
    expect(desc?.writable).toBe(false)
    expect(desc?.configurable).toBe(false)
    expect(desc?.enumerable).toBe(true)
  })

  it('cannot reassign exported constants on the module namespace object', () => {
    expect(() => {
      ;(navigation as any).DEFAULT_TRANSACTION_LIMIT = 99
    }).toThrow()
    expect(navigation.DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('Object.keys includes runtime constants and excludes const enums', () => {
    const keys = Object.keys(navigation)
    expect(keys).toEqual(expect.arrayContaining(['DEFAULT_TRANSACTION_LIMIT', 'NAV_ICON_SIZE', 'DEFAULT_PAGINATION_PAGE_NUMBER']))
    expect(keys).not.toEqual(expect.arrayContaining(['NAV_TITLE', 'SEARCH_PARAM']))
  })

  it('named and namespace imports resolve to the same values', () => {
    expect(DTL).toBe(navigation.DEFAULT_TRANSACTION_LIMIT)
    expect(NIS).toBe(navigation.NAV_ICON_SIZE)
    expect(DPPN).toBe(navigation.DEFAULT_PAGINATION_PAGE_NUMBER)
  })
})
