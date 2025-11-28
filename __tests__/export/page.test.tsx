import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import Page, { metadata } from './page';
import { getCachedAllTransactions, getCachedAuthSession, getTransactionsForExport } from '../lib/actions';
import WithSidebarMock from '../ui/sidebar/with-sidebar';
import ExportTransactionsMock from '../ui/home/export-transactions';

vi.mock('@/config/constants/navigation', () => {
  return {
    NAV_TITLE: { EXPORT: 'Export' },
  };
});

vi.mock('../lib/actions', () => {
  return {
    getCachedAllTransactions: vi.fn(),
    getCachedAuthSession: vi.fn(),
    getTransactionsForExport: vi.fn(),
  };
});

vi.mock('../ui/sidebar/with-sidebar', () => {
  return {
    default: vi.fn((props: { contentNearby: unknown }) =>
      React.createElement('mock-with-sidebar', props),
    ),
  };
});

vi.mock('../ui/no-transactions-plug', () => {
  return {
    default: vi.fn(() => React.createElement('mock-no-transactions-plug', {})),
  };
});

vi.mock('../ui/home/export-transactions', () => {
  return {
    default: vi.fn((props: Record<string, unknown>) =>
      React.createElement('mock-export-transactions', props),
    ),
  };
});

describe('Page (app/export/page.tsx)', (): void => {
  const toElement = (node: unknown): { type: unknown; props: Record<string, unknown> } => {
    return node as { type: unknown; props: Record<string, unknown> };
  };

  const getChildren = (node: unknown): unknown[] => {
    const el = toElement(node);
    const children = el.props?.children as unknown;
    if (Array.isArray(children)) return children as unknown[];
    if (children === undefined || children === null) return [];
    return [children];
  };

  beforeEach((): void => {
    vi.clearAllMocks();
    (getCachedAuthSession as unknown as { mockResolvedValue: (_: unknown) => unknown }).mockResolvedValue(
      { user: { email: 'user@example.com' } },
    );
    (getCachedAllTransactions as unknown as { mockResolvedValue: (_: unknown) => unknown }).mockResolvedValue([]);
    (getTransactionsForExport as unknown as { mockResolvedValue: (_: unknown) => unknown }).mockResolvedValue([]);
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  test('metadata.title should equal NAV_TITLE.EXPORT', (): void => {
    expect(metadata.title).toBe('Export');
  });

      { user: { email: 'no-tx@example.com' } },
    );
    (getCachedAllTransactions as unknown as { mockResolvedValue: (_: unknown) => unknown }).mockResolvedValue([]);

    const element = await Page();

    expect(WithSidebarMock).toHaveBeenCalledTimes(1);
    const withSidebarEl = toElement(element);
    expect(withSidebarEl.type).toBe('mock-with-sidebar');

    const contentEl = withSidebarEl.props.contentNearby as unknown;
    const fragmentChildren = getChildren(contentEl);
    const h1El = toElement(fragmentChildren[0]);
    const h1Children = getChildren(h1El);
    expect(h1Children[0]).toBe('Export');

    const secondSection = fragmentChildren[1];
    const containerChildren = getChildren(secondSection);
    const innerEl = toElement(containerChildren[0]);
    expect(innerEl.type).toBe('mock-no-transactions-plug');

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, 'no-tx@example.com');
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(2, 'no-tx@example.com');
  });

    (getCachedAuthSession as unknown as { mockResolvedValue: (_: unknown) => unknown }).mockResolvedValue(
      { user: { email: userEmail } },
    );
    (getCachedAllTransactions as unknown as { mockResolvedValue: (_: unknown) => unknown }).mockResolvedValue(
      transactions,
    );

    const element = await Page();

    expect(WithSidebarMock).toHaveBeenCalledTimes(1);
    const withSidebarEl = toElement(element);
    expect(withSidebarEl.type).toBe('mock-with-sidebar');
    const contentEl = withSidebarEl.props.contentNearby as unknown;

    const fragmentChildren = getChildren(contentEl);
    const secondSection = fragmentChildren[1];
    const containerChildren = getChildren(secondSection);
    const exportEl = toElement(containerChildren[0]);

    expect(exportEl.type).toBe('mock-export-transactions');
    const exportProps = exportEl.props as Record<string, unknown>;
    expect(exportProps.transactions).toEqual(transactions);
    expect(typeof exportProps.onExport).toBe('function');

    const start = new Date('2020-01-01T00:00:00.000Z');
    const end = new Date('2020-02-02T00:00:00.000Z');
    const exported = [{ id: 'e1' }, { id: 'e2' }];
    (getTransactionsForExport as unknown as { mockResolvedValue: (_: unknown) => unknown }).mockResolvedValue(
      exported,
    );

    const onExport = exportProps.onExport as (startDate?: Date, endDate?: Date) => Promise<unknown>;
    const result = await onExport(start, end);

    expect(getTransactionsForExport).toHaveBeenCalledTimes(1);
    expect(getTransactionsForExport).toHaveBeenCalledWith(userEmail, start, end);
    expect(result).toEqual(exported);

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
  });

      { user: { email: userEmail } },
    );
    (getCachedAllTransactions as unknown as { mockResolvedValue: (_: unknown) => unknown }).mockResolvedValue(
      [{ id: 'only' }],
    );

    const element = await Page();
    const withSidebarEl = toElement(element);
    const contentEl = withSidebarEl.props.contentNearby as unknown;
    const fragmentChildren = getChildren(contentEl);
    const secondSection = fragmentChildren[1];
    const containerChildren = getChildren(secondSection);
    const exportEl = toElement(containerChildren[0]);
    const exportProps = exportEl.props as Record<string, unknown>;
    const onExport = exportProps.onExport as (startDate?: Date, endDate?: Date) => Promise<unknown>;

    const start = new Date('2021-01-01T00:00:00.000Z');
    const end = new Date('2021-02-01T00:00:00.000Z');
    const err = new Error('export failed');
    (getTransactionsForExport as unknown as { mockRejectedValue: (_: unknown) => unknown }).mockRejectedValue(err);

    await expect(onExport(start, end)).rejects.toThrow('export failed');
    expect(getTransactionsForExport).toHaveBeenCalledWith(userEmail, start, end);
  });


    await expect(Page()).rejects.toThrow('auth fail');
    expect(getCachedAuthSession).toHaveBeenCalledTimes(1);
  });

      { user: { email: 'thrower@example.com' } },
    );
    // First call (cache prime) can be resolved; second call (awaited) throws
    (getCachedAllTransactions as unknown as { mockResolvedValueOnce: (_: unknown) => unknown }).mockResolvedValueOnce(
      [],
    );
    (getCachedAllTransactions as unknown as { mockRejectedValueOnce: (_: unknown) => unknown }).mockRejectedValueOnce(
      new Error('transactions fail'),
    );

    await expect(Page()).rejects.toThrow('transactions fail');
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
  });

    (getCachedAllTransactions as unknown as { mockResolvedValue: (_: unknown) => unknown }).mockResolvedValue([]);

    const element = await Page();

    const withSidebarEl = toElement(element);
    const contentEl = withSidebarEl.props.contentNearby as unknown;
    const fragmentChildren = getChildren(contentEl);
    const secondSection = fragmentChildren[1];
    const containerChildren = getChildren(secondSection);
    const innerEl = toElement(containerChildren[0]);

    expect(innerEl.type).toBe('mock-no-transactions-plug');
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, undefined);
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(2, undefined);
  });
});
