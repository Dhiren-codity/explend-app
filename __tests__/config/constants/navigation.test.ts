import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  NAV_TITLE,
  SEARCH_PARAM,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from "./navigation";


  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe("DEFAULT_TRANSACTION_LIMIT", () => {
    test(async () => {
      expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe("number");
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
      expect(Number.isFinite(DEFAULT_TRANSACTION_LIMIT)).toBe(true);
      expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0);
    });

  describe("NAV_ICON_SIZE", () => {
    test(async () => {
      expect(typeof NAV_ICON_SIZE).toBe("number");
      expect(NAV_ICON_SIZE).toBe(24);
      expect(Number.isFinite(NAV_ICON_SIZE)).toBe(true);
      expect(NAV_ICON_SIZE).toBeGreaterThan(0);
    });

  describe("DEFAULT_PAGINATION_PAGE_NUMBER", () => {
    test('should be a string "1"', () => {
      expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe("string");
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe("1");
    });

  describe("NAV_TITLE enum", () => {
    test(async () => {
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

    test(async () => {
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
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

  describe("SEARCH_PARAM enum", () => {
    test(async () => {
      expect(SEARCH_PARAM.QUERY).toBe("query");
      expect(SEARCH_PARAM.PAGE).toBe("page");
    });

    test(async () => {
      const values: string[] = [SEARCH_PARAM.QUERY, SEARCH_PARAM.PAGE];
      for (const value of values) {
        expect(value).toBe(value.toLowerCase());
        expect(typeof value).toBe("string");
      }
