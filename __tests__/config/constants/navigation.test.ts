import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  NAV_TITLE,
  SEARCH_PARAM,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from "./config/constants/navigation";

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
}));

describe("config/constants/navigation", (): void => {
  beforeEach((): void => {
    // No setup required for constants
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe("DEFAULT_TRANSACTION_LIMIT", (): void => {
    test("should be a number equal to 30", (): void => {
      expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe("number");
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
    });

    test("should not be zero (sanity check)", (): void => {
      expect(DEFAULT_TRANSACTION_LIMIT).not.toBe(0);
    });
  });

  describe("NAV_ICON_SIZE", (): void => {
    test("should be a number equal to 24", (): void => {
      expect(typeof NAV_ICON_SIZE).toBe("number");
      expect(NAV_ICON_SIZE).toBe(24);
    });

    test("should not be negative (sanity check)", (): void => {
      expect(NAV_ICON_SIZE).toBeGreaterThanOrEqual(0);
    });
  });

  describe("DEFAULT_PAGINATION_PAGE_NUMBER", (): void => {
    test('should be a string equal to "1"', (): void => {
      expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe("string");
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe("1");
    });

    test("should be parsable to number 1", (): void => {
      const parsed: number = Number(DEFAULT_PAGINATION_PAGE_NUMBER);
      expect(parsed).toBe(1);
    });

      const sp: URLSearchParams = new URLSearchParams(params);
      expect(sp.get(SEARCH_PARAM.PAGE)).toBe("1");
    });
  });

  describe("NAV_TITLE const enum values", (): void => {
    test("should inline to the correct literal strings", (): void => {
      const home: string = NAV_TITLE.HOME;
      const monthlyReport: string = NAV_TITLE.MONTHLY_REPORT;
      const chart: string = NAV_TITLE.CHART;
      const limits: string = NAV_TITLE.LIMITS;
      const subscriptions: string = NAV_TITLE.SUBSCRIPTIONS;
      const categories: string = NAV_TITLE.CATEGORIES;
      const exportTitle: string = NAV_TITLE.EXPORT;
      const settings: string = NAV_TITLE.SETTINGS;
      const feedback: string = NAV_TITLE.FEEDBACK;
      const issue: string = NAV_TITLE.ISSUE;
      const signIn: string = NAV_TITLE.SIGNIN;

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
      expect(signIn).toBe("Sign In");

      const values: string[] = [
        home,
        monthlyReport,
        chart,
        limits,
        subscriptions,
        categories,
        exportTitle,
        settings,
        feedback,
        issue,
        signIn,
      ];
      const uniqueCount: number = new Set(values).size;
      expect(uniqueCount).toBe(values.length);
    });

    test("should not include unexpected values (sanity check)", (): void => {
      const unexpected: string = "Dashboard";
      const allowed: string[] = [
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
      expect(allowed.includes(unexpected)).toBe(false);
    });
  });

  describe("SEARCH_PARAM const enum values", (): void => {
    test("should inline to correct query keys", (): void => {
      const queryKey: string = SEARCH_PARAM.QUERY;
      const pageKey: string = SEARCH_PARAM.PAGE;

      expect(queryKey).toBe("query");
      expect(pageKey).toBe("page");

      const keys: string[] = [queryKey, pageKey];
      const uniqueCount: number = new Set(keys).size;
      expect(uniqueCount).toBe(keys.length);
    });

      const sp: URLSearchParams = new URLSearchParams(params);

      expect(sp.get(SEARCH_PARAM.QUERY)).toBe("budget");
      expect(sp.get(SEARCH_PARAM.PAGE)).toBe("1");
    });

    test("should not accept invalid key (sanity check)", (): void => {
      const invalidKey: string = "foo";
      const validKeys: string[] = [SEARCH_PARAM.QUERY, SEARCH_PARAM.PAGE];
      expect(validKeys.includes(invalidKey)).toBe(false);
    });
  });
});
