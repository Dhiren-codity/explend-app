import { describe, test, expect } from 'vitest'
import { DEFAULT_TRANSACTION_LIMIT, NAV_ICON_SIZE, DEFAULT_PAGINATION_PAGE_NUMBER } from './config/constants/navigation'
import * as navigation from './config/constants/navigation'

describe('config/constants/navigation', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test(async () => {
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(30)
    expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number')
    expect(DEFAULT_TRANSACTION_LIMIT).not.toBeNaN()
    expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0)
  })

  test(async () => {
    expect(NAV_ICON_SIZE).toBe(24)
    expect(typeof NAV_ICON_SIZE).toBe('number')
    expect(NAV_ICON_SIZE % 1).toBe(0) // integer
  })

  test(async () => {
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
    expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string')
    expect(parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)).toBe(1)
  })

  test(async () => {
    expect('NAV_TITLE' in navigation).toBe(false)
    expect('SEARCH_PARAM' in navigation).toBe(false)
    expect(navigation.NAV_TITLE).toBeUndefined()
    expect(navigation.SEARCH_PARAM).toBeUndefined()
  })

  test(async () => {
    const dtlDescriptor = Object.getOwnPropertyDescriptor(navigation, 'DEFAULT_TRANSACTION_LIMIT')
    const nisDescriptor = Object.getOwnPropertyDescriptor(navigation, 'NAV_ICON_SIZE')
    const dppnDescriptor = Object.getOwnPropertyDescriptor(navigation, 'DEFAULT_PAGINATION_PAGE_NUMBER')

    expect(dtlDescriptor).toBeDefined()
    expect(nisDescriptor).toBeDefined()
    expect(dppnDescriptor).toBeDefined()

    // ESM namespace properties should not be writable/configurable
    expect(dtlDescriptor && dtlDescriptor.writable).toBe(false)
    expect(nisDescriptor && nisDescriptor.writable).toBe(false)
    expect(dppnDescriptor && dppnDescriptor.writable).toBe(false)

    expect(dtlDescriptor && dtlDescriptor.configurable).toBe(false)
    expect(nisDescriptor && nisDescriptor.configurable).toBe(false)
    expect(dppnDescriptor && dppnDescriptor.configurable).toBe(false)
  })

  test(async () => {
    expect(() => {
      // @ts-expect-error - attempting to reassign an import should throw at runtime
      // eslint-disable-next-line no-global-assign
      DEFAULT_TRANSACTION_LIMIT = 100
    }).toThrowError()
    expect(() => {
      // @ts-expect-error
      // eslint-disable-next-line no-global-assign
      NAV_ICON_SIZE = 48
    }).toThrowError()
    expect(() => {
      // @ts-expect-error
      // eslint-disable-next-line no-global-assign
      DEFAULT_PAGINATION_PAGE_NUMBER = '2'
    }).toThrowError()
  })

  test(async () => {
    const keys = Object.keys(navigation)
    expect(keys).toContain('DEFAULT_TRANSACTION_LIMIT')
    expect(keys).toContain('NAV_ICON_SIZE')
    expect(keys).toContain('DEFAULT_PAGINATION_PAGE_NUMBER')
  })

  test('async check: values remain stable across async boundary', async () => {
    await Promise.resolve()
    expect(DEFAULT_TRANSACTION_LIMIT).toBe(30)
    expect(NAV_ICON_SIZE).toBe(24)
    expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1')
  })
})
