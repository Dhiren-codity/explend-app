import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { ROUTE, DISABLED_ROUTES } from "./config/constants/routes";


  afterEach((): void => {
    vi.clearAllMocks();
    // Restore DISABLED_ROUTES to its original contents
    DISABLED_ROUTES.splice(0, DISABLED_ROUTES.length);
    DISABLED_ROUTES.push(...originalDisabledRoutesSnapshot);
  });

  describe("ROUTE enum", () => {
    test("should map all keys to the correct path strings", (): void => {
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

    test('all route values are absolute paths (start with "/")', (): void => {
      const values = getAllRouteValues();
      values.forEach((value) => {
        expect(value.startsWith("/")).toBe(true);
      });

    test("no duplicate route values exist", (): void => {
      const values = getAllRouteValues();
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });

    test("SITEMAP route ends with .xml", (): void => {
      expect(ROUTE.SITEMAP.endsWith(".xml")).toBe(true);
    });

  describe("DISABLED_ROUTES constant", () => {
    test("is an array and initially empty", (): void => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
      expect(DISABLED_ROUTES.length).toBe(0);
      expect(DISABLED_ROUTES).toEqual([]);
    });

    test("can store ROUTE values when mutated", (): void => {
      DISABLED_ROUTES.push(ROUTE.HOME);
      DISABLED_ROUTES.push(ROUTE.SIGNIN);
      expect(DISABLED_ROUTES.includes(ROUTE.HOME)).toBe(true);
      expect(DISABLED_ROUTES.includes(ROUTE.SIGNIN)).toBe(true);

      // Validate the contents against known routes
      const allowed = new Set<string>(getAllRouteValues());
      const allValid = DISABLED_ROUTES.every((r) => allowed.has(r));
      expect(allValid).toBe(true);
    });

    test("unexpected invalid entries can be detected", (): void => {
      const invalid = "/not-defined" as unknown as ROUTE;
      DISABLED_ROUTES.push(invalid);

      const allowed = new Set<string>(getAllRouteValues());
      const allValid = DISABLED_ROUTES.every((r) => allowed.has(r));
      expect(allValid).toBe(false);
    });
