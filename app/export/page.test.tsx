import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';


vi.mock('@/config/constants/navigation', () => {
  return {
    __esModule: true,
    NAV_TITLE: {
      EXPORT: 'Export',
    },
  };
});

vi.mock('../ui/sidebar/with-sidebar', () => {
  withSidebarMock = vi.fn((_props: Record<string, unknown>): null => null);
  return {
    __esModule: true,
    default: withSidebarMock,
  };
});

vi.mock('../ui/home/export-transactions', () => {
  exportTransactionsMock = vi.fn((_props: Record<string, unknown>): null => null);
  return {
    __esModule: true,
    default: exportTransactionsMock,
  };
});

vi.mock('../ui/no-transactions-plug', () => {
  noTransactionsPlugMock = vi.fn((): null => null);
  return {
    __esModule: true,
    default: noTransactionsPlugMock,
  };
});

vi.mock('../lib/actions', () => {
  return {
    __esModule: true,
    getCachedAllTransactions: vi.fn(),
    getCachedAuthSession: vi.fn(),
    getTransactionsForExport: vi.fn(),
  };
});

import Page, { metadata } from './page';
import {
  getCachedAllTransactions,
  getCachedAuthSession,
  getTransactionsForExport,
} from '../lib/actions';

describe('app/export/page.tsx - Page', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks();
    (getCachedAuthSession as unknown as { mockResolvedValue: unknown }).mockResolvedValue({
      user: { email: 'user@example.com' },
    });
    (getCachedAllTransactions as unknown as { mockResolvedValue: unknown }).mockResolvedValue([
      { id: 't1' },
    ]);
    (getTransactionsForExport as unknown as { mockResolvedValue: unknown }).mockResolvedValue([
      { id: 'e1' },
    ]);
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  test('metadata.title should equal NAV_TITLE.EXPORT', (): void => {
    expect(metadata.title).toBe('Export');
  });

  test('renders ExportTransactions when there are transactions and wires onExport', async (): Promise<void> => {
    const result = await Page();

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect((getCachedAllTransactions as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0]).toBe('user@example.com');
    expect((getCachedAllTransactions as unknown as { mock: { calls: unknown[][] } }).mock.calls[1][0]).toBe('user@example.com');

    const expectedWithSidebar = withSidebarMock as unknown;
    const element = result as unknown as { type: unknown; props: Record<string, unknown> };
    expect(element.type).toBe(expectedWithSidebar);

    const content = element.props.contentNearby as unknown as { type: unknown; props: Record<string, unknown> };
    const fragmentChildren = content.props.children as unknown as unknown[];

    const heading = fragmentChildren[0] as { type: unknown; props: Record<string, unknown> };
    expect(heading.type).toBe('h1');
    expect(heading.props.children).toBe('Export');

    const container = fragmentChildren[1] as { type: unknown; props: Record<string, unknown> };
    expect(container.type).toBe('div');

    const exportElem = container.props.children as { type: unknown; props: Record<string, unknown> };
    expect(exportElem.type).toBe(exportTransactionsMock);

    const startDate = new Date('2020-01-01T00:00:00.000Z');
    const endDate = new Date('2020-12-31T00:00:00.000Z');
    const onExport = exportElem.props.onExport as (s?: Date, e?: Date) => Promise<unknown>;
    const exported = await onExport(startDate, endDate);

    expect(getTransactionsForExport).toHaveBeenCalledTimes(1);
    const callArgs = (getTransactionsForExport as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    expect(callArgs[0]).toBe('user@example.com');
    expect(callArgs[1]).toBe(startDate);
    expect(callArgs[2]).toBe(endDate);
    expect(exported).toEqual([{ id: 'e1' }]);
  });

  test('onExport without dates should pass undefineds', async (): Promise<void> => {
    (getCachedAllTransactions as unknown as { mockResolvedValue: unknown }).mockResolvedValue([{ id: 'only' }]);

    const result = await Page();
    const element = result as unknown as { props: Record<string, unknown> };
    const content = element.props.contentNearby as unknown as { props: Record<string, unknown> };
    const fragmentChildren = content.props.children as unknown as unknown[];
    const container = fragmentChildren[1] as { props: Record<string, unknown> };
    const exportElem = container.props.children as { props: Record<string, unknown> };

    const onExport = exportElem.props.onExport as (s?: Date, e?: Date) => Promise<unknown>;
    await onExport();

    const callArgs = (getTransactionsForExport as unknown as { mock: { calls: unknown[][] } }).mock.calls.pop() as unknown[];
    expect(callArgs[0]).toBe('user@example.com');
    expect(callArgs[1]).toBeUndefined();
    expect(callArgs[2]).toBeUndefined();
  });

  test('renders NoTransactionsPlug when there are no transactions', async (): Promise<void> => {
    (getCachedAllTransactions as unknown as { mockResolvedValue: unknown }).mockResolvedValue([]);

    const result = await Page();

    const element = result as unknown as { type: unknown; props: Record<string, unknown> };
    expect(element.type).toBe(withSidebarMock);

    const content = element.props.contentNearby as unknown as { props: Record<string, unknown> };
    const fragmentChildren = content.props.children as unknown as unknown[];
    const container = fragmentChildren[1] as { type: unknown; props: Record<string, unknown> };
    expect(container.type).toBe('div');
    const plugElem = container.props.children as { type: unknown };
    expect(plugElem.type).toBe(noTransactionsPlugMock);
  });

  test('handles undefined session (no userId) and still renders ExportTransactions', async (): Promise<void> => {
    (getCachedAuthSession as unknown as { mockResolvedValue: unknown }).mockResolvedValue(undefined);
    (getCachedAllTransactions as unknown as { mockResolvedValue: unknown }).mockResolvedValue([{ id: 'a' }]);

    const result = await Page();

    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
    const calls = (getCachedAllTransactions as unknown as { mock: { calls: unknown[][] } }).mock.calls;
    expect(calls[0][0]).toBeUndefined();
    expect(calls[1][0]).toBeUndefined();

    const element = result as unknown as { props: Record<string, unknown> };
    const content = element.props.contentNearby as unknown as { props: Record<string, unknown> };
    const fragmentChildren = content.props.children as unknown as unknown[];
    const container = fragmentChildren[1] as { props: Record<string, unknown> };
    const exportElem = container.props.children as { type: unknown; props: Record<string, unknown> };
    expect(exportElem.type).toBe(exportTransactionsMock);

    const onExport = exportElem.props.onExport as (s?: Date, e?: Date) => Promise<unknown>;
    await onExport();

    const exportCall = (getTransactionsForExport as unknown as { mock: { calls: unknown[][] } }).mock.calls.pop() as unknown[];
    expect(exportCall[0]).toBeUndefined();
  });

  test('propagates error when getCachedAuthSession fails on awaited call', async (): Promise<void> => {
    (getCachedAuthSession as unknown as { mockResolvedValueOnce: unknown; mockRejectedValueOnce: unknown })
      .mockResolvedValueOnce({ user: { email: 'x@example.com' } })
      .mockRejectedValueOnce(new Error('auth failed'));

    await expect(Page()).rejects.toThrow('auth failed');
  });

  test('propagates error when getCachedAllTransactions fails on awaited call', async (): Promise<void> => {
    (getCachedAuthSession as unknown as { mockResolvedValue: unknown }).mockResolvedValue({ user: { email: 'u@example.com' } });
    (getCachedAllTransactions as unknown as { mockResolvedValueOnce: unknown; mockRejectedValueOnce: unknown })
      .mockResolvedValueOnce([{ id: 'p' }])
      .mockRejectedValueOnce(new Error('transactions failed'));

    await expect(Page()).rejects.toThrow('transactions failed');
  });

  test('onExport propagates errors from getTransactionsForExport', async (): Promise<void> => {
    (getCachedAllTransactions as unknown as { mockResolvedValue: unknown }).mockResolvedValue([{ id: 'p' }]);
    (getTransactionsForExport as unknown as { mockRejectedValue: unknown }).mockRejectedValue(new Error('export failed'));

    const result = await Page();
    const element = result as unknown as { props: Record<string, unknown> };
    const content = element.props.contentNearby as unknown as { props: Record<string, unknown> };
    const fragmentChildren = content.props.children as unknown as unknown[];
    const container = fragmentChildren[1] as { props: Record<string, unknown> };
    const exportElem = container.props.children as { props: Record<string, unknown> };

    const onExport = exportElem.props.onExport as (s?: Date, e?: Date) => Promise<unknown>;
    await expect(onExport(new Date(), new Date())).rejects.toThrow('export failed');
  });
});
