import { describe, test, expect } from "vitest";
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  DEFAULT_PAGINATION_PAGE_NUMBER,
  NAV_TITLE,
  SEARCH_PARAM,
} from "./config/constants/navigation";

describe("config/constants/navigation", () => {
  describe("DEFAULT_TRANSACTION_LIMIT", () => {
    afterEach(() => {
      cleanup();
      vi.clearAllMocks();
    });

    test("should be a number and equal to 30", (): void => {
      expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe("number");
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
    });

  describe("NAV_ICON_SIZE", () => {
    test("should be a number and equal to 24", (): void => {
      expect(typeof NAV_ICON_SIZE).toBe("number");
      expect(NAV_ICON_SIZE).toBe(24);
    });

  describe("DEFAULT_PAGINATION_PAGE_NUMBER", () => {
    test('should be a string and equal to "1"', (): void => {
      expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe("string");
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe("1");
    });

  describe("NAV_TITLE enum", () => {
    test("should have correct string literal values", (): void => {
      expect(NAV_TITLE.HOME).toBe("Home");
      expect(typeof NAV_TITLE.HOME).toBe("string");

      expect(NAV_TITLE.MONTHLY_REPORT).toBe("Monthly Report");
      expect(typeof NAV_TITLE.MONTHLY_REPORT).toBe("string");

      expect(NAV_TITLE.CHART).toBe("Chart");
      expect(typeof NAV_TITLE.CHART).toBe("string");

      expect(NAV_TITLE.LIMITS).toBe("Limits");
      expect(typeof NAV_TITLE.LIMITS).toBe("string");

      expect(NAV_TITLE.SUBSCRIPTIONS).toBe("Subscriptions");
      expect(typeof NAV_TITLE.SUBSCRIPTIONS).toBe("string");

      expect(NAV_TITLE.CATEGORIES).toBe("Categories");
      expect(typeof NAV_TITLE.CATEGORIES).toBe("string");

      expect(NAV_TITLE.EXPORT).toBe("Export");
      expect(typeof NAV_TITLE.EXPORT).toBe("string");

      expect(NAV_TITLE.SETTINGS).toBe("Settings");
      expect(typeof NAV_TITLE.SETTINGS).toBe("string");

      expect(NAV_TITLE.FEEDBACK).toBe("Give Feedback");
      expect(typeof NAV_TITLE.FEEDBACK).toBe("string");

      expect(NAV_TITLE.ISSUE).toBe("Report Issue");
      expect(typeof NAV_TITLE.ISSUE).toBe("string");

      expect(NAV_TITLE.SIGNIN).toBe("Sign In");
      expect(typeof NAV_TITLE.SIGNIN).toBe("string");
    });

  describe("SEARCH_PARAM enum", () => {
    test("should have correct string literal values", (): void => {
      expect(SEARCH_PARAM.QUERY).toBe("query");
      expect(typeof SEARCH_PARAM.QUERY).toBe("string");

      expect(SEARCH_PARAM.PAGE).toBe("page");
      expect(typeof SEARCH_PARAM.PAGE).toBe("string");
    });
