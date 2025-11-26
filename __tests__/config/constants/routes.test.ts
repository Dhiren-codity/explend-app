import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { ROUTE, DISABLED_ROUTES } from "./config/constants/routes";

vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));


  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe("ROUTE enum", () => {
    test(async () => {
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

    test(async () => {
      const values = [
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

      values.forEach((routeValue) => {
        expect(routeValue.startsWith("/")).toBe(true);
        if (routeValue !== ROUTE.HOME) {
          expect(routeValue.endsWith("/")).toBe(false);
        } else {
          expect(routeValue).toBe("/");
        }

  describe("DISABLED_ROUTES", () => {
    test(async () => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
      expect(DISABLED_ROUTES.length).toBe(0);
    });

    test("should only contain valid ROUTE values when mutated and should reset on module reload", async () => {
      vi.resetModules();

      const mod1 = await import("./config/constants/routes");
      expect(Array.isArray(mod1.DISABLED_ROUTES)).toBe(true);
      expect(mod1.DISABLED_ROUTES.length).toBe(0);

      mod1.DISABLED_ROUTES.push(ROUTE.SIGNIN, ROUTE.EXPORT);

      const allowedValues = new Set<string>([
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
      expect(mod1.DISABLED_ROUTES.every((r) => allowedValues.has(r))).toBe(
        true,
      );

      // Negative check: detect an invalid addition at runtime
      const invalidRoute = "/not-a-real-route" as unknown as typeof ROUTE.HOME;
      mod1.DISABLED_ROUTES.push(invalidRoute);
      expect(
        mod1.DISABLED_ROUTES.some((r) => !allowedValues.has(r as string)),
      ).toBe(true);

      vi.resetModules();
      const mod2 = await import("./config/constants/routes");
      expect(mod2.DISABLED_ROUTES.length).toBe(0);
    });
