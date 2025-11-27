import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock an external dependency (not used by the module, but demonstrates mocking setup)
vi.mock('node:path', () => ({
  join: vi.fn(),
}));


  afterEach(() : void => {
    vi.clearAllMocks();
    vi.resetModules();
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

