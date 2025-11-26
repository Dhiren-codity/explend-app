import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import * as navigation from "config/constants/navigation";


  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe("DEFAULT_TRANSACTION_LIMIT", (): void => {
    test("should be defined and equal to 30", (): void => {
      expect(navigation.DEFAULT_TRANSACTION_LIMIT).toBeDefined();
      expect(typeof navigation.DEFAULT_TRANSACTION_LIMIT).toBe("number");
      expect(navigation.DEFAULT_TRANSACTION_LIMIT).toBe(30);
    });

    test("should be a positive integer", (): void => {
      expect(Number.isInteger(navigation.DEFAULT_TRANSACTION_LIMIT)).toBe(true);
      expect(navigation.DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0);
    });

  describe("NAV_ICON_SIZE", (): void => {
    test("should be defined and equal to 24", (): void => {
      expect(navigation.NAV_ICON_SIZE).toBeDefined();
      expect(typeof navigation.NAV_ICON_SIZE).toBe("number");
      expect(navigation.NAV_ICON_SIZE).toBe(24);
    });

    test("should be a positive integer", (): void => {
      expect(Number.isInteger(navigation.NAV_ICON_SIZE)).toBe(true);
      expect(navigation.NAV_ICON_SIZE).toBeGreaterThan(0);
    });

  describe("DEFAULT_PAGINATION_PAGE_NUMBER", (): void => {
    test('should be defined and equal to "1"', (): void => {
      expect(navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBeDefined();
      expect(typeof navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBe("string");
      expect(navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBe("1");
      expect(navigation.DEFAULT_PAGINATION_PAGE_NUMBER.length).toBeGreaterThan(
        0,
      );
    });

    test("should represent a valid positive integer when parsed", (): void => {
      const parsed: number = Number.parseInt(
        navigation.DEFAULT_PAGINATION_PAGE_NUMBER,
        10,
      );
      expect(Number.isNaN(parsed)).toBe(false);
      expect(parsed).toBe(1);
      expect(parsed).toBeGreaterThanOrEqual(1);
    });

  describe("Runtime exports", (): void => {
    test("should only export runtime constants (const enums are type-only and not exported at runtime)", (): void => {
      const exportKeys: string[] = Object.keys(navigation).sort();
      expect(exportKeys).toEqual(
        [
          "DEFAULT_PAGINATION_PAGE_NUMBER",
          "DEFAULT_TRANSACTION_LIMIT",
          "NAV_ICON_SIZE",
        ].sort(),
      );
    });

    test("should not expose const enums at runtime", (): void => {
      const mod = navigation as Record<string, unknown>;
      expect(mod.NAV_TITLE).toBeUndefined();
      expect(mod.SEARCH_PARAM).toBeUndefined();
    });
