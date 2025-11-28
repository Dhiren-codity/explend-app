import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { ROUTE, DISABLED_ROUTES } from './routes';

describe('config/constants/routes', () => {
  beforeEach((): void => {
    // Ensure clean slate for each test
  });

  afterEach((): void => {
    // Cleanup mutations to shared exported array and reset mocks
    DISABLED_ROUTES.length = 0;
    vi.clearAllMocks();
  });

  describe('ROUTE const enum', () => {
    test('should have exact literal values for all routes', (): void => {
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

    test('all route values should start with "/" and be unique', (): void => {
      const allValues: string[] = [
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
      // Starts with slash
      allValues.forEach((path: string) => {
        expect(path.startsWith('/')).toBe(true);
      });
      // Uniqueness
      const uniqueCount = new Set(allValues).size;
      expect(uniqueCount).toBe(allValues.length);
    });

    test('sitemap route should end with .xml', (): void => {
      expect(ROUTE.SITEMAP.endsWith('.xml')).toBe(true);
    });
  });

  describe('DISABLED_ROUTES constant', () => {
    test('should be an array and initially empty', (): void => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
      expect(DISABLED_ROUTES.length).toBe(0);
    });

    test('should allow adding legitimate ROUTE values', (): void => {
      DISABLED_ROUTES.push(ROUTE.DISABLED_ROUTE);
      expect(DISABLED_ROUTES.includes(ROUTE.DISABLED_ROUTE)).toBe(true);
      expect(DISABLED_ROUTES.length).toBe(1);
    });

    test('should not contain values by default other than what tests add', (): void => {
      expect(DISABLED_ROUTES).toEqual([]);
    });
  });
});
