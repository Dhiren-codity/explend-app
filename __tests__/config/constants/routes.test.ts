import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { ROUTE, DISABLED_ROUTES } from './routes';

describe('config/constants/routes', () => {
  beforeEach((): void => {
    // No setup required for constants
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe('ROUTE enum', () => {
    test('should have correct HOME route', (): void => {
      expect(ROUTE.HOME).toBe('/');
    });

    test('should have correct SIGNIN route', (): void => {
      expect(ROUTE.SIGNIN).toBe('/sign-in');
    });

    test('should have correct MONTHLY_REPORT route', (): void => {
      expect(ROUTE.MONTHLY_REPORT).toBe('/monthly-report');
    });

    test('should have correct CHART route', (): void => {
      expect(ROUTE.CHART).toBe('/chart');
    });

    test('should have correct LIMITS route', (): void => {
      expect(ROUTE.LIMITS).toBe('/limits');
    });

    test('should have correct SUBSCRIPTIONS route', (): void => {
      expect(ROUTE.SUBSCRIPTIONS).toBe('/subscriptions');
    });

    test('should have correct CATEGORIES route', (): void => {
      expect(ROUTE.CATEGORIES).toBe('/categories');
    });

    test('should have correct EXPORT route', (): void => {
      expect(ROUTE.EXPORT).toBe('/export');
    });

    test('should have correct SETTINGS route', (): void => {
      expect(ROUTE.SETTINGS).toBe('/settings');
    });

    test('should have correct FEEDBACK route', (): void => {
      expect(ROUTE.FEEDBACK).toBe('/feedback');
    });

    test('should have correct ISSUE route', (): void => {
      expect(ROUTE.ISSUE).toBe('/issue');
    });

    test('should have correct SITEMAP route', (): void => {
      expect(ROUTE.SITEMAP).toBe('/sitemap.xml');
    });

    test('should have correct DISABLED_ROUTE route', (): void => {
      expect(ROUTE.DISABLED_ROUTE).toBe('/disabled-route');
    });

    test('should not have extra keys', (): void => {
      const routeKeys = Object.keys(ROUTE);
      expect(routeKeys.sort()).toEqual([
        'HOME',
        'SIGNIN',
        'MONTHLY_REPORT',
        'CHART',
        'LIMITS',
        'SUBSCRIPTIONS',
        'CATEGORIES',
        'EXPORT',
        'SETTINGS',
        'FEEDBACK',
        'ISSUE',
        'SITEMAP',
        'DISABLED_ROUTE'
      ].sort());
    });
  });

  describe('DISABLED_ROUTES', () => {
    test('should be an array', (): void => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
    });

    test('should be empty by default', (): void => {
      expect(DISABLED_ROUTES.length).toBe(0);
    });

    test('should allow adding ROUTE values', (): void => {
      // This test is only for type safety demonstration, not mutating the actual export
      const testArray: typeof DISABLED_ROUTES = [
        ROUTE.DISABLED_ROUTE,
        ROUTE.SIGNIN
      ];
      expect(testArray).toContain(ROUTE.DISABLED_ROUTE);
      expect(testArray).toContain(ROUTE.SIGNIN);
    });
  });
});