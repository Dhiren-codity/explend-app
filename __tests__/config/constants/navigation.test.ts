import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from "./navigation";
import type { NAV_TITLE, SEARCH_PARAM } from "./navigation";


  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe("DEFAULT_TRANSACTION_LIMIT", () => {
    test("should be 30", (): void => {
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
    });

    test("should be a positive integer", (): void => {
      expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true);
      expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0);
    });

  describe("NAV_ICON_SIZE", () => {
    test("should be 24", (): void => {
      expect(NAV_ICON_SIZE).toBe(24);
    });

    test("should be a positive integer", (): void => {
      expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true);
      expect(NAV_ICON_SIZE).toBeGreaterThan(0);
    });

  describe("DEFAULT_PAGINATION_PAGE_NUMBER", () => {
    test('should be "1"', (): void => {
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe("1");
    });

    test("should represent a positive integer when parsed", (): void => {
      const parsed = Number.parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10);
      expect(Number.isInteger(parsed)).toBe(true);
      expect(parsed).toBe(1);
    });

  describe("NAV_TITLE (const enum, compile-time checked)", () => {
    test("members have expected string values", (): void => {
      const home: NAV_TITLE = "Home";
      const monthlyReport: NAV_TITLE = "Monthly Report";
      const chart: NAV_TITLE = "Chart";
      const limits: NAV_TITLE = "Limits";
      const subscriptions: NAV_TITLE = "Subscriptions";
      const categories: NAV_TITLE = "Categories";
      const exportTitle: NAV_TITLE = "Export";
      const settings: NAV_TITLE = "Settings";
      const feedback: NAV_TITLE = "Give Feedback";
      const issue: NAV_TITLE = "Report Issue";
      const signin: NAV_TITLE = "Sign In";

      expect(home).toBe("Home");
      expect(monthlyReport).toBe("Monthly Report");
      expect(chart).toBe("Chart");
      expect(limits).toBe("Limits");
      expect(subscriptions).toBe("Subscriptions");
      expect(categories).toBe("Categories");
      expect(exportTitle).toBe("Export");
      expect(settings).toBe("Settings");
      expect(feedback).toBe("Give Feedback");
      expect(issue).toBe("Report Issue");
      expect(signin).toBe("Sign In");

      expect(home).not.toBe("home");
    });

  describe("SEARCH_PARAM (const enum, compile-time checked)", () => {
    test("members have expected string keys", (): void => {
      const query: SEARCH_PARAM = "query";
      const page: SEARCH_PARAM = "page";

      expect(query).toBe("query");
      expect(page).toBe("page");

      expect(query).not.toBe("QUERY");
      expect(page).not.toBe("PAGE");
    });
