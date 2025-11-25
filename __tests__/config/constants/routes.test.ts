import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { ROUTE, DISABLED_ROUTES } from "./routes";

vi.mock("node:path", () => ({
  basename: vi.fn((p: string): string => p.split("/").pop() ?? ""),
  join: vi.fn((...parts: string[]): string => parts.join("/")),
}));

const allRouteValues: readonly string[] = [
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

describe("config/constants/routes", () => {
  beforeEach((): void => {
    vi.restoreAllMocks();
    // Ensure a clean slate for mutable exported array
    DISABLED_ROUTES.length = 0;
  });

  afterEach((): void => {
    // Cleanup and reset any mutations to shared state and mocks
    DISABLED_ROUTES.length = 0;
    vi.clearAllMocks();
  });

  describe("ROUTE const enum", () => {
    test("should resolve to correct literal paths", (): void => {
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

    test("should contain unique, absolute paths", (): void => {
      const set = new Set(allRouteValues);
      expect(set.size).toBe(allRouteValues.length);
      const allStartWithSlash = allRouteValues.every((p) => p.startsWith("/"));
      expect(allStartWithSlash).toBe(true);
    });

    test("should not contain trailing slashes (except root and sitemap with extension)", (): void => {
      const nonRootAndNonFileRoutes = allRouteValues.filter(
        (p) => p !== "/" && !p.endsWith(".xml"),
      );
      const noneEndsWithSlash = nonRootAndNonFileRoutes.every(
        (p) => !p.endsWith("/"),
      );
      expect(noneEndsWithSlash).toBe(true);
    });

      expect(() => assertIsRoute(ROUTE.CHART)).not.toThrow();
      expect(() => assertIsRoute("/no-such-route")).toThrow(TypeError);
    });
  });

  describe("DISABLED_ROUTES", () => {
    test("should be an empty array by default", (): void => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
      expect(DISABLED_ROUTES).toEqual([]);
      expect(DISABLED_ROUTES.length).toBe(0);
    });

    test("should allow adding valid routes and reflect mutations", (): void => {
      const ref = DISABLED_ROUTES;
      DISABLED_ROUTES.push(ROUTE.CHART);
      DISABLED_ROUTES.push(ROUTE.LIMITS);

      expect(DISABLED_ROUTES).toContain(ROUTE.CHART);
      expect(DISABLED_ROUTES).toContain(ROUTE.LIMITS);
      expect(ref).toBe(DISABLED_ROUTES);
      expect(ref.length).toBe(2);
    });

    test("should be clean after each test", (): void => {
      expect(DISABLED_ROUTES.length).toBe(0);
    });
  });
});
