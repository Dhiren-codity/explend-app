import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  NAV_TITLE,
  SEARCH_PARAM,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from './navigation';


  describe('DEFAULT_TRANSACTION_LIMIT', () => {
    test('should be 30', (): void => {
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
    });

  describe('NAV_ICON_SIZE', () => {
    test('should be 24', (): void => {
      expect(NAV_ICON_SIZE).toBe(24);
    });

  describe('NAV_TITLE enum', () => {
    test('should have correct values for all keys', (): void => {
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

    test('should not have unexpected keys', (): void => {
      const keys = Object.keys(NAV_TITLE);
      expect(keys).toEqual([
        'HOME',
        'MONTHLY_REPORT',
        'CHART',
        'LIMITS',
        'SUBSCRIPTIONS',
        'CATEGORIES',
        'EXPORT',
        'SETTINGS',
        'FEEDBACK',
        'ISSUE',
        'SIGNIN',
      ]);
    });

  describe('SEARCH_PARAM enum', () => {
    test('should have correct values for all keys', (): void => {
      expect(SEARCH_PARAM.QUERY).toBe('query');
      expect(SEARCH_PARAM.PAGE).toBe('page');
    });

    test('should not have unexpected keys', (): void => {
      const keys = Object.keys(SEARCH_PARAM);
      expect(keys).toEqual(['QUERY', 'PAGE']);
    });

  describe('DEFAULT_PAGINATION_PAGE_NUMBER', () => {
    test('should be "1"', (): void => {
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe('1');
    });