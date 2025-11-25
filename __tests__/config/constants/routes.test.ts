import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { ROUTE, DISABLED_ROUTES } from "./config/constants/routes";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

describe("config/constants/routes", () => {
  let originalDisabledRoutes: ROUTE[];

  beforeEach((): void => {
    originalDisabledRoutes = [...DISABLED_ROUTES];
  });

  afterEach((): void => {
    vi.clearAllMocks();
    DISABLED_ROUTES.splice(
      0,
      DISABLED_ROUTES.length,
      ...originalDisabledRoutes,
    );
  });

  describe("ROUTE enum", () => {
    test("should map enum members to exact path strings", (): void => {
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

    test("should have unique route paths", (): void => {
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
      const unique = new Set(routeValues);
      expect(unique.size).toBe(routeValues.length);
    });

    test("all paths should start with a forward slash and not end with a slash (except root)", (): void => {
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

      for (const value of routeValues) {
        expect(value.startsWith("/")).toBe(true);
        if (value !== "/") {
          expect(value.endsWith("/")).toBe(false);
        }
      }
    });
  });

  describe("DISABLED_ROUTES", () => {
    test("should be an array and empty by default", (): void => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
      expect(DISABLED_ROUTES.length).toBe(0);
    });

    test("should allow pushing and removing a route (runtime mutability)", (): void => {
      expect(DISABLED_ROUTES.includes(ROUTE.DISABLED_ROUTE)).toBe(false);
      DISABLED_ROUTES.push(ROUTE.DISABLED_ROUTE);
      expect(DISABLED_ROUTES.includes(ROUTE.DISABLED_ROUTE)).toBe(true);

      // cleanup within the test to avoid cross-test pollution (afterEach also restores full state)
      const index = DISABLED_ROUTES.indexOf(ROUTE.DISABLED_ROUTE);
      if (index >= 0) {
        DISABLED_ROUTES.splice(index, 1);
      }
      expect(DISABLED_ROUTES.includes(ROUTE.DISABLED_ROUTE)).toBe(false);
    });

    test("should not contain any active route by default (sanity check)", (): void => {
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

      for (const route of DISABLED_ROUTES) {
        expect(allRoutes.includes(route)).toBe(true);
      }
      expect(DISABLED_ROUTES.length).toBe(0);
    });
  });
});
