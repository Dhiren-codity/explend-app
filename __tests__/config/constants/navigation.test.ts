import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  NAV_TITLE,
  SEARCH_PARAM,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from './navigation';


  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe('DEFAULT_TRANSACTION_LIMIT', () => {
    test('should be 30 and a positive integer', (): void => {
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
      expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true);
      expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0);
    });

  describe('NAV_ICON_SIZE', () => {
    test('should be 24 and a positive integer', (): void => {
      expect(NAV_ICON_SIZE).toBe(24);
      expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true);
      expect(NAV_ICON_SIZE).toBeGreaterThan(0);
    });

  describe('DEFAULT_PAGINATION_PAGE_NUMBER', () => {
    test('should be "1" and parse to integer 1', (): void => {
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1');
      const parsed: number = parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10);
      expect(parsed).toBe(1);
      expect(Number.isInteger(parsed)).toBe(true);
    });

  describe('NAV_TITLE const enum', () => {
    test('should provide correct string values for each title', (): void => {
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

    test('values should be usable as string literals', (): void => {
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
      for (const value of titles) {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      }

  describe('SEARCH_PARAM const enum', () => {
    test('should provide correct param keys', (): void => {
      expect(SEARCH_PARAM.QUERY).toBe('query');
      expect(SEARCH_PARAM.PAGE).toBe('page');
    });

    test('should be usable as URLSearchParams keys', (): void => {
      const params = new URLSearchParams();
      params.set(SEARCH_PARAM.QUERY, 'budget');
      params.set(SEARCH_PARAM.PAGE, '2');
      expect(params.get('query')).toBe('budget');
      expect(params.get('page')).toBe('2');
    });
