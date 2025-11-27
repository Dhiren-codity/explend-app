import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { DEFAULT_TRANSACTION_LIMIT, NAV_ICON_SIZE, DEFAULT_PAGINATION_PAGE_NUMBER, NAV_TITLE, SEARCH_PARAM } from './navigation';


  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe('DEFAULT_TRANSACTION_LIMIT', () => {
    test('should be defined and equal to 30', (): void => {
      expect(DEFAULT_TRANSACTION_LIMIT).toBeDefined();
      expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number');
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
    });

    test('should be a positive integer', (): void => {
      expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true);
      expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0);
    });

  describe('NAV_ICON_SIZE', () => {
    test('should be defined and equal to 24', (): void => {
      expect(NAV_ICON_SIZE).toBeDefined();
      expect(typeof NAV_ICON_SIZE).toBe('number');
      expect(NAV_ICON_SIZE).toBe(24);
    });

    test('should be a positive integer', (): void => {
      expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true);
      expect(NAV_ICON_SIZE).toBeGreaterThan(0);
    });

  describe('DEFAULT_PAGINATION_PAGE_NUMBER', () => {
    test('should be defined and equal to "1"', (): void => {
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBeDefined();
      expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string');
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1');
    });

    test('should represent a positive integer string', (): void => {
      const parsed: number = Number(DEFAULT_PAGINATION_PAGE_NUMBER);
      expect(Number.isInteger(parsed)).toBe(true);
      expect(parsed).toBeGreaterThan(0);
    });

  describe('NAV_TITLE (const enum)', () => {
    test('should inline enum members with correct values', (): void => {
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

    test('should have unique values', (): void => {
      const values: ReadonlyArray<string> = [
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

  describe('SEARCH_PARAM (const enum)', () => {
    test('should inline enum members with correct values', (): void => {
      expect(SEARCH_PARAM.QUERY).toBe('query');
      expect(SEARCH_PARAM.PAGE).toBe('page');
    });

    test('should have unique values', (): void => {
      const values: ReadonlyArray<string> = [SEARCH_PARAM.QUERY, SEARCH_PARAM.PAGE];
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });