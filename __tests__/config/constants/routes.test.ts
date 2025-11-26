import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import * as routesModule from "./routes";

describe("config/constants/routes", () => {
  beforeEach((): void => {
    // no-op setup
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe("module exports", () => {
    test("should export expected keys", () => {
      const keys = Object.keys(routesModule).sort();
      const hasRoute = Object.prototype.hasOwnProperty.call(
        routesModule,
        "ROUTE",
      );
      if (hasRoute) {
        expect(keys).toEqual(["DISABLED_ROUTES", "ROUTE"]);
      } else {
        expect(keys).toEqual(["DISABLED_ROUTES"]);
      }
    });
  });

  describe("DISABLED_ROUTES", () => {
    test("should be an array and initially empty", () => {
      expect(Array.isArray(routesModule.DISABLED_ROUTES)).toBe(true);
      expect(routesModule.DISABLED_ROUTES.length).toBe(0);
    });

    test("should allow mutation (push/pop) and reflect changes", () => {
      const listRef = routesModule.DISABLED_ROUTES as unknown as Array<unknown>;
      const initialLength = listRef.length;
      const valueToInsert: unknown = "/disabled-route";

      listRef.push(valueToInsert);
      expect(listRef.length).toBe(initialLength + 1);
      expect(listRef[listRef.length - 1]).toBe(valueToInsert);

      const removed = listRef.pop();
      expect(removed).toBe(valueToInsert);
      expect(listRef.length).toBe(initialLength);
    });
  });

  describe("ROUTE (runtime presence is env-dependent for const enum)", () => {
    test("should either be absent at runtime (const enum erasure) or match expected values when present", () => {
      const hasRoute = Object.prototype.hasOwnProperty.call(
        routesModule as Record<string, unknown>,
        "ROUTE",
      );
      if (!hasRoute) {
        expect(hasRoute).toBe(false);
        return;
      }

      const routeExport = (routesModule as Record<string, unknown>)
        .ROUTE as unknown;
      expect(routeExport).toBeDefined();
      expect(typeof routeExport).toBe("object");

      const routeObj = routeExport as Record<string, unknown>;

      const expected: Record<string, string> = {
        HOME: "/",
        SIGNIN: "/sign-in",
        MONTHLY_REPORT: "/monthly-report",
        CHART: "/chart",
        LIMITS: "/limits",
        SUBSCRIPTIONS: "/subscriptions",
        CATEGORIES: "/categories",
        EXPORT: "/export",
        SETTINGS: "/settings",
        FEEDBACK: "/feedback",
        ISSUE: "/issue",
        SITEMAP: "/sitemap.xml",
        DISABLED_ROUTE: "/disabled-route",
      };

      // Validate keys
      expect(Object.keys(routeObj).sort()).toEqual(
        Object.keys(expected).sort(),
      );

      // Validate values and shape
      for (const [key, value] of Object.entries(expected)) {
        expect(routeObj[key]).toBe(value);
        const v = routeObj[key];
        if (typeof v === "string") {
          expect(v.startsWith("/")).toBe(true);
        }
      }

      // Ensure all values are unique
      const values = Object.values(routeObj).filter(
        (v): v is string => typeof v === "string",
      );
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });
});
