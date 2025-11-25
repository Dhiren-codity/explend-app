import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  DEFAULT_TRANSACTION_LIMIT,
  NAV_ICON_SIZE,
  DEFAULT_PAGINATION_PAGE_NUMBER,
} from "./navigation";

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

  describe("DEFAULT_TRANSACTION_LIMIT", () => {
    test("should be 30", (): void => {
      expect(DEFAULT_TRANSACTION_LIMIT).toBe(30);
      expect(typeof DEFAULT_TRANSACTION_LIMIT).toBe("number");
      expect(Number.isInteger(DEFAULT_TRANSACTION_LIMIT)).toBe(true);
      expect(DEFAULT_TRANSACTION_LIMIT).toBeGreaterThan(0);
    });

    test("should be a read-only export (cannot be reassigned on module namespace)", async (): Promise<void> => {
      const mod = await import("./navigation");
      expect(typeof mod).toBe("object");
      expect(() => {
        (mod as Record<string, unknown>)["DEFAULT_TRANSACTION_LIMIT"] = 999;
      }).toThrow(TypeError);
      expect(mod.DEFAULT_TRANSACTION_LIMIT).toBe(30);
    });
  });

  describe("NAV_ICON_SIZE", () => {
    test("should be 24", (): void => {
      expect(NAV_ICON_SIZE).toBe(24);
      expect(typeof NAV_ICON_SIZE).toBe("number");
      expect(Number.isInteger(NAV_ICON_SIZE)).toBe(true);
      expect(NAV_ICON_SIZE).toBeGreaterThan(0);
    });

    test("should be a read-only export (cannot be reassigned on module namespace)", async (): Promise<void> => {
      const mod = await import("./navigation");
      expect(typeof mod).toBe("object");
      expect(() => {
        (mod as Record<string, unknown>)["NAV_ICON_SIZE"] = 100;
      }).toThrow(TypeError);
      expect(mod.NAV_ICON_SIZE).toBe(24);
    });
  });

  describe("DEFAULT_PAGINATION_PAGE_NUMBER", () => {
    test('should be "1" as a string', (): void => {
      expect(DEFAULT_PAGINATION_PAGE_NUMBER).toBe("1");
      expect(typeof DEFAULT_PAGINATION_PAGE_NUMBER).toBe("string");
      expect(Number.parseInt(DEFAULT_PAGINATION_PAGE_NUMBER, 10)).toBe(1);
    });

    test("should be a read-only export (cannot be reassigned on module namespace)", async (): Promise<void> => {
      const mod = await import("./navigation");
      expect(typeof mod).toBe("object");
      expect(() => {
        (mod as Record<string, unknown>)["DEFAULT_PAGINATION_PAGE_NUMBER"] =
          "2";
      }).toThrow(TypeError);
      expect(mod.DEFAULT_PAGINATION_PAGE_NUMBER).toBe("1");
    });
  });

  describe("Runtime exports and const enums", () => {
    test("should only export runtime constants and not const enums", async (): Promise<void> => {
      const mod = await import("./navigation");
      const keys = Object.keys(mod).sort();
      expect(keys).toEqual(
        [
          "DEFAULT_PAGINATION_PAGE_NUMBER",
          "DEFAULT_TRANSACTION_LIMIT",
          "NAV_ICON_SIZE",
        ].sort(),
      );
      expect(Object.prototype.hasOwnProperty.call(mod, "NAV_TITLE")).toBe(
        false,
      );
      expect(Object.prototype.hasOwnProperty.call(mod, "SEARCH_PARAM")).toBe(
        false,
      );
      expect((mod as Record<string, unknown>)["NAV_TITLE"]).toBeUndefined();
      expect((mod as Record<string, unknown>)["SEARCH_PARAM"]).toBeUndefined();
    });
  });
});
