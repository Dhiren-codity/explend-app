import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  NAV_TITLE,
  SEARCH_PARAM,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from "./config/constants/navigation";

vi.mock("node:fs", (): Record<string, unknown> => ({}));

describe("config/constants/navigation", () => {
  beforeEach((): void => {
    vi.useFakeTimers();
  });

  afterEach((): void => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("DEFAULT_TRANSACTION_LIMIT", () => {
    test("should be 30 and a positive integer", (): void => {
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
      expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true);
      expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0);
    });
  });

  describe("NAV_ICON_SIZE", () => {
    test("should be 24 and a positive integer", (): void => {
      expect(NAV_ICON_SIZE).toBe(24);
      expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true);
      expect(NAV_ICON_SIZE).toBeGreaterThan(0);
    });
  });

  describe("NAV_TITLE", () => {
    test("should have correct string mappings", (): void => {
      expect(NAV_TITLE.HOME).toBe("Home");
      expect(NAV_TITLE.MONTHLY_REPORT).toBe("Monthly Report");
      expect(NAV_TITLE.CHART).toBe("Chart");
      expect(NAV_TITLE.LIMITS).toBe("Limits");
      expect(NAV_TITLE.SUBSCRIPTIONS).toBe("Subscriptions");
      expect(NAV_TITLE.CATEGORIES).toBe("Categories");
      expect(NAV_TITLE.EXPORT).toBe("Export");
      expect(NAV_TITLE.SETTINGS).toBe("Settings");
      expect(NAV_TITLE.FEEDBACK).toBe("Give Feedback");
      expect(NAV_TITLE.ISSUE).toBe("Report Issue");
      expect(NAV_TITLE.SIGNIN).toBe("Sign In");
    });

    test("should have unique values", (): void => {
      const values: string[] = [
        NAV_TITLE.HOME,
        NAV_TITLE.MONTHLY_REPORT,
        NAV_TITLE.CHART,
        NAV_TITLE.LIMITS,
        NAV_TITLE.SUBSCRIPTIONS,
        NAV_TITLE.CATEGORIES,
        NAV_TITLE.EXPORT,
        NAV_TITLE.SETTINGS,
        NAV_TITLE.FEEDBACK,
        NAV_TITLE.ISSUE,
        NAV_TITLE.SIGNIN,
      ];
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });

    test("should be usable as object keys", (): void => {
      const routes: Record<string, string> = {
        [NAV_TITLE.HOME]: "/",
        [NAV_TITLE.SETTINGS]: "/settings",
      };
      expect(routes[NAV_TITLE.HOME]).toBe("/");
      expect(routes[NAV_TITLE.SETTINGS]).toBe("/settings");
      expect(routes["Unknown"]).toBeUndefined();
    });
  });

  describe("SEARCH_PARAM", () => {
    test("should have correct string mappings", (): void => {
      expect(SEARCH_PARAM.QUERY).toBe("query");
      expect(SEARCH_PARAM.PAGE).toBe("page");
    });

    test("should be usable in URLSearchParams", (): void => {
      const params = new URLSearchParams({
        [SEARCH_PARAM.QUERY]: "books",
        [SEARCH_PARAM.PAGE]: "2",
      });
      expect(params.get(SEARCH_PARAM.QUERY)).toBe("books");
      expect(params.get(SEARCH_PARAM.PAGE)).toBe("2");
      expect(params.get("missing")).toBeNull();
    });

    test("should have unique values", (): void => {
      const values: string[] = [SEARCH_PARAM.QUERY, SEARCH_PARAM.PAGE];
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });
  });

  describe("DEFAULT_PAGINATION_PAGE_NUMBER", () => {
    test('should be string "1"', (): void => {
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe("1");
      expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe("string");
    });

    test("should be a numeric string that parses to 1", (): void => {
      const parsed = Number.parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10);
      expect(Number.isNaN(parsed)).toBe(false);
      expect(parsed).toBe(1);
    });
  });
});
