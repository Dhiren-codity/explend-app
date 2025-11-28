import { describe, it, expect, vi, afterEach } from 'vitest'
import * as navigationNS from '../../../config/constants/navigation'
import { DEFAULT_TRANSACTION_LIMIT, NAV_ICON_SIZE, DEFAULT_PAGINATION_PAGE_NUMBER } from '../../../config/constants/navigation'

afterEach(() => {
  vi.clearAllMocks()
})

describe('navigation constants - basic values', () => {
  it('DEFAULT_TRANSACTION_LIMIT equals 30', () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(30)
  })

  it('NAV_ICON_SIZE equals 24', () => {
    expect(NAV_ICON_SIZE).toBe(24)
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER equals "1"', () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })
})

describe('navigation constants - types', () => {
  it('types are number, number, string respectively', () => {
    expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number')
    expect(typeof NAV_ICON_SIZE).toBe('number')
    expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string')
  })

  it('numeric constants are finite numbers', () => {
    expect(Number.isFinite(DEFAULT_TRANSACTION_LIMIT)).toBe(true)
    expect(Number.isFinite(NAV_ICON_SIZE)).toBe(true)
  })
})

describe('navigation constants - usage scenarios', () => {
  it('DEFAULT_TRANSACTION_LIMIT can be used as an array length', () => {
    const arr = new Array(DEFAULT_TRANSACTION_LIMIT).fill(0)
    expect(arr.length).toBe(DEFAULT_TRANSACTION_LIMIT)
  })

  it('NAV_ICON_SIZE can be used for CSS px values', () => {
    const cssSize = `${NAV_ICON_SIZE}px`
    expect(cssSize).toBe('24px')
  })

  it('DEFAULT_PAGINATION_PAGE_NUMBER parses to 1', () => {
    const parsed = Number(DEFAULT_PAGINATION_PAGE_NUMBER)
    expect(parsed).toBe(1)
  })

  it('URLSearchParams can use DEFAULT_PAGINATION_PAGE_NUMBER for page param', () => {
    const params = new URLSearchParams()
    params.set('page', DEFAULT_PAGINATION_PAGE_NUMBER)
    expect(params.get('page')).toBe('1')
  })

  it('DEFAULT_TRANSACTION_LIMIT participates in arithmetic operations', () => {
    const doubled = DEFAULT_TRANSACTION_LIMIT * 2
    expect(doubled).toBe(60)
  })
})

describe('navigation module exports - structure', () => {
  it('module named exports contain only expected keys', () => {
    const keys = Object.keys(navigationNS).sort()
    expect(keys).toEqual(
      ['DEFAULT_PAGINATION_PAGE_NUMBER', 'DEFAULT_TRANSACTION_LIMIT', 'NAV_ICON_SIZE'].sort()
    )
  })

  it('does not have a default export', () => {
    expect(Object.prototype.hasOwnProperty.call(navigationNS, 'default')).toBe(false)
  })

  it('does not expose compile-time-only enums as runtime values', () => {
    expect(Object.prototype.hasOwnProperty.call(navigationNS, 'NAV_TITLE')).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(navigationNS, 'SEARCH_PARAM')).toBe(false)
  })
})

describe('navigation module exports - immutability', () => {
  it('module namespace properties are non-writable and non-configurable', () => {
    const d1 = Object.getOwnPropertyDescriptor(navigationNS, 'DEFAULT_TRANSACTION_LIMIT')
    const d2 = Object.getOwnPropertyDescriptor(navigationNS, 'NAV_ICON_SIZE')
    const d3 = Object.getOwnPropertyDescriptor(navigationNS, 'DEFAULT_PAGINATION_PAGE_NUMBER')

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

  it('attempting to reassign a namespace export throws', () => {
    expect(() => {
      ;(navigationNS as any).DEFAULT_TRANSACTION_LIMIT = 999
    }).toThrow()
    expect(navigationNS.DEFAULT_TRANSACTION_LIMIT).toBe(30)

    expect(() => {
      ;(navigationNS as any).NAV_ICON_SIZE = 999
    }).toThrow()
    expect(navigationNS.NAV_ICON_SIZE).toBe(24)

    expect(() => {
      ;(navigationNS as any).DEFAULT_PAGINATION_PAGE_NUMBER = '999'
    }).toThrow()
    expect(navigationNS.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })
})

describe('navigation constants - import consistency', () => {
  it('namespace and named imports reference the same primitive values', () => {
    expect(navigationNS.DEFAULT_TRANSACTION_LIMIT).toBe(DEFAULT_TRANSACTION_LIMIT)
    expect(navigationNS.NAV_ICON_SIZE).toBe(NAV_ICON_SIZE)
    expect(navigationNS.DEFAULT_PAGINATION_PAGE_NUMBER).toBe(DEFAULT_PAGINATION_PAGE_NUMBER)
  })

  it('dynamic import returns the same values as static import', async () => {
    const mod = await import('../../../config/constants/navigation')
    expect(mod.DEFAULT_TRANSACTION_LIMIT).toBe(DEFAULT_TRANSACTION_LIMIT)
    expect(mod.NAV_ICON_SIZE).toBe(NAV_ICON_SIZE)
    expect(mod.DEFAULT_PAGINATION_PAGE_NUMBER).toBe(DEFAULT_PAGINATION_PAGE_NUMBER)
  })
})
