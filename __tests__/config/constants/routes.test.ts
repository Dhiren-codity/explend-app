import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { ROUTE, DISABLED_ROUTES } from "./routes";

describe("config/constants/routes", () => {
  beforeEach((): void => {
    // no-op setup
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe("ROUTE enum", () => {
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

    test("should have expected string values for each route", (): void => {
      expect(ROUTE.HOME).toBe("/");
      expect(ROUTE.SIGNIN).toBe("/sign-in");
      expect(ROUTE.MONTHLY_REPORT).toBe("/monthly-report");
      expect(ROUTE.CHART).toBe("/chart");
      expect(ROUTE.LIMITS).toBe("/limits");
      expect(ROUTE.SUBSCRIPTIONS).toBe("/subscriptions");
      expect(ROUTE.CATEGORIES).toBe("/categories");
      expect(ROUTE.EXPORT).toBe("/export");
      expect(ROUTE.SETTINGS).toBe("/settings");
      expect(ROUTE.FEEDBACK).toBe("/feedback");
      expect(ROUTE.ISSUE).toBe("/issue");
      expect(ROUTE.SITEMAP).toBe("/sitemap.xml");
      expect(ROUTE.DISABLED_ROUTE).toBe("/disabled-route");
    });

    test("all routes should start with a slash", (): void => {
      for (const value of routeValues) {
        expect(value.startsWith("/")).toBe(true);
      }
    });

    test("routes should be unique (no duplicates)", (): void => {
      const unique = new Set(routeValues);
      expect(unique.size).toBe(routeValues.length);
    });

    test("sitemap route should end with .xml", (): void => {
      expect(ROUTE.SITEMAP.endsWith(".xml")).toBe(true);
    });

    test("non-existent route should not be included", (): void => {
      expect(routeValues.includes("/non-existent")).toBe(false);
    });
  });

  describe("DISABLED_ROUTES", () => {
    test("should be an empty array by default", (): void => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
      expect(DISABLED_ROUTES).toEqual([]);
      expect(DISABLED_ROUTES.length).toBe(0);
    });

    test("should not include DISABLED_ROUTE by default", (): void => {
      expect(DISABLED_ROUTES.includes(ROUTE.DISABLED_ROUTE)).toBe(false);
    });

    test("each disabled route, if present, should be a valid ROUTE value", (): void => {
      const validRoutes: Set<string> = new Set([
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
      for (const value of DISABLED_ROUTES) {
        expect(validRoutes.has(value)).toBe(true);
      }
    });
  });
});
