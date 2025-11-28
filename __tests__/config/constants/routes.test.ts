import { describe, test, expect, vi } from 'vitest';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promises as fs } from 'node:fs';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const filePath = path.resolve(process.cwd(), 'config/constants/routes.ts');
const fileUrl = pathToFileURL(filePath).href;

describe('config/constants/routes.ts', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

    expect(enumBlockMatch).toBeTruthy();

    const enumBody = enumBlockMatch ? enumBlockMatch[1] : '';
    const re = /([A-Z_]+)\s*=\s*['"]([^'"]+)['"]\s*,?/g;

    const found = {};
    let m;
    while ((m = re.exec(enumBody)) !== null) {
      found[m[1]] = m[2];
    }

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

    expect(found).toEqual(expected);

    // sanity check: every value should start with a forward slash
    Object.values(found).forEach((v) => {
      expect(v.startsWith('/')).toBe(true);
    });
  });

  test('exports DISABLED_ROUTES as an empty array', async () => {
    const mod = await import(fileUrl);
    expect(Array.isArray(mod.DISABLED_ROUTES)).toBe(true);
    expect(mod.DISABLED_ROUTES.length).toBe(0);
  });

  test('ROUTE const enum is not available at runtime export (const enum erased)', async () => {
    const mod = await import(fileUrl);
    expect(mod.ROUTE).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(mod, 'ROUTE')).toBe(false);
  });

  test('DISABLED_ROUTES can be mutated at runtime (ensure test cleans up)', async () => {
    const mod = await import(fileUrl);
    const originalLength = mod.DISABLED_ROUTES.length;

    try {
      mod.DISABLED_ROUTES.push('/disabled-route');
      expect(mod.DISABLED_ROUTES.length).toBe(originalLength + 1);
      expect(mod.DISABLED_ROUTES.includes('/disabled-route')).toBe(true);
    } finally {
      // cleanup: restore original state
      mod.DISABLED_ROUTES.length = originalLength;
      expect(mod.DISABLED_ROUTES.length).toBe(originalLength);
    }
  });
});
