import { describe, test, expect, vi } from 'vitest';
import * as Navigation from './navigation';

describe('config/constants/navigation', () => {
  test('DEFAULT_TRANSACTION_LIMIT equals 30 and is a number', () => {
    expect(Navigation.DEFAULT_TRANSACTION_LIMIT).toBe(30);
    expect(typeof Navigation.DEFAULT_TRANSACTION_LIMIT).toBe('number');
  });

  test('NAV_ICON_SIZE equals 24 and is a number', () => {
    expect(Navigation.NAV_ICON_SIZE).toBe(24);
    expect(typeof Navigation.NAV_ICON_SIZE).toBe('number');
  });

  test('DEFAULT_PAGINATION_PAGE_NUMBER equals "1" and is a string', () => {
    expect(Navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1');
    expect(typeof Navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string');
  });

  test('does not export const enums at runtime', () => {
    expect('NAV_TITLE' in Navigation).toBe(false);
    expect('SEARCH_PARAM' in Navigation).toBe(false);
    expect(Navigation.NAV_TITLE).toBeUndefined();
    expect(Navigation.SEARCH_PARAM).toBeUndefined();
  });

  test('accessing NAV_TITLE.HOME throws at runtime because const enums are erased', () => {
    expect(() => {
      // @ts-expect-error - NAV_TITLE is erased at runtime when using const enum
      // Accessing a property on undefined should throw
      // eslint-disable-next-line no-unused-vars
      const _ = Navigation.NAV_TITLE.HOME;
    }).toThrow(TypeError);
  });

  test('can import the module asynchronously and read constants', async () => {
    const mod = await import('./navigation');
    expect(mod.DEFAULT_TRANSACTION_LIMIT).toBe(30);
    expect(mod.NAV_ICON_SIZE).toBe(24);
    expect(mod.DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1');
  });
});
