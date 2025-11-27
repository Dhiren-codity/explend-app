import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { ROUTE, DISABLED_ROUTES } from './config/constants/routes';

describe('Tests', (): void => {

  describe('config/constants/routes', (): void => {
      // No setup required for constants
    });

      // Ensure any mutations to the exported array are cleaned up
      DISABLED_ROUTES.length = 0;
      vi.clearAllMocks();
    });

    describe('ROUTE const enum', (): void => {
      test('should map each route to the correct path', (): void => {
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
      test('should have unique values and start with "/" (root allowed)', (): void => {
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

        const unique = new Set(values);
        expect(unique.size).toBe(values.length);

        for (const value of values) {
          expect(value.startsWith('/')).toBe(true);
        }
      });
      test('should not have trailing slash for non-root paths', (): void => {
        const nonRootValues: string[] = [
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

        for (const value of nonRootValues) {
          expect(value.endsWith('/')).toBe(false);
        }

        expect(ROUTE.HOME).toBe('/');
      });
      test('should be an empty array by default', (): void => {
        expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
        expect(DISABLED_ROUTES).toHaveLength(0);
      });
      test('should allow adding valid ROUTE values', (): void => {
        DISABLED_ROUTES.push(ROUTE.DISABLED_ROUTE);
        expect(DISABLED_ROUTES).toEqual([ROUTE.DISABLED_ROUTE]);

        DISABLED_ROUTES.push(ROUTE.SIGNIN);
        expect(DISABLED_ROUTES).toEqual([ROUTE.DISABLED_ROUTE, ROUTE.SIGNIN]);
      });
      test('should preserve order and allow duplicates', (): void => {
        DISABLED_ROUTES.push(ROUTE.HOME);
        DISABLED_ROUTES.push(ROUTE.HOME);
        expect(DISABLED_ROUTES).toEqual([ROUTE.HOME, ROUTE.HOME]);
      });
      test('cleanup should reset mutations between tests', (): void => {
        // This test relies on afterEach to clear mutations,
        // so the array should be empty at the start of the test.
        expect(DISABLED_ROUTES).toHaveLength(0);
      });