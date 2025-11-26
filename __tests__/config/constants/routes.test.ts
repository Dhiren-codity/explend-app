import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { ROUTE, DISABLED_ROUTES } from "./config/constants/routes";

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


  afterEach((): void => {
    // Cleanup any mutations to the exported array
    while (DISABLED_ROUTES.length > 0) {
      DISABLED_ROUTES.pop();
    }
    vi.clearAllMocks();
  });

  describe("ROUTE enum", (): void => {
    test("should expose correct literal values", (): void => {
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

    test("should include exactly the expected number of unique routes", (): void => {
      const unique = new Set(allRoutes);
      expect(allRoutes.length).toBe(13);
      expect(unique.size).toBe(allRoutes.length);
    });

    test('should all start with a "/" prefix', (): void => {
      allRoutes.forEach((path: string): void => {
        expect(path.startsWith("/")).toBe(true);
      });

    test('should not end with "/" except the root path', (): void => {
      const withoutRoot: string[] = allRoutes.filter(
        (p: string): boolean => p !== ROUTE.HOME,
      );
      withoutRoot.forEach((path: string): void => {
        expect(path.endsWith("/")).toBe(false);
      });
      expect(ROUTE.HOME).toBe("/");
    });

    test("sitemap route should have .xml extension", (): void => {
      expect(ROUTE.SITEMAP.endsWith(".xml")).toBe(true);
    });

    test("should not contain whitespace in any route", (): void => {
      allRoutes.forEach((path: string): void => {
        expect(path.includes(" ")).toBe(false);
      });

  describe("DISABLED_ROUTES", (): void => {
    test("should be an array and initially empty", (): void => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
      expect(DISABLED_ROUTES.length).toBe(0);
    });

    test("should accept ROUTE values and allow mutation", (): void => {
      DISABLED_ROUTES.push(ROUTE.SIGNIN);
      expect(DISABLED_ROUTES.length).toBe(1);
      expect(DISABLED_ROUTES[0]).toBe(ROUTE.SIGNIN);

      // Remove and confirm array is updated
      DISABLED_ROUTES.pop();
      expect(DISABLED_ROUTES.length).toBe(0);
    });

    test("should only contain defined ROUTE values when used correctly", (): void => {
      DISABLED_ROUTES.push(ROUTE.EXPORT, ROUTE.SETTINGS, ROUTE.FEEDBACK);

      const allowed = new Set(allRoutes);
      const allValid: boolean = DISABLED_ROUTES.every((r: string): boolean =>
        allowed.has(r),
      );
      expect(allValid).toBe(true);
    });

    test("should detect invalid entries if accidentally inserted at runtime", (): void => {
      const invalidRoute = "/not-a-real-route" as unknown as ROUTE;
      DISABLED_ROUTES.push(invalidRoute);

      const allowed = new Set(allRoutes);
      const allValid: boolean = DISABLED_ROUTES.every((r: string): boolean =>
        allowed.has(r),
      );
      expect(allValid).toBe(false);
    });
