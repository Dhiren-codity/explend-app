import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import * as routesModule from "./routes";
import type { ROUTE } from "./routes";

describe("config/constants/routes", () => {
  let originalSnapshot: ROUTE[];

  beforeEach((): void => {
    // Snapshot the original array values so we can restore after each test
    originalSnapshot = [...(routesModule.DISABLED_ROUTES as ROUTE[])];
  });

  afterEach((): void => {
    // Restore DISABLED_ROUTES to its original state
    routesModule.DISABLED_ROUTES.splice(0, routesModule.DISABLED_ROUTES.length);
    for (const r of originalSnapshot) {
      routesModule.DISABLED_ROUTES.push(r);
    }
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("ROUTE const enum", () => {
    test("should not exist as a runtime export (const enum is erased at runtime)", async (): Promise<void> => {
      const moduleObj = await import("./routes");
      const exportedKeys = Object.keys(moduleObj);
      expect(exportedKeys.includes("ROUTE")).toBe(false);
      expect((moduleObj as Record<string, unknown>).ROUTE).toBeUndefined();
    });

    test("should allow using known literals via ROUTE type and retain string values at runtime", (): void => {
      const homeRoute = "/" as unknown as ROUTE;
      const addedLength = routesModule.DISABLED_ROUTES.push(homeRoute);
      expect(addedLength).toBe(originalSnapshot.length + 1);
      expect(
        routesModule.DISABLED_ROUTES.includes("/" as unknown as ROUTE),
      ).toBe(true);
    });
  });

  describe("DISABLED_ROUTES constant", () => {
    test("should be an array and initially empty", (): void => {
      expect(Array.isArray(routesModule.DISABLED_ROUTES)).toBe(true);
      expect(routesModule.DISABLED_ROUTES.length).toBe(0);
    });

    test("should be mutable (allow push and pop)", (): void => {
      const disabledRoute = "/disabled-route" as unknown as ROUTE;
      const prevLength = routesModule.DISABLED_ROUTES.length;
      const newLength = routesModule.DISABLED_ROUTES.push(disabledRoute);
      expect(newLength).toBe(prevLength + 1);
      expect(
        routesModule.DISABLED_ROUTES[routesModule.DISABLED_ROUTES.length - 1],
      ).toBe("/disabled-route");

      const popped = routesModule.DISABLED_ROUTES.pop();
      expect(popped).toBe("/disabled-route");
      expect(routesModule.DISABLED_ROUTES.length).toBe(prevLength);
    });

    test("should contain only values explicitly added", (): void => {
      expect(
        routesModule.DISABLED_ROUTES.includes(
          "/non-existent" as unknown as ROUTE,
        ),
      ).toBe(false);
      const toAdd = "/settings" as unknown as ROUTE;
      routesModule.DISABLED_ROUTES.push(toAdd);
      expect(
        routesModule.DISABLED_ROUTES.includes("/settings" as unknown as ROUTE),
      ).toBe(true);
    });
  });

  describe("Module mocking with vi.mock", () => {
    test("should allow mocking DISABLED_ROUTES for consumer code", async (): Promise<void> => {
      await new Promise<void>((resolve, reject) => {
        vi.isolateModules(() => {
          try {
            vi.mock("./routes", () => ({
              DISABLED_ROUTES: ["/settings"] as unknown as ROUTE[],
            }));

            import("./routes")
              .then((mocked) => {
                expect(Array.isArray(mocked.DISABLED_ROUTES)).toBe(true);
                expect(mocked.DISABLED_ROUTES).toEqual(["/settings"]);
                resolve();
              })
              .catch((err: unknown) => reject(err as Error));
          } catch (err: unknown) {
            reject(err as Error);
          }
        });
      });
    });
  });
});
