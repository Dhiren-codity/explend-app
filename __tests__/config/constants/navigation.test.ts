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
    test('should be 30', (): void => {
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
      expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number');
    });

  describe('NAV_ICON_SIZE', () => {
    test('should be 24', (): void => {
      expect(NAV_ICON_SIZE).toBe(24);
      expect(typeof NAV_ICON_SIZE).toBe('number');
    });

  describe('DEFAULT_PAGINATION_PAGE_NUMBER', () => {
    test('should be "1"', (): void => {
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1');
      expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string');
      expect(Number(DEFAULT_PAGINATION_PAGE_NUMBER)).toBe(1);
    });

  describe('NAV_TITLE (const enum)', () => {
    test('should have correct string values', (): void => {
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

    test('should be strings', (): void => {
      expect(typeof NAV_TITLE.HOME).toBe('string');
      expect(typeof NAV_TITLE.MONTHLY_REPORT).toBe('string');
      expect(typeof NAV_TITLE.CHART).toBe('string');
      expect(typeof NAV_TITLE.LIMITS).toBe('string');
      expect(typeof NAV_TITLE.SUBSCRIPTIONS).toBe('string');
      expect(typeof NAV_TITLE.CATEGORIES).toBe('string');
      expect(typeof NAV_TITLE.EXPORT).toBe('string');
      expect(typeof NAV_TITLE.SETTINGS).toBe('string');
      expect(typeof NAV_TITLE.FEEDBACK).toBe('string');
      expect(typeof NAV_TITLE.ISSUE).toBe('string');
      expect(typeof NAV_TITLE.SIGNIN).toBe('string');
    });

    test('should have unique values', (): void => {
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
      const uniqueCount: number = new Set(values).size;
      expect(uniqueCount).toBe(values.length);
    });

  describe('SEARCH_PARAM (const enum)', () => {
    test('should have correct string values', (): void => {
      expect(SEARCH_PARAM.QUERY).toBe('query');
      expect(SEARCH_PARAM.PAGE).toBe('page');
    });

    test('should be strings and unique', (): void => {
      const values: string[] = [SEARCH_PARAM.QUERY, SEARCH_PARAM.PAGE];
      expect(typeof SEARCH_PARAM.QUERY).toBe('string');
      expect(typeof SEARCH_PARAM.PAGE).toBe('string');
      const uniqueCount: number = new Set(values).size;
      expect(uniqueCount).toBe(values.length);
    });
