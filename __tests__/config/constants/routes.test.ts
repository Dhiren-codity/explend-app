import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { ROUTE, DISABLED_ROUTES } from './routes';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

describe('config/constants/routes', () => {
  const allRoutes: string[] = [
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

  describe('ROUTE enum', () => {
    test('should expose exact paths for each route', (): void => {
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

    test('should contain unique values (no duplicates)', (): void => {
      const unique = new Set(allRoutes);
      expect(unique.size).toBe(allRoutes.length);
    });

    test('every route path should start with a "/"', (): void => {
      const allStartWithSlash = allRoutes.every((p: string): boolean => p.startsWith('/'));
      expect(allStartWithSlash).toBe(true);
    });

    test('should not include an unknown path', (): void => {
      const unknownPath = '/unknown-route-not-present';
      expect(allRoutes.includes(unknownPath)).toBe(false);
    });


    afterEach((): void => {
      // cleanup any mutations performed in a test
      if (DISABLED_ROUTES.length !== initialLength) {
        DISABLED_ROUTES.length = initialLength;
      }
      vi.clearAllMocks();
    });

    test('should be an empty array by default', (): void => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
      expect(DISABLED_ROUTES.length).toBe(0);
    });

    test('should allow adding valid ROUTE values', (): void => {
      DISABLED_ROUTES.push(ROUTE.DISABLED_ROUTE);
      DISABLED_ROUTES.push(ROUTE.SITEMAP);

      expect(DISABLED_ROUTES).toContain(ROUTE.DISABLED_ROUTE);
      expect(DISABLED_ROUTES).toContain(ROUTE.SITEMAP);
      expect(DISABLED_ROUTES.length).toBe(initialLength + 2);
    });

    test('should not include arbitrary non-route paths by default', (): void => {
      const nonRoutePath = '/not-a-route';
      expect(DISABLED_ROUTES.includes(nonRoutePath)).toBe(false);
    });

    test('all disabled routes, if any, must be members of known route values', (): void => {
      const allowedSet = new Set(allRoutes);
      const allValid = DISABLED_ROUTES.every((p: string): boolean => allowedSet.has(p));
      expect(allValid).toBe(true);
    });
