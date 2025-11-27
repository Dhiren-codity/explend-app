import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { ROUTE, DISABLED_ROUTES } from './routes';

vi.mock('node:path', () => ({
  join: vi.fn((_a: unknown, _b: unknown): string => 'mocked-path'),
  resolve: vi.fn((_p: unknown): string => '/resolved'),
}));

describe('config/constants/routes', () => {
  beforeEach((): void => {});

  afterEach((): void => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('ROUTE', () => {
    test('should map each enum member to its correct path', (): void => {
      expect(ROUTE.HOME).toBe('/');
      expect(ROUTE.SIGNIN).toBe('/sign-in');
      expect(ROUTE.MONTHLY_REPORT).toBe('/monthly-report');
      expect(ROUTE.CHART).toBe('/chart');
      expect(ROUTE.LIMITS).toBe('/limits');
      expect(ROUTE.SUBSCRIPTIONS).toBe('/subscriptions');
      expect(ROUTE.CATEGORIES).toBe('/categories');
      expect(ROUTE.EXPORT).toBe('/export');
      expect(ROUTE.SETTINGS).toBe('/settings');
      expect(ROUTE.FEEDBACK).toBe('/feedback');
      expect(ROUTE.ISSUE).toBe('/issue');
      expect(ROUTE.SITEMAP).toBe('/sitemap.xml');
      expect(ROUTE.DISABLED_ROUTE).toBe('/disabled-route');
    });

    test('all exported route values should be unique and start with "/"', (): void => {
      const values: string[] = [
        ROUTE.HOME,
        ROUTE.SIGNIN,
        ROUTE.MONTHLY_REPORT,
        ROUTE.CHART,
        ROUTE.LIMITS,
        ROUTE.SUBSCRIPTIONS,
        ROUTE.CATEGORIES,
        ROUTE.EXPORT,
        ROUTE.SETTINGS,
        ROUTE.FEEDBACK,
        ROUTE.ISSUE,
        ROUTE.SITEMAP,
        ROUTE.DISABLED_ROUTE,
      ];
      const set = new Set(values);
      expect(set.size).toBe(values.length);
      values.forEach((v: string) => {
        expect(v.startsWith('/')).toBe(true);
      });
    });

    test('type-safety: does not allow arbitrary strings to be assigned to ROUTE (compile-time)', (): void => {
      // @ts-expect-error - invalid assignment should be rejected by TS
      const invalid: ROUTE = '/not-a-valid-route';
      expect(typeof invalid).toBe('string');
    });
  });

  describe('DISABLED_ROUTES', () => {
    test('should be an array and be empty by default', (): void => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
      expect(DISABLED_ROUTES).toHaveLength(0);
    });

    test('if populated, values must belong to ROUTE enum set', (): void => {
      const allowed: string[] = [
        ROUTE.HOME,
        ROUTE.SIGNIN,
        ROUTE.MONTHLY_REPORT,
        ROUTE.CHART,
        ROUTE.LIMITS,
        ROUTE.SUBSCRIPTIONS,
        ROUTE.CATEGORIES,
        ROUTE.EXPORT,
        ROUTE.SETTINGS,
        ROUTE.FEEDBACK,
        ROUTE.ISSUE,
        ROUTE.SITEMAP,
        ROUTE.DISABLED_ROUTE,
      ];
      const allowedSet = new Set<string>(allowed);
      DISABLED_ROUTES.forEach((r: ROUTE) => {
        expect(allowedSet.has(r)).toBe(true);
      });
    });

    test('type-safety: array should only accept ROUTE values (compile-time)', (): void => {
      const copy: ROUTE[] = [];
      copy.push(ROUTE.HOME);
      // @ts-expect-error - pushing a non-ROUTE string should be rejected by TS
      copy.push('/invalid');
      expect(copy.includes(ROUTE.HOME)).toBe(true);
    });
  });
});