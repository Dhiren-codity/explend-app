import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  NAV_TITLE,
  SEARCH_PARAM,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from './navigation';
import * as navigationModule from './navigation';

describe('config/constants/navigation', () => {
  beforeEach((): void => {
    // Setup if needed
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe('DEFAULT_TRANSACTION_LIMIT', () => {
    test('should be a positive integer and equal to 30', (): void => {
      expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe('number');
      expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true);
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
      expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0);
    });
  });

  describe('NAV_ICON_SIZE', () => {
    test('should be a positive integer and equal to 24', (): void => {
      expect(typeof NAV_ICON_SIZE).toBe('number');
      expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true);
      expect(NAV_ICON_SIZE).toBe(24);
      expect(NAV_ICON_SIZE).toBeGreaterThan(0);
    });
  });

  describe('NAV_TITLE (const enum) values', () => {
    test('should inline and match expected labels', (): void => {
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

    test('const enum should not exist at runtime as an object', (): void => {
      expect('NAV_TITLE' in navigationModule).toBe(false);
      expect((navigationModule as Record<string, unknown>).NAV_TITLE).toBeUndefined();
    });
  });

  describe('SEARCH_PARAM (const enum) values', () => {
    test('should inline and match expected query keys', (): void => {
      expect(SEARCH_PARAM.QUERY).toBe('query');
      expect(SEARCH_PARAM.PAGE).toBe('page');
    });

    test('const enum should not exist at runtime as an object', (): void => {
      expect('SEARCH_PARAM' in navigationModule).toBe(false);
      expect((navigationModule as Record<string, unknown>).SEARCH_PARAM).toBeUndefined();
    });
  });

  describe('DEFAULT_PAGINATION_PAGE_NUMBER', () => {
    test('should be a string "1"', (): void => {
      expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe('string');
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1');
      expect(parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)).toBe(1);
    });
  });

  describe('Module immutability', () => {

      expect(capturedError).toBeInstanceOf(TypeError);
      expect(moduleAsRecord.DEFAULT_TRANSACTION_LIMIT).toBe(originalValue);

      const descriptor = Object.getOwnPropertyDescriptor(navigationModule, 'DEFAULT_TRANSACTION_LIMIT');
      expect(descriptor).toBeDefined();
      expect(Boolean(descriptor?.writable)).toBe(false);
      expect(Boolean(descriptor?.configurable)).toBe(false);
    });
  });
});
