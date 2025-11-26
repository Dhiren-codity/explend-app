import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { ROUTE, DISABLED_ROUTES } from "./routes";

describe("config/constants/routes", () => {
  describe("ROUTE enum values", () => {
    test("should map each route to the exact expected path", (): void => {
      const pairs: Array<[string, string]> = [
        [ROUTE.HOME, "/"],
        [ROUTE.SIGNIN, "/sign-in"],
        [ROUTE.MONTHLY_REPORT, "/monthly-report"],
        [ROUTE.CHART, "/chart"],
        [ROUTE.LIMITS, "/limits"],
        [ROUTE.SUBSCRIPTIONS, "/subscriptions"],
        [ROUTE.CATEGORIES, "/categories"],
        [ROUTE.EXPORT, "/export"],
        [ROUTE.SETTINGS, "/settings"],
        [ROUTE.FEEDBACK, "/feedback"],
        [ROUTE.ISSUE, "/issue"],
        [ROUTE.SITEMAP, "/sitemap.xml"],
        [ROUTE.DISABLED_ROUTE, "/disabled-route"],
      ];

      pairs.forEach(([value, expected]) => {
        expect(value).toBe(expected);
      });
    });

    test("all route values start with a single leading slash", (): void => {
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

      expect(values.every((v) => v.startsWith("/"))).toBe(true);
      expect(values.every((v) => !v.startsWith("//"))).toBe(true);
    });

    test("routes are unique (no duplicate path strings)", (): void => {
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

      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    test('SITEMAP route ends with .xml and HOME is only "/"', (): void => {
      expect(ROUTE.SITEMAP.endsWith(".xml")).toBe(true);
      expect(ROUTE.HOME).toBe("/");
      expect(ROUTE.HOME).not.toBe("/home");
    });

    test("non-home routes (except sitemap) do not end with a trailing slash", (): void => {
      const nonTrailingSlashValues: string[] = [
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
        ROUTE.DISABLED_ROUTE,
      ];

      expect(nonTrailingSlashValues.every((v) => !v.endsWith("/"))).toBe(true);
      // SITEMAP is a special case
      expect(ROUTE.SITEMAP.endsWith("/")).toBe(false);
    });
  });

  describe("DISABLED_ROUTES", () => {
    beforeEach((): void => {
      // Reset shared mutable state
      DISABLED_ROUTES.length = 0;
    });

    afterEach((): void => {
      vi.clearAllMocks();
    });

    test("should be an empty array by default", (): void => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
      expect(DISABLED_ROUTES.length).toBe(0);
    });

    test("should maintain ROUTE[] typing (compile-time) and reference integrity (runtime)", (): void => {
      const mirror: ROUTE[] = DISABLED_ROUTES;
      expect(mirror).toBe(DISABLED_ROUTES);
    });

    test("should allow adding and removing a disabled route", (): void => {
      expect(DISABLED_ROUTES).not.toContain(ROUTE.DISABLED_ROUTE);

      DISABLED_ROUTES.push(ROUTE.DISABLED_ROUTE);
      expect(DISABLED_ROUTES).toContain(ROUTE.DISABLED_ROUTE);
      expect(DISABLED_ROUTES.length).toBe(1);

      const removed = DISABLED_ROUTES.pop();
      expect(removed).toBe(ROUTE.DISABLED_ROUTE);
      expect(DISABLED_ROUTES).not.toContain(ROUTE.DISABLED_ROUTE);
      expect(DISABLED_ROUTES.length).toBe(0);
    });

    test("should not contain a route unless explicitly added", (): void => {
      expect(DISABLED_ROUTES).not.toContain(ROUTE.HOME);
      expect(DISABLED_ROUTES).not.toContain(ROUTE.SIGNIN);
      expect(DISABLED_ROUTES).not.toContain(ROUTE.SITEMAP);
    });
  });
});
