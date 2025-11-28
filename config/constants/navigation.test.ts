import { describe, test, expect } from 'vitest';
import * as navigation from './navigation';

describe('config/constants/navigation', () => {
  test('DEFAULT_TRANSACTION_LIMIT has correct value and type', () => {
    expect(typeof navigation.DEFAULT_TRANSACTION_LIMIT).toBe('number');
    expect(navigation.DEFAULT_TRANSACTION_LIMIT).toBe(30);
    expect(navigation.DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0);
  });

  test('NAV_ICON_SIZE has correct value and type', () => {
    expect(typeof navigation.NAV_ICON_SIZE).toBe('number');
    expect(navigation.NAV_ICON_SIZE).toBe(24);
    expect(navigation.NAV_ICON_SIZE).toBeGreaterThan(0);
  });

  test('DEFAULT_PAGINATION_PAGE_NUMBER has correct value and type', () => {
    expect(typeof navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string');
    expect(navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1');
    expect(Number.parseInt(navigation.DEFAULT_PAGINATION_PAGE_NUMBER, 10)).toBe(1);
  });

  test('const enums are erased at runtime and not exported', () => {
    expect('NAV_TITLE' in navigation).toBe(false);
    expect(navigation.NAV_TITLE).toBeUndefined();

    expect('SEARCH_PARAM' in navigation).toBe(false);
    expect(navigation.SEARCH_PARAM).toBeUndefined();
  });

  test('exported constants are immutable via module namespace object', () => {
    expect(() => {
      // Attempt to reassign should throw in strict mode
      // @ts-ignore - runtime validation in JS
      navigation.DEFAULT_TRANSACTION_LIMIT = 99;
    }).toThrow(TypeError);

    expect(() => {
      // @ts-ignore - runtime validation in JS
      navigation.NAV_ICON_SIZE = 999;
    }).toThrow(TypeError);

    expect(() => {
      // @ts-ignore - runtime validation in JS
      navigation.DEFAULT_PAGINATION_PAGE_NUMBER = '2';
    }).toThrow(TypeError);
  });

  test('module can be dynamically imported and yields same values', async () => {
    const mod = await import('./navigation');
    expect(mod.DEFAULT_TRANSACTION_LIMIT).toBe(navigation.DEFAULT_TRANSACTION_LIMIT);
    expect(mod.NAV_ICON_SIZE).toBe(navigation.NAV_ICON_SIZE);
    expect(mod.DEFAULT_PAGINATION_PAGE_NUMBER).toBe(navigation.DEFAULT_PAGINATION_PAGE_NUMBER);

    expect('NAV_TITLE' in mod).toBe(false);
    expect(mod.NAV_TITLE).toBeUndefined();

    expect('SEARCH_PARAM' in mod).toBe(false);
    expect(mod.SEARCH_PARAM).toBeUndefined();
  });
});
