import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  NAV_TITLE,
  SEARCH_PARAM,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from 'config/constants/navigation';

describe('config/constants/navigation', () => {
  beforeEach((): void => {
    // No setup needed for constants
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe('DEFAULT_TRANSACTION_LIMIT', () => {
    test('should be 30', (): void => {
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
    });

    test('should be a positive integer', (): void => {
      expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true);
      expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0);
    });
  });

  describe('NAV_ICON_SIZE', () => {
    test('should be 24', (): void => {
      expect(NAV_ICON_SIZE).toBe(24);
    });

    test('should be a positive integer', (): void => {
      expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true);
      expect(NAV_ICON_SIZE).toBeGreaterThan(0);
    });
  });

  describe('DEFAULT_PAGINATION_PAGE_NUMBER', () => {
    test('should be "1"', (): void => {
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1');
    });

    test('should be a string that converts to number 1', (): void => {
      expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string');
      expect(Number.parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)).toBe(1);
      expect(Number.isNaN(Number.parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10))).toBe(false);
    });
  });

  describe('NAV_TITLE const enum values', () => {
    test('should map each title correctly', (): void => {
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

    test('should have unique, non-empty values', (): void => {
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
      values.forEach((v: string): void => {
        expect(typeof v).toBe('string');
        expect(v.length).toBeGreaterThan(0);
      });
    });
  });

  describe('SEARCH_PARAM const enum values', () => {
    test('should map each search param key correctly', (): void => {
      expect(SEARCH_PARAM.QUERY).toBe('query');
      expect(SEARCH_PARAM.PAGE).toBe('page');
    });

    test('should be usable as URLSearchParams keys', (): void => {
      const params = new URLSearchParams({
        [SEARCH_PARAM.QUERY]: 'alpha',
        [SEARCH_PARAM.PAGE]: '2',
      });
      expect(params.get('query')).toBe('alpha');
      expect(params.get('page')).toBe('2');
      expect(params.toString()).toContain('query=alpha');
      expect(params.toString()).toContain('page=2');
    });
  });
});
