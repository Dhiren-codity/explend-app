import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { ROUTE, DISABLED_ROUTES } from "./config/constants/routes";

vi.mock(
  "node:path",
  (): Record<string, unknown> => ({
    sep: "/",
    join: vi.fn((...parts: string[]): string => parts.join("/")),
  }),
);

describe("config/constants/routes", (): void => {
  beforeEach((): void => {
    // No setup required for constants
  });

  afterEach((): void => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("ROUTE enum", (): void => {
    test("should map each key to the correct path", (): void => {
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

    test("should only contain unique paths", (): void => {
      const allRoutes: readonly ROUTE[] = [
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
      ] as const;

      const routeSet = new Set<ROUTE>(allRoutes);
      expect(routeSet.size).toBe(allRoutes.length);
    });

    test("all route paths should begin with a forward slash", (): void => {
      const allRoutes: readonly ROUTE[] = [
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
      ] as const;

      const allStartWithSlash = allRoutes.every((p: ROUTE): boolean =>
        p.startsWith("/"),
      );
      expect(allStartWithSlash).toBe(true);
    });

    test("no route (except root) should end with a trailing slash", (): void => {
      const allRoutes: readonly ROUTE[] = [
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
      ] as const;

      const withTrailingSlash = allRoutes.filter(
        (p: ROUTE): boolean => p.length > 1 && p.endsWith("/"),
      );
      expect(withTrailingSlash).toEqual([]);
    });

    test("no route should include a protocol (e.g., http://)", (): void => {
      const allRoutes: readonly ROUTE[] = [
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
      ] as const;

      const hasProtocol = allRoutes.some((p: ROUTE): boolean =>
        p.includes("://"),
      );
      expect(hasProtocol).toBe(false);
    });

    test("should contain xml route for sitemap", (): void => {
      expect(ROUTE.SITEMAP.endsWith(".xml")).toBe(true);
      expect(ROUTE.SITEMAP).toBe("/sitemap.xml");
    });
  });

  describe("DISABLED_ROUTES", (): void => {
    test("should be an empty array by default", (): void => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
      expect(DISABLED_ROUTES.length).toBe(0);
    });

    test("should not include DISABLED_ROUTE unless explicitly configured", (): void => {
      expect(DISABLED_ROUTES.includes(ROUTE.DISABLED_ROUTE)).toBe(false);
    });

    test("should only contain valid ROUTE values when populated", (): void => {
      const allRoutes: readonly ROUTE[] = [
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
      ] as const;

      const allowed = new Set<ROUTE>(allRoutes);
      const invalid = DISABLED_ROUTES.filter(
        (p: ROUTE): boolean => !allowed.has(p),
      );
      expect(invalid).toEqual([]);
    });

    test("mutating a copy does not affect the original export", (): void => {
      const copy: ROUTE[] = [...DISABLED_ROUTES];
      copy.push(ROUTE.HOME);
      expect(copy.length).toBe(1);
      expect(DISABLED_ROUTES.length).toBe(0);
    });
  });
});
