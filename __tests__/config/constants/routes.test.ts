import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock an external dependency (not used by the module, but demonstrates mocking setup)
vi.mock('node:path', () => ({
  join: vi.fn(),
}));

describe('config/constants/routes', () : void => {
  beforeEach(() : void => {
    vi.resetModules();
  });

  afterEach(() : void => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('DISABLED_ROUTES', () : void => {
      const disabled = mod.DISABLED_ROUTES;
      expect(Array.isArray(disabled)).toBe(true);
      const list = disabled as unknown[];
      expect(list).toHaveLength(0);
    });

      const list = firstImport.DISABLED_ROUTES as unknown[];
      list.push('/disabled-route');
      expect(list).toContain('/disabled-route');
      expect(list).toHaveLength(1);

      vi.resetModules();

      const secondImport = (await import('./routes')) as unknown as {
        DISABLED_ROUTES: unknown;
      };
      const freshList = secondImport.DISABLED_ROUTES as unknown[];
      expect(Array.isArray(freshList)).toBe(true);
      expect(freshList).toHaveLength(0);
    });

    test('should not allow reassigning the exported binding', async () : Promise<void> => {
      const mod = (await import('./routes')) as unknown as Record<string, unknown>;
      expect(() : void => {
        // Attempt to reassign the ESM namespace export, which should throw
        (mod as Record<string, unknown>).DISABLED_ROUTES = [];
      }).toThrow();
    });
  });

  describe('ROUTE (const enum)', () : void => {
      expect('ROUTE' in mod).toBe(false);
      expect(mod.ROUTE).toBeUndefined();
    });
  });
});
