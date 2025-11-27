import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/config/constants/navigation', (): Record<string, unknown> => ({
  NAV_TITLE: { EXPORT: 'Export' },
}));

vi.mock('../lib/actions', (): Record<string, unknown> => ({
  getCachedAllTransactions: vi.fn(),
  getCachedAuthSession: vi.fn(),
  getTransactionsForExport: vi.fn(),
}));

vi.mock('../ui/home/export-transactions', (): Record<string, unknown> => ({
  default: function ExportTransactions(): unknown {
    return null;
  },
}));

vi.mock('../ui/no-transactions-plug', (): Record<string, unknown> => ({
  default: function NoTransactionsPlug(): unknown {
    return null;
  },
}));

vi.mock('../ui/sidebar/with-sidebar', (): Record<string, unknown> => ({
  default: function WithSidebar(): unknown {
    return null;
  },
}));

import Page, { metadata } from './page';
import ExportTransactions from '../ui/home/export-transactions';
import NoTransactionsPlug from '../ui/no-transactions-plug';
import {
  getCachedAllTransactions,
  getCachedAuthSession,
  getTransactionsForExport,
} from '../lib/actions';

type ReactElementLike = {
  type: unknown;
  props?: Record<string, unknown>;
};

function isElementLike(value: unknown): value is ReactElementLike {
  return typeof value === 'object' && value !== null && 'type' in (value as Record<string, unknown>);
}

function getChildren(element: ReactElementLike): unknown[] {
  const props = element.props ?? {};
  const children = props.children;
  if (Array.isArray(children)) return children;
  if (children === undefined || children === null) return [];
  return [children];
}

function findElementByType(root: unknown, targetType: unknown): ReactElementLike | undefined {
  if (!isElementLike(root)) return undefined;
  if (root.type === targetType) return root;

  for (const child of getChildren(root)) {
    const found = findElementByType(child, targetType);
    if (found) return found;
  }
  return undefined;
}

describe('Page', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks();
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  test('metadata has correct title', (): void => {
    expect(metadata.title).toBe('Export');
  });

    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const element = await Page();
    expect(isElementLike(element)).toBe(true);
    if (!isElementLike(element)) return;

    const content = element.props?.contentNearby as unknown;
    expect(isElementLike(content)).toBe(true);
    if (!isElementLike(content)) return;

    const noTx = findElementByType(content, NoTransactionsPlug);
    const exportTx = findElementByType(content, ExportTransactions);
    expect(noTx).toBeDefined();
    expect(exportTx).toBeUndefined();

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com');
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com');
  });


    (getCachedAuthSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: userId },
    });
    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(transactions);

    const exportedData = [{ id: 'exp-1' }, { id: 'exp-2' }];
    (getTransactionsForExport as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(exportedData);

    const element = await Page();
    expect(isElementLike(element)).toBe(true);
    if (!isElementLike(element)) return;

    const content = element.props?.contentNearby as unknown;
    expect(isElementLike(content)).toBe(true);
    if (!isElementLike(content)) return;

    const exportTxEl = findElementByType(content, ExportTransactions);
    expect(exportTxEl).toBeDefined();
    if (!exportTxEl) return;

    const props = exportTxEl.props ?? {};
    expect(props.transactions).toBe(transactions);

    const onExport = props.onExport as unknown;
    expect(typeof onExport).toBe('function');

    const result = await (onExport as (s?: Date, e?: Date) => Promise<unknown[]> )();
    expect(getTransactionsForExport).toHaveBeenCalledTimes(1);
    expect(getTransactionsForExport).toHaveBeenCalledWith(userId, undefined, undefined);
    expect(result).toBe(exportedData);
  });


    (getCachedAuthSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: userId },
    });
    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(transactions);

    const exportedData = [{ id: 'exp-1' }];
    (getTransactionsForExport as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(exportedData);

    const element = await Page();
    expect(isElementLike(element)).toBe(true);
    if (!isElementLike(element)) return;

    const content = element.props?.contentNearby as unknown;
    expect(isElementLike(content)).toBe(true);
    if (!isElementLike(content)) return;

    const exportTxEl = findElementByType(content, ExportTransactions);
    expect(exportTxEl).toBeDefined();
    if (!exportTxEl) return;

    const onExport = (exportTxEl.props as Record<string, unknown>).onExport as unknown;
    expect(typeof onExport).toBe('function');

    const startDate = new Date('2023-01-01T00:00:00.000Z');
    const endDate = new Date('2023-12-31T23:59:59.000Z');

    const result = await (onExport as (s?: Date, e?: Date) => Promise<unknown[]>)(startDate, endDate);
    expect(getTransactionsForExport).toHaveBeenCalledTimes(1);
    expect(getTransactionsForExport).toHaveBeenCalledWith(userId, startDate, endDate);
    expect(result).toBe(exportedData);
  });

    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const element = await Page();
    expect(isElementLike(element)).toBe(true);
    if (!isElementLike(element)) return;

    const content = element.props?.contentNearby as unknown;
    expect(isElementLike(content)).toBe(true);
    if (!isElementLike(content)) return;

    const noTx = findElementByType(content, NoTransactionsPlug);
    const exportTx = findElementByType(content, ExportTransactions);
    expect(noTx).toBeDefined();
    expect(exportTx).toBeUndefined();

    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, undefined);
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(2, undefined);
  });

      .mockRejectedValueOnce(new Error('session-fail'));

    await expect(Page()).rejects.toThrow('session-fail');
    expect(getCachedAllTransactions).not.toHaveBeenCalled();
  });


    // First call (non-awaited) resolves, second (awaited) rejects
    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error('transactions-fail'));

    await expect(Page()).rejects.toThrow('transactions-fail');
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
  });
});
