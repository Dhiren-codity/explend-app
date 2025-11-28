import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  NAV_TITLE,
  SEARCH_PARAM,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from './navigation';

describe('config/constants/navigation', () => {
  beforeEach((): void => {
    // No setup needed for constants
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe('DEFAULT_TRANSACTION_LIMIT', () => {
    test('should be the expected number value', (): void => {
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
    });

    test('should be a positive integer', (): void => {
      expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number');
      expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true);
      expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0);
    });
  });

  describe('NAV_ICON_SIZE', () => {
    test('should be the expected icon size', (): void => {
      expect(NAV_ICON_SIZE).toBe(24);
    });

    test('should be a positive integer', (): void => {
      expect(typeof NAV_ICON_SIZE).toBe('number');
      expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true);
      expect(NAV_ICON_SIZE).toBeGreaterThan(0);
    });
  });

  describe('NAV_TITLE enum', () => {
    test('should map each title to the correct string', (): void => {
      expect(NAV_TITLE.HOME).toBe('Home');
      expect(NAV_TITLE.MONTHLY_REPORT).toBe('Monthly Report');
      expect(NAV_TITLE.CHART).toBe('Chart');
      expect(NAV_TITLE.LIMITS).toBe('Limits');
      expect(NAV_TITLE.SUBSCRIPTIONS).toBe('Subscriptions');
      expect(NAV_TITLE.CATEGORIES).toBe('Categories');
      expect(NAV_TITLE.EXPORT).toBe('Export');
      expect(NAV_TITLE.SETTINGS).toBe('Settings');
      expect(NAV_TITLE.FEEDBACK).toBe('Give Feedback');
      expect(NAV_TITLE.ISSUE).toBe('Report Issue');
      expect(NAV_TITLE.SIGNIN).toBe('Sign In');
    });

    test('should be non-empty strings and unique', (): void => {
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
      for (const value of values) {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      }
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });

    test('should not equal incorrect values', (): void => {
      expect(NAV_TITLE.HOME).not.toBe('Homepage');
      expect(NAV_TITLE.SIGNIN).not.toBe('Login');
    });
  });

  describe('SEARCH_PARAM enum', () => {
    test('should map to correct query parameter keys', (): void => {
      expect(SEARCH_PARAM.QUERY).toBe('query');
      expect(SEARCH_PARAM.PAGE).toBe('page');
    });

    test('should be non-empty and lowercased', (): void => {
      const values: string[] = [SEARCH_PARAM.QUERY, SEARCH_PARAM.PAGE];
      for (const value of values) {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
        expect(value).toBe(value.toLowerCase());
      }
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });

    test('should not match unrelated values', (): void => {
      expect(SEARCH_PARAM.QUERY).not.toBe('q');
      expect(SEARCH_PARAM.PAGE).not.toBe('p');
    });
  });

  describe('DEFAULT_PAGINATION_PAGE_NUMBER', () => {
    test('should be the expected default page as a string', (): void => {
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1');
      expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string');
    });

    test('should represent a positive integer string', (): void => {
      const parsed: number = Number(DEFAULT_PAGINATION_PAGE_NUMBER);
      expect(Number.isNaN(parsed)).toBe(false);
      expect(Number.isInteger(parsed)).toBe(true);
      expect(parsed).toBeGreaterThan(0);
    });
  });
});
