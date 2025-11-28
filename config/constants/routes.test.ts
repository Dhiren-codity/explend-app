import { describe, test, expect, vi } from 'vitest';

describe('config/constants/routes.ts', () => {
  test('exports DISABLED_ROUTES as an array and it is empty (happy path)', async () => {
    vi.unmock('./routes');
    vi.resetModules();
    const mod = await import('./routes');
    expect(Object.prototype.hasOwnProperty.call(mod, 'DISABLED_ROUTES')).toBe(true);
    const { DISABLED_ROUTES } = mod;
    expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
    expect(DISABLED_ROUTES.length).toBe(0);
  });

  test('validates values of DISABLED_ROUTES would be valid route strings if present', async () => {
    vi.unmock('./routes');
    vi.resetModules();
    const { DISABLED_ROUTES } = await import('./routes');
    for (const value of DISABLED_ROUTES) {
      expect(typeof value).toBe('string');
      expect(value.startsWith('/')).toBe(true);
    }
  });

  test('error when DISABLED_ROUTES export is invalid (error path via mock)', async () => {
    vi.resetModules();
    vi.mock('./routes', () => ({
      DISABLED_ROUTES: [null, 123, 'noSlash'],
    }));
    const mod = await import('./routes');
    const { DISABLED_ROUTES } = mod;

    const validate = (arr) => {
      if (!Array.isArray(arr)) {
        throw new Error('DISABLED_ROUTES must be an array');
      }
      for (const value of arr) {
        if (typeof value !== 'string' || !value.startsWith('/')) {
          throw new Error('Invalid route in DISABLED_ROUTES');
        }
      }
    };

    expect(() => validate(DISABLED_ROUTES)).toThrowError();
  });

  test('ROUTE const enum is not present at runtime (erased by TS)', async () => {
    vi.unmock('./routes');
    vi.resetModules();
    const mod = await import('./routes');
    expect('ROUTE' in mod).toBe(false);
    expect(mod.ROUTE).toBeUndefined();
  });
});
