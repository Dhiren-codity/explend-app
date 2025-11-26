import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import * as navigation from "config/constants/navigation";

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
}));

describe("config/constants/navigation", () => {
  beforeEach((): void => {
    // No setup required for constants
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  describe("exports", () => {
    test("should export only the expected runtime constants", (): void => {
      const exportedKeys = Object.keys(navigation).sort();
      const expectedKeys = [
        "DEFAULT_PAGINATION_PAGE_NUMBER",
        "DEFAULT_TRANSACTION_LIMIT",
        "NAV_ICON_SIZE",
      ].sort();
      expect(exportedKeys).toStrictEqual(expectedKeys);
    });

    test("should not export const enums at runtime", (): void => {
      expect("NAV_TITLE" in navigation).toBe(false);
      expect("SEARCH_PARAM" in navigation).toBe(false);
    });
  });

  describe("DEFAULT_TRANSACTION_LIMIT", () => {
    test("should be a number with value 30", (): void => {
      expect(typeof navigation.DEFAULT_TRANSACTION_LIMIT).toBe("number");
      expect(navigation.DEFAULT_TRANSACTION_LIMIT).toBe(30);
    });

    test("should be read-only on the module namespace", (): void => {
      const descriptor = Object.getOwnPropertyDescriptor(
        navigation,
        "DEFAULT_TRANSACTION_LIMIT",
      );
      expect(descriptor?.writable).toBe(false);
      expect(descriptor?.configurable).toBe(false);
      const ns = navigation as unknown as Record<string, unknown>;
      expect(() => {
        ns["DEFAULT_TRANSACTION_LIMIT"] = 999;
      }).toThrow(TypeError);
      expect(navigation.DEFAULT_TRANSACTION_LIMIT).toBe(30);
    });
  });

  describe("NAV_ICON_SIZE", () => {
    test("should be a number with value 24", (): void => {
      expect(typeof navigation.NAV_ICON_SIZE).toBe("number");
      expect(navigation.NAV_ICON_SIZE).toBe(24);
    });

    test("should be read-only on the module namespace", (): void => {
      const descriptor = Object.getOwnPropertyDescriptor(
        navigation,
        "NAV_ICON_SIZE",
      );
      expect(descriptor?.writable).toBe(false);
      expect(descriptor?.configurable).toBe(false);
      const ns = navigation as unknown as Record<string, unknown>;
      expect(() => {
        ns["NAV_ICON_SIZE"] = 100;
      }).toThrow(TypeError);
      expect(navigation.NAV_ICON_SIZE).toBe(24);
    });
  });

  describe("DEFAULT_PAGINATION_PAGE_NUMBER", () => {
    test('should be a string with value "1"', (): void => {
      expect(typeof navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBe("string");
      expect(navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBe("1");
    });

    test("should be read-only on the module namespace", (): void => {
      const descriptor = Object.getOwnPropertyDescriptor(
        navigation,
        "DEFAULT_PAGINATION_PAGE_NUMBER",
      );
      expect(descriptor?.writable).toBe(false);
      expect(descriptor?.configurable).toBe(false);
      const ns = navigation as unknown as Record<string, unknown>;
      expect(() => {
        ns["DEFAULT_PAGINATION_PAGE_NUMBER"] = "2";
      }).toThrow(TypeError);
      expect(navigation.DEFAULT_PAGINATION_PAGE_NUMBER).toBe("1");
    });
  });
});
