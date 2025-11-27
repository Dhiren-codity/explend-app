import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {




    describe('DEFAULT_TRANSACTION_LIMIT', () => {
      test('should be the expected number', (): void => {
        expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
      });
      test('should be the expected number', (): void => {
        expect(NAV_ICON_SIZE).toBe(24);
      });
      test('should expose the correct string literals for each title', (): void => {
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
      test('should expose correct query param names', (): void => {
        expect(SEARCH_PARAM.QUERY).toBe('query');
        expect(SEARCH_PARAM.PAGE).toBe('page');
      });
      test('should be the expected string', (): void => {
        expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1');
        expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string');
      });
