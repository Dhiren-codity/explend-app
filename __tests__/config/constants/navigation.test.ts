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

  describe("DEFAULT_TRANSACTION_LIMIT", () => {
    test("should be 30 and a positive integer", (): void => {
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
      expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe("number");
      expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true);
      expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0);
    });

  describe("NAV_ICON_SIZE", () => {
    test("should be 24 and a positive integer", (): void => {
      expect(NAV_ICON_SIZE).toBe(24);
      expect(typeof NAV_ICON_SIZE).toBe("number");
      expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true);
      expect(NAV_ICON_SIZE).toBeGreaterThan(0);
    });

  describe("NAV_TITLE const enum values", () => {
    test("should match expected titles", (): void => {
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

    test("should be usable as string literals in code paths", (): void => {
      const titles: string[] = [
        NAV_TITLE.HOME,
        NAV_TITLE.SETTINGS,
        NAV_TITLE.EXPORT,
      ];
      expect(titles).toContain("Home");
      expect(titles).toContain("Settings");
      expect(titles).toContain("Export");
      expect(titles.includes("Non Existing")).toBe(false);
    });

  describe("SEARCH_PARAM const enum values", () => {
    test("should match expected param names", (): void => {
      expect(SEARCH_PARAM.QUERY).toBe("query");
      expect(SEARCH_PARAM.PAGE).toBe("page");
    });

    test("should integrate correctly with URLSearchParams", (): void => {
      const url = new URL("https://example.com");
      url.searchParams.set(SEARCH_PARAM.QUERY, "cats");
      url.searchParams.set(SEARCH_PARAM.PAGE, "2");

      expect(url.searchParams.get(SEARCH_PARAM.QUERY)).toBe("cats");
      expect(url.searchParams.get(SEARCH_PARAM.PAGE)).toBe("2");
      expect(url.searchParams.get("nonexistent")).toBeNull();
    });

  describe("DEFAULT_PAGINATION_PAGE_NUMBER", () => {
    test('should be "1" and parsable to number 1', (): void => {
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe("1");
      expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe("string");
      const parsed = Number.parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10);
      expect(parsed).toBe(1);
      expect(Number.isNaN(parsed)).toBe(false);
    });

    test("should not be a number type directly", (): void => {
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).not.toBe(1 as unknown);
    });
