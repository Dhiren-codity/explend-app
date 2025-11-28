import { describe, test, expect, vi } from 'vitest';
import * as nav from '../navigation';

describe('config/constants/navigation', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test(async () => {
    expect(nav.DEFAULT_TRANSACTION_LIMIT).toBe(30);
    expect(typeof nav.DEFAULT_TRANSACTION_LIMIT).toBe('number');

    expect(nav.NAV_ICON_SIZE).toBe(24);
    expect(typeof nav.NAV_ICON_SIZE).toBe('number');

    expect(nav.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1');
    expect(typeof nav.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string');
  });

  test(async () => {
    expect(nav.NAV_TITLE).toBeUndefined();
    expect(nav.SEARCH_PARAM).toBeUndefined();
  });

  test(async () => {
    expect(() => {
      // @ts-expect-error attempting to mutate imported constant
      nav.DEFAULT_TRANSACTION_LIMIT = 9999;
    }).toThrow(TypeError);

    expect(() => {
      // @ts-expect-error attempting to mutate imported constant
      nav.NAV_ICON_SIZE = 0;
    }).toThrow(TypeError);

    expect(() => {
      // @ts-expect-error attempting to mutate imported constant
      nav.DEFAULT_PAGINATION_PAGE_NUMBER = '2';
    }).toThrow(TypeError);
  });

  test(async () => {
    expect(Object.prototype.hasOwnProperty.call(nav, 'NAV_TITLE')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(nav, 'SEARCH_PARAM')).toBe(false);
  });

  test('can dynamically import and read constants', async () => {
    const mod = await import('../navigation');
    expect(mod.DEFAULT_TRANSACTION_LIMIT).toBe(30);
    expect(mod.NAV_ICON_SIZE).toBe(24);
    expect(mod.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1');
  });
});
