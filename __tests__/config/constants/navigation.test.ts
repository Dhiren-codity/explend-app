import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  NAV_TITLE,
  SEARCH_PARAM,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from './config/constants/navigation';

describe('config/constants/navigation', () => {
  beforeEach((): void => {
    // Setup can be added here if needed
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe('DEFAULT_TRANSACTION_LIMIT', () => {
    test('should equal 30', (): void => {
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
    });

    test('should be a positive integer', (): void => {
      expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true);
      expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0);
    });
  });

  describe('NAV_ICON_SIZE', () => {
    test('should equal 24', (): void => {
      expect(NAV_ICON_SIZE).toBe(24);
    });

    test('should be a positive integer', (): void => {
      expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true);
      expect(NAV_ICON_SIZE).toBeGreaterThan(0);
    });
  });

  describe('DEFAULT_PAGINATION_PAGE_NUMBER', () => {
    test('should equal "1"', (): void => {
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1');
    });

    test('should parse to numeric 1', (): void => {
      const parsed: number = parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10);
      expect(Number.isInteger(parsed)).toBe(true);
      expect(parsed).toBe(1);
    });
  });

  describe('NAV_TITLE enum', () => {
    test('should have all expected values', (): void => {
      const titles: string[] = [
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
      const expected: string[] = [
        'Home',
        'Monthly Report',
        'Chart',
        'Limits',
        'Subscriptions',
        'Categories',
        'Export',
        'Settings',
        'Give Feedback',
        'Report Issue',
        'Sign In',
      ];
      expect(titles).toEqual(expected);
    });

    test('should be unique and non-empty strings', (): void => {
      const titles: string[] = [
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
      titles.forEach((value: string): void => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
      const unique = new Set(titles);
      expect(unique.size).toBe(titles.length);
    });
  });

  describe('SEARCH_PARAM enum', () => {
    test('should have expected values', (): void => {
      const params: string[] = [SEARCH_PARAM.QUERY, SEARCH_PARAM.PAGE];
      expect(params).toEqual(['query', 'page']);
    });

    test('should be unique and non-empty strings', (): void => {
      const params: string[] = [SEARCH_PARAM.QUERY, SEARCH_PARAM.PAGE];
      params.forEach((value: string): void => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
      const unique = new Set(params);
      expect(unique.size).toBe(params.length);
    });
  });
});
