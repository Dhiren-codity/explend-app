import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { ROUTE, DISABLED_ROUTES } from 'config/constants/routes';

describe('config/constants/routes', () => {
  let originalDisabledRoutes: ROUTE[] = [];

  beforeEach((): void => {
    originalDisabledRoutes = [...DISABLED_ROUTES];
  });

  afterEach((): void => {
    vi.clearAllMocks();
    DISABLED_ROUTES.length = 0;
    for (const value of originalDisabledRoutes) {
      DISABLED_ROUTES.push(value);
    }
  });

  describe('ROUTE enum values', () => {
    test('ROUTE.HOME equals "/"', (): void => {
      const value: ROUTE = ROUTE.HOME;
      expect(value).toBe('/');
    });

    test('ROUTE.SIGNIN equals "/sign-in"', (): void => {
      const value: ROUTE = ROUTE.SIGNIN;
      expect(value).toBe('/sign-in');
    });

    test('ROUTE.MONTHLY_REPORT equals "/monthly-report"', (): void => {
      const value: ROUTE = ROUTE.MONTHLY_REPORT;
      expect(value).toBe('/monthly-report');
    });

    test('ROUTE.CHART equals "/chart"', (): void => {
      const value: ROUTE = ROUTE.CHART;
      expect(value).toBe('/chart');
    });

    test('ROUTE.LIMITS equals "/limits"', (): void => {
      const value: ROUTE = ROUTE.LIMITS;
      expect(value).toBe('/limits');
    });

    test('ROUTE.SUBSCRIPTIONS equals "/subscriptions"', (): void => {
      const value: ROUTE = ROUTE.SUBSCRIPTIONS;
      expect(value).toBe('/subscriptions');
    });

    test('ROUTE.CATEGORIES equals "/categories"', (): void => {
      const value: ROUTE = ROUTE.CATEGORIES;
      expect(value).toBe('/categories');
    });

    test('ROUTE.EXPORT equals "/export"', (): void => {
      const value: ROUTE = ROUTE.EXPORT;
      expect(value).toBe('/export');
    });

    test('ROUTE.SETTINGS equals "/settings"', (): void => {
      const value: ROUTE = ROUTE.SETTINGS;
      expect(value).toBe('/settings');
    });

    test('ROUTE.FEEDBACK equals "/feedback"', (): void => {
      const value: ROUTE = ROUTE.FEEDBACK;
      expect(value).toBe('/feedback');
    });

    test('ROUTE.ISSUE equals "/issue"', (): void => {
      const value: ROUTE = ROUTE.ISSUE;
      expect(value).toBe('/issue');
    });

    test('ROUTE.SITEMAP equals "/sitemap.xml"', (): void => {
      const value: ROUTE = ROUTE.SITEMAP;
      expect(value).toBe('/sitemap.xml');
    });

    test('ROUTE.DISABLED_ROUTE equals "/disabled-route"', (): void => {
      const value: ROUTE = ROUTE.DISABLED_ROUTE;
      expect(value).toBe('/disabled-route');
    });

    test('All ROUTE values are unique and start with "/"', (): void => {
      const values: ROUTE[] = [
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
      for (const v of values) {
        expect(v.startsWith('/')).toBe(true);
      }
    });

    test('Non-enum string is not equal to any ROUTE value', (): void => {
      const notARoute = '/not-a-real-route';
      const values: ROUTE[] = [
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
      expect(values.includes(notARoute as ROUTE)).toBe(false);
    });
  });

  describe('DISABLED_ROUTES', () => {
    test('is an array', (): void => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
    });

    test('initially empty', (): void => {
      expect(DISABLED_ROUTES.length).toBe(0);
      expect(DISABLED_ROUTES).toEqual([]);
    });

    test('can be updated with a valid ROUTE and then restored', (): void => {
      DISABLED_ROUTES.push(ROUTE.DISABLED_ROUTE);
      expect(DISABLED_ROUTES.includes(ROUTE.DISABLED_ROUTE)).toBe(true);
      // afterEach will restore to original snapshot
    });

    test('does not include arbitrary non-route values', (): void => {
      const randomValue = '/arbitrary-non-route';
      expect(DISABLED_ROUTES.includes(randomValue as unknown as ROUTE)).toBe(false);
    });
  });
});
