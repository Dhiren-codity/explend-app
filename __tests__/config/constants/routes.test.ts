import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { ROUTE, DISABLED_ROUTES } from './routes';

vi.mock('node:path', () => ({
  join: vi.fn((_a: unknown, _b: unknown): string => `${String(_a)}/${String(_b)}`),
  resolve: vi.fn((_p: unknown): string => String(_p)),
}));


  afterEach((): void => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('ROUTE enum values', () => {
    test('should map enum members to expected paths', (): void => {
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

    test('should not map to incorrect paths (negative cases)', (): void => {
      expect(ROUTE.HOME).not.toBe('/home');
      expect(ROUTE.SIGNIN).not.toBe('/signin');
      expect(ROUTE.SITEMAP).not.toBe('/sitemap');
      expect(ROUTE.DISABLED_ROUTE).not.toBe('/disabled');
    });

    test('all route values should start with "/" and generally not end with "/" (except root)', (): void => {
      const routeValues: string[] = [
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

      for (const val of routeValues) {
        expect(val.startsWith('/')).toBe(true);
      }

      for (const val of routeValues) {
        if (val !== '/') {
          expect(val.endsWith('/')).toBe(false);
        }

    test('should not contain duplicate route strings', (): void => {
      const routeValues: string[] = [
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

      const unique = new Set(routeValues);
      expect(unique.size).toBe(routeValues.length);
    });

    test('should not include arbitrary non-existent routes', (): void => {
      const routeValues: string[] = [
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
      expect(routeValues.includes('/non-existent')).toBe(false);
    });

  describe('DISABLED_ROUTES constant', () => {
    test('should be an empty array initially', (): void => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
      expect(DISABLED_ROUTES.length).toBe(0);
    });

    test('should conform to ROUTE[] type at compile-time and be pass-through at runtime', (): void => {
      const useRoutes = (routes: ROUTE[]): ROUTE[] => routes;
      const result = useRoutes(DISABLED_ROUTES);
      expect(result).toBe(DISABLED_ROUTES);
      expect(result.length).toBe(0);
    });
