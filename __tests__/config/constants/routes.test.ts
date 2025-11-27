import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { ROUTE, DISABLED_ROUTES } from "./routes";


  describe("ROUTE enum", () => {
    test("should map route constants to correct paths", (): void => {
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
    test("should be an array and default to empty", (): void => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
      expect(DISABLED_ROUTES).toEqual([]);
      expect(DISABLED_ROUTES.length).toBe(0);
    });
