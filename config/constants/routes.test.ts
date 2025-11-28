import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { ROUTE, DISABLED_ROUTES } from './routes';

describe('config/constants/routes', () => {
  beforeEach((): void => {
    // no-op setup
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe('ROUTE const enum', () => {
    test('should have correct path mappings', (): void => {
      const home: ROUTE = ROUTE.HOME;
      const signin: ROUTE = ROUTE.SIGNIN;
      const monthlyReport: ROUTE = ROUTE.MONTHLY_REPORT;
      const chart: ROUTE = ROUTE.CHART;
      const limits: ROUTE = ROUTE.LIMITS;
      const subscriptions: ROUTE = ROUTE.SUBSCRIPTIONS;
      const categories: ROUTE = ROUTE.CATEGORIES;
      const exportRoute: ROUTE = ROUTE.EXPORT;
      const settings: ROUTE = ROUTE.SETTINGS;
      const feedback: ROUTE = ROUTE.FEEDBACK;
      const issue: ROUTE = ROUTE.ISSUE;
      const sitemap: ROUTE = ROUTE.SITEMAP;
      const disabled: ROUTE = ROUTE.DISABLED_ROUTE;

      expect(home).toBe('/');
      expect(signin).toBe('/sign-in');
      expect(monthlyReport).toBe('/monthly-report');
      expect(chart).toBe('/chart');
      expect(limits).toBe('/limits');
      expect(subscriptions).toBe('/subscriptions');
      expect(categories).toBe('/categories');
      expect(exportRoute).toBe('/export');
      expect(settings).toBe('/settings');
      expect(feedback).toBe('/feedback');
      expect(issue).toBe('/issue');
      expect(sitemap).toBe('/sitemap.xml');
      expect(disabled).toBe('/disabled-route');
    });

    test('all routes should start with a slash and be unique', (): void => {
      const allRoutes: ROUTE[] = [
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

      const allStartWithSlash: boolean = allRoutes.every((path: ROUTE): boolean => path.startsWith('/'));
      expect(allStartWithSlash).toBe(true);

      const uniqueCount: number = new Set(allRoutes).size;
      expect(uniqueCount).toBe(allRoutes.length);
    });

    test('sitemap should have .xml extension', (): void => {
      const sitemap: ROUTE = ROUTE.SITEMAP;
      expect(sitemap.endsWith('.xml')).toBe(true);
    });
  });

  describe('DISABLED_ROUTES', () => {
    test('should be an empty array by default', (): void => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
      expect(DISABLED_ROUTES).toHaveLength(0);
    });

    test('should contain only values from ROUTE', (): void => {
      const allowed: Set<string> = new Set<string>([
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
      ]);

      const allValid: boolean = DISABLED_ROUTES.every((p: ROUTE): boolean => allowed.has(p));
      expect(allValid).toBe(true);
    });
  });
});
