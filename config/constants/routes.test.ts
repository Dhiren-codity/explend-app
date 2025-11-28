import { describe, test, expect } from 'vitest';
import { DISABLED_ROUTES } from 'config/constants/routes';

describe('config/constants/routes', () => {
  const knownRoutes = [
    '/',
    '/sign-in',
    '/monthly-report',
    '/chart',
    '/limits',
    '/subscriptions',
    '/categories',
    '/export',
    '/settings',
    '/feedback',
    '/issue',
    '/sitemap.xml',
    '/disabled-route',
  ];

  test('DISABLED_ROUTES is an empty array', () => {
    expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
    expect(DISABLED_ROUTES).toHaveLength(0);
  });

  test('DISABLED_ROUTES contains only known routes (if any)', () => {
    for (const route of DISABLED_ROUTES) {
      expect(knownRoutes).toContain(route);
    }
  });

  test('DISABLED_ROUTES has no duplicates', () => {
    const set = new Set(DISABLED_ROUTES);
    expect(set.size).toBe(DISABLED_ROUTES.length);
  });

  test('ROUTE is not exported at runtime (const enum is erased)', async () => {
    const mod = await import('config/constants/routes');
    expect('ROUTE' in mod).toBe(false);
    expect(mod.ROUTE).toBeUndefined();
  });
});
