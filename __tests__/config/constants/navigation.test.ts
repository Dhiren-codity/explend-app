import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  NAV_TITLE,
  SEARCH_PARAM,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from "./config/constants/navigation";


  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe("DEFAULT_TRANSACTION_LIMIT", (): void => {
    test("should be a number equal to 30", (): void => {
      expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe("number");
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
    });

  describe("NAV_ICON_SIZE", (): void => {
    test("should be a number equal to 24", (): void => {
      expect(typeof NAV_ICON_SIZE).toBe("number");
      expect(NAV_ICON_SIZE).toBe(24);
    });

  describe("NAV_TITLE const enum", (): void => {
    test("should have expected string values for each title", (): void => {
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

    test("should have unique values across all enum members", (): void => {
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

    test("values should be strings", (): void => {
      expect(typeof NAV_TITLE.HOME).toBe("string");
      expect(typeof NAV_TITLE.SIGNIN).toBe("string");
    });

  describe("SEARCH_PARAM const enum", (): void => {
    test("should have expected string values", (): void => {
      expect(SEARCH_PARAM.QUERY).toBe("query");
      expect(SEARCH_PARAM.PAGE).toBe("page");
    });

    test("values should be strings", (): void => {
      expect(typeof SEARCH_PARAM.QUERY).toBe("string");
      expect(typeof SEARCH_PARAM.PAGE).toBe("string");
    });

    test("should have unique values", (): void => {
      const values: string[] = [SEARCH_PARAM.QUERY, SEARCH_PARAM.PAGE];
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });

  describe("DEFAULT_PAGINATION_PAGE_NUMBER", (): void => {
    test('should be a string equal to "1"', (): void => {
      expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe("string");
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe("1");
    });

    test("should convert to numeric 1 when parsed", (): void => {
      const parsed = Number(DEFAULT_PAGINATION_PAGE_NUMBER);
      expect(parsed).toBe(1);
    });
