import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  NAV_TITLE,
  SEARCH_PARAM,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from "./config/constants/navigation";

describe("config/constants/navigation", () => {
  beforeEach((): void => {
    // No setup needed for pure constants; keep structure for consistency
  });

  afterEach((): void => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("DEFAULT_TRANSACTION_LIMIT", () => {
    test("should be a number and equal to 30", (): void => {
      expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe("number");
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
    });

    test("should be a positive integer", (): void => {
      expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true);
      expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0);
    });
  });

  describe("NAV_ICON_SIZE", () => {
    test("should be a number and equal to 24", (): void => {
      expect(typeof NAV_ICON_SIZE).toBe("number");
      expect(NAV_ICON_SIZE).toBe(24);
    });

    test("should be a positive integer", (): void => {
      expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true);
      expect(NAV_ICON_SIZE).toBeGreaterThan(0);
    });
  });

  describe("NAV_TITLE", () => {
    test("should inline to correct string literals", (): void => {
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

    test("should have unique values and be case sensitive", (): void => {
      const values: readonly string[] = [
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
      const set = new Set(values);
      expect(set.size).toBe(values.length);
      expect(values.includes("home")).toBe(false);
      expect(values.includes("HOME")).toBe(false);
    });
  });

  describe("SEARCH_PARAM", () => {
    test("should inline to correct string literals", (): void => {
      expect(SEARCH_PARAM.QUERY).toBe("query");
      expect(SEARCH_PARAM.PAGE).toBe("page");
    });

    test("should build URLSearchParams correctly", (): void => {
      const params = new URLSearchParams({
        [SEARCH_PARAM.QUERY]: "keyword",
        [SEARCH_PARAM.PAGE]: "2",
      });
      const queryString = params.toString();

      // Order is not strictly guaranteed; verify by access
      expect(params.get("query")).toBe("keyword");
      expect(params.get("page")).toBe("2");
      // String representation should contain both parts
      expect(queryString.includes("query=keyword")).toBe(true);
      expect(queryString.includes("page=2")).toBe(true);
    });
  });

  describe("DEFAULT_PAGINATION_PAGE_NUMBER", () => {
    test('should be a string equal to "1"', (): void => {
      expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe("string");
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe("1");
    });

    test("should parse to number 1 and be a valid integer string", (): void => {
      const parsed = Number.parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10);
      expect(Number.isNaN(parsed)).toBe(false);
      expect(parsed).toBe(1);
    });

    test("should integrate with URLSearchParams as expected", (): void => {
      const params = new URLSearchParams({
        [SEARCH_PARAM.PAGE]: DEFAULT_PAGINATION_PAGE_NUMBER,
      });
      expect(params.get("page")).toBe("1");
    });
  });
});
