import { describe, it, expect, vi, afterEach } from 'vitest'
import { DEFAULT_TRANSACTION_LIMIT, NAV_ICON_SIZE, DEFAULT_PAGINATION_PAGE_NUMBER } from '../../../config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('navigation constants - static imports', () => {
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

  it('NAV_ICON_SIZE is a positive even integer', () => {
    expect(typeof NAV_ICON_SIZE).toBe('number')
    expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true)
    expect(NAV_ICON_SIZE).toBeGreaterThan(0)
    expect(NAV_ICON_SIZE % 2).toBe(0)
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER equals "1"', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER is string and parses to 1', () => {
    expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string')
    expect(parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)).toBe(1)
  })

  it('stringifying constants yields expected literals', () => {
    expect(JSON.stringify({ DEFAULT_TRANSACTION_LIMIT, NAV_ICON_SIZE, DEFAULT_PAGINATION_PAGE_NUMBER }))
      .toBe(JSON.stringify({ DEFAULT_TRANSACTION_LIMIT: 30, NAV_ICON_SIZE: 24, DEFAULT_PAGINATION_PAGE_NUMBER: '1' }))
  })
})

describe('navigation constants - dynamic module shape and immutability', () => {
  it('exports expected runtime keys only (excluding const enums)', async () => {
    const mod = await import('../../../config/constants/navigation')
    const keys = Object.keys(mod).sort()
    expect(keys).toEqual(
      ['DEFAULT_PAGINATION_PAGE_NUMBER', 'DEFAULT_TRANSACTION_LIMIT', 'NAV_ICON_SIZE'].sort()
    )
  })

  it('module namespace properties are read-only (reassignment throws)', async () => {
    const mod = await import('../../../config/constants/navigation')
    expect(mod.DEFAULT_TRANSACTION_LIMIT).toBe(30)
    let error: unknown = null
    try {
      ;(mod as any).DEFAULT_TRANSACTION_LIMIT = 999
    } catch (e) {
      error = e
    }
    expect(error).toBeInstanceOf(TypeError)
    expect(mod.DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('module namespace properties are non-configurable (delete throws)', async () => {
    const mod = await import('../../../config/constants/navigation')
    let error: unknown = null
    try {
      // delete on module namespace should throw in strict mode
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (mod as any).NAV_ICON_SIZE
    } catch (e) {
      error = e
    }
    expect(error).toBeInstanceOf(TypeError)
    expect(mod.NAV_ICON_SIZE).toBe(24)
  })

  it('values read through dynamic import match static imports', async () => {
    const mod = await import('../../../config/constants/navigation')
    expect(mod.DEFAULT_TRANSACTION_LIMIT).toBe(DEFAULT_TRANSACTION_LIMIT)
    expect(mod.NAV_ICON_SIZE).toBe(NAV_ICON_SIZE)
    expect(mod.DEFAULT_PAGINATION_PAGE_NUMBER).toBe(DEFAULT_PAGINATION_PAGE_NUMBER)
  })

  it('constants are finite and not NaN', async () => {
    const mod = await import('../../../config/constants/navigation')
    expect(Number.isFinite(mod.DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(Number.isFinite(mod.NAV_ICON_SIZE)).toBe(true)
    expect(Number.isNaN(mod.DEFAULT_TRANSACTION_LIMIT as unknown as number)).toBe(false)
    expect(Number.isNaN(mod.NAV_ICON_SIZE as unknown as number)).toBe(false)
  })
})
