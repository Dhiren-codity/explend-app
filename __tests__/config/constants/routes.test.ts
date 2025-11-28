import { describe, test, expect, vi } from 'vitest';
import * as routesModule from './routes';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function parseRoutesSource() {
  const sourcePath = fileURLToPath(new URL('./routes.ts', import.meta.url));
  const src = readFileSync(sourcePath, 'utf8');

  const enumMatch = src.match(/export\s+const\s+enum\s+ROUTE\s*\{([\s\S]*?)\}/);
  if (!enumMatch) {
    throw new Error('ROUTE enum not found in routes.ts');
  }
  const body = enumMatch[1];

  const entries = [...body.matchAll(/([A-Z_]+)\s*=\s*'([^']+)'/g)];
  const map = new Map(entries.map(([, key, value]) => [key, value]));
  const keys = Array.from(map.keys());
  const values = Array.from(map.values());

  return { map, keys, values, source: src };
}

function validateDisabledRoutes(list, allowedSet) {
  if (!Array.isArray(list)) {
    throw new TypeError('DISABLED_ROUTES must be an array');
  }
  const seen = new Set();
  for (const r of list) {
    if (typeof r !== 'string') {
      throw new TypeError('All disabled routes must be strings');
    }
    if (!allowedSet.has(r)) {
      throw new RangeError(`Disabled route not in ROUTE enum: ${r}`);
    }
    if (seen.has(r)) {
      throw new Error(`Duplicate disabled route: ${r}`);
    }
    seen.add(r);
  }
  return true;
}

describe('config/constants/routes.ts', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });


    // Expected key -> value pairs
    const expected = {
      HOME: '/',
      SIGNIN: '/sign-in',
      MONTHLY_REPORT: '/monthly-report',
      CHART: '/chart',
      LIMITS: '/limits',
      SUBSCRIPTIONS: '/subscriptions',
      CATEGORIES: '/categories',
      EXPORT: '/export',
      SETTINGS: '/settings',
      FEEDBACK: '/feedback',
      ISSUE: '/issue',
      SITEMAP: '/sitemap.xml',
      DISABLED_ROUTE: '/disabled-route',
    };

    // Exact keys and values
    expect(keys.sort()).toEqual(Object.keys(expected).sort());
    for (const [k, v] of Object.entries(expected)) {
      expect(map.get(k)).toBe(v);
    }

    // All values are unique and start with "/"
    expect(new Set(values).size).toBe(values.length);
    for (const v of values) {
      expect(typeof v).toBe('string');
      expect(v.startsWith('/')).toBe(true);
      expect(v.trim()).toBe(v);
      expect(v.includes('//')).toBe(false);
    }
  });

  test(async () => {
    expect(Object.prototype.hasOwnProperty.call(routesModule, 'DISABLED_ROUTES')).toBe(true);
    expect(Array.isArray(routesModule.DISABLED_ROUTES)).toBe(true);
    expect(routesModule.DISABLED_ROUTES).toHaveLength(0);
  });

    const allowedSet = new Set(values);

    for (const route of routesModule.DISABLED_ROUTES) {
      expect(allowedSet.has(route)).toBe(true);
    }
  });

    const allowedSet = new Set(values);
    const sample = values.slice(0, 3); // take a few valid routes
    expect(validateDisabledRoutes(sample, allowedSet)).toBe(true);
  });

    const allowedSet = new Set(values);

    expect(() => validateDisabledRoutes(['/not-exists'], allowedSet)).toThrow(RangeError);
    expect(() => validateDisabledRoutes([values[0], values[0]], allowedSet)).toThrow(Error);
    // @ts-ignore - intentionally pass non-string
    expect(() => validateDisabledRoutes([values[0], 123], allowedSet)).toThrow(TypeError);
    // @ts-ignore - intentionally pass non-array
    expect(() => validateDisabledRoutes('not-an-array', allowedSet)).toThrow(TypeError);
  });

    const allowedSet = new Set(values);

    vi.resetModules();
    vi.mock('./routes', () => {
      return {
        DISABLED_ROUTES: ['/not-exists', '/also-bad'],
      };
    });

    const mocked = await import('./routes');
    expect(Array.isArray(mocked.DISABLED_ROUTES)).toBe(true);
    expect(mocked.DISABLED_ROUTES).toEqual(['/not-exists', '/also-bad']);
    expect(() => validateDisabledRoutes(mocked.DISABLED_ROUTES, allowedSet)).toThrow(RangeError);

    vi.unmock('./routes');
    vi.resetModules();
  });
});
