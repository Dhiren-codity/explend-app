import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { ROUTE, DISABLED_ROUTES } from "./routes";

vi.mock(
  "node:fs",
  (): Record<string, unknown> => ({
    promises: {
      readFile: vi.fn(),
      writeFile: vi.fn(),
    },
  }),
);


  afterEach((): void => {
    vi.clearAllMocks();
  });

      [
        { name: "HOME", value: ROUTE.HOME, expected: "/" },
        { name: "SIGNIN", value: ROUTE.SIGNIN, expected: "/sign-in" },
        {
          name: "MONTHLY_REPORT",
          value: ROUTE.MONTHLY_REPORT,
          expected: "/monthly-report",
        },
        { name: "CHART", value: ROUTE.CHART, expected: "/chart" },
        { name: "LIMITS", value: ROUTE.LIMITS, expected: "/limits" },
        {
          name: "SUBSCRIPTIONS",
          value: ROUTE.SUBSCRIPTIONS,
          expected: "/subscriptions",
        },
        {
          name: "CATEGORIES",
          value: ROUTE.CATEGORIES,
          expected: "/categories",
        },
        { name: "EXPORT", value: ROUTE.EXPORT, expected: "/export" },
        { name: "SETTINGS", value: ROUTE.SETTINGS, expected: "/settings" },
        { name: "FEEDBACK", value: ROUTE.FEEDBACK, expected: "/feedback" },
        { name: "ISSUE", value: ROUTE.ISSUE, expected: "/issue" },
        { name: "SITEMAP", value: ROUTE.SITEMAP, expected: "/sitemap.xml" },
        {
          name: "DISABLED_ROUTE",
          value: ROUTE.DISABLED_ROUTE,
          expected: "/disabled-route",
        },
      ];

    test("should map every enum member to the correct path", (): void => {
      for (const { name, value, expected } of routeCases) {
        expect(value).toBe(expected);
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
      }

    test("every route should start with a forward slash", (): void => {
      for (const { value } of routeCases) {
        expect(value.startsWith("/")).toBe(true);
      }

    test("routes should be unique", (): void => {
      const values: string[] = routeCases.map((c) => c.value);
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });

    test("non-root routes should not end with a trailing slash", (): void => {
      const nonRootRoutes: string[] = routeCases
        .map((c) => c.value)
        .filter((v) => v !== ROUTE.HOME);
      for (const route of nonRootRoutes) {
        expect(route.endsWith("/")).toBe(false);
      }

    test("sitemap route should end with .xml", (): void => {
      expect(ROUTE.SITEMAP.endsWith(".xml")).toBe(true);
    });

  describe("DISABLED_ROUTES constant", () => {
    test("should be an array and default to empty", (): void => {
      expect(Array.isArray(DISABLED_ROUTES)).toBe(true);
      expect(DISABLED_ROUTES.length).toBe(0);
    });

    test("should only accept ROUTE values when used", (): void => {
      // Compile-time ensures type safety for ROUTE[], runtime check here ensures strings
      for (const value of DISABLED_ROUTES) {
        expect(typeof value).toBe("string");
      }

    test("setting an invalid length should throw and leave array unchanged", (): void => {
      expect((): void => {
        // Attempting to set an invalid length should throw a RangeError
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (DISABLED_ROUTES as unknown as { length: number }).length = -1;
      }).toThrow(RangeError);
      expect(DISABLED_ROUTES.length).toBe(0);
    });
