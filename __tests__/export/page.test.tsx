import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import Page, { metadata } from './app/export/page';
import type { Mock } from 'vitest';

vi.mock('@/config/constants/navigation', (): Record<string, unknown> => {
  return {
    NAV_TITLE: {
      EXPORT: 'Export',
    },
  };
});
vi.mock('../lib/actions', (): Record<string, unknown> => {
  const getCachedAuthSession = vi.fn();
  const getCachedAllTransactions = vi.fn();
  const getTransactionsForExport = vi.fn();
  (globalThis as unknown as Record<string, unknown>).__actionsMocks = {
    getCachedAuthSession,
    getCachedAllTransactions,
    getTransactionsForExport,
  };
  return {
    getCachedAuthSession,
    getCachedAllTransactions,
    getTransactionsForExport,
  };
});
vi.mock('../ui/home/export-transactions', (): Record<string, unknown> => {
  let lastOnExport: unknown;
  const ExportTransactions = (props: { transactions: unknown[]; onExport: unknown }): JSX.Element => {
    lastOnExport = props.onExport;
    const transactionsLength = Array.isArray(props.transactions) ? String(props.transactions.length) : 'invalid';
    return React.createElement('div', { 'data-testid': 'export-transactions', 'data-transactions-length': transactionsLength });
  };
  (globalThis as unknown as Record<string, unknown>).__exportTransactions = {
    getLastOnExport: (): unknown => lastOnExport,
  };
  return {
    default: ExportTransactions,
  };
});
vi.mock('../ui/no-transactions-plug', (): Record<string, unknown> => {
  const NoTransactionsPlug = (): JSX.Element => {
    return React.createElement('div', { 'data-testid': 'no-transactions-plug' });
  };
  return { default: NoTransactionsPlug };
});
});
vi.mock('../ui/sidebar/with-sidebar', (): Record<string, unknown> => {
  const WithSidebar = ({ contentNearby }: { contentNearby: React.ReactNode }): JSX.Element => {
    return React.createElement('div', { 'data-testid': 'with-sidebar' }, contentNearby);
  };
  return { default: WithSidebar };
});
});








type ActionsMocks = {
  getCachedAuthSession: Mock;
  getCachedAllTransactions: Mock;
  getTransactionsForExport: Mock;
};

type ExportTransactionsHelper = {
  getLastOnExport: () => unknown;
};

describe('app/export/page.tsx Page', (): void => {
  let actions: ActionsMocks;
  let exportHelper: ExportTransactionsHelper;

  beforeEach((): void => {
    const globalActions = (globalThis as unknown as { __actionsMocks: ActionsMocks }).__actionsMocks;
    actions = globalActions;

    const globalExportHelper = (globalThis as unknown as { __exportTransactions: ExportTransactionsHelper }).__exportTransactions;
    exportHelper = globalExportHelper;

    actions.getCachedAuthSession.mockReset();
    actions.getCachedAllTransactions.mockReset();
    actions.getTransactionsForExport.mockReset();

    actions.getCachedAuthSession.mockResolvedValue({ user: { email: 'user@example.com' } });
    actions.getCachedAllTransactions.mockResolvedValue([]);
    actions.getTransactionsForExport.mockResolvedValue([]);
  });

  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  test('metadata has correct title', (): void => {
    expect(metadata.title).toBe('Export');
  });

  test('renders NoTransactionsPlug when there are no transactions', async (): Promise<void> => {
    actions.getCachedAllTransactions.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const element = await Page();
    render(element);

    expect(screen.getByTestId('with-sidebar')).toBeDefined();
    expect(screen.getByText('Export')).toBeDefined();
    expect(screen.getByTestId('no-transactions-plug')).toBeDefined();
    expect(screen.queryByTestId('export-transactions')).toBeNull();

    expect(actions.getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(actions.getCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect(actions.getCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com');
    expect(actions.getCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com');
  });

  test('renders ExportTransactions when transactions exist and passes onExport that calls getTransactionsForExport', async (): Promise<void> => {
    const userId = 'user@example.com';
    actions.getCachedAllTransactions.mockResolvedValueOnce([{ id: 't1' }]).mockResolvedValueOnce([{ id: 't1' }]);
    actions.getTransactionsForExport.mockResolvedValue([{ id: 'e1' }]);

    const element = await Page();
    render(element);

    const exportNode = screen.getByTestId('export-transactions');
    expect(exportNode).toBeDefined();
    expect(exportNode.getAttribute('data-transactions-length')).toBe('1');

    const onExportUnknown = exportHelper.getLastOnExport();
    expect(typeof onExportUnknown).toBe('function');

    const onExport = onExportUnknown as (_start?: Date, _end?: Date) => Promise<unknown>;

    const start = new Date('2023-01-01T00:00:00.000Z');
    const end = new Date('2023-12-31T23:59:59.999Z');
    const result = await onExport(start, end);

    expect(result).toEqual([{ id: 'e1' }]);
    expect(actions.getTransactionsForExport).toHaveBeenCalledTimes(1);
    expect(actions.getTransactionsForExport).toHaveBeenCalledWith(userId, start, end);
  });

  test('onExport returns all transactions when called without dates', async (): Promise<void> => {
    actions.getCachedAllTransactions.mockResolvedValueOnce([{ id: 't1' }]).mockResolvedValueOnce([{ id: 't1' }]);
    actions.getTransactionsForExport.mockResolvedValue([{ id: 'e-all' }, { id: 'e-2' }]);

    const element = await Page();
    render(element);

    const onExportUnknown = exportHelper.getLastOnExport();
    const onExport = onExportUnknown as (_start?: Date, _end?: Date) => Promise<unknown>;

    const result = await onExport();
    expect(result).toEqual([{ id: 'e-all' }, { id: 'e-2' }]);
    expect(actions.getTransactionsForExport).toHaveBeenCalledWith('user@example.com', undefined, undefined);
  });

  test('uses undefined userId when session is missing', async (): Promise<void> => {
    actions.getCachedAuthSession.mockResolvedValue(null);
    actions.getCachedAllTransactions.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const element = await Page();
    render(element);

    expect(screen.getByTestId('no-transactions-plug')).toBeDefined();
    expect(actions.getCachedAllTransactions).toHaveBeenNthCalledWith(1, undefined);
    expect(actions.getCachedAllTransactions).toHaveBeenNthCalledWith(2, undefined);
  });

  test('propagates error when getCachedAllTransactions fails', async (): Promise<void> => {
    actions.getCachedAllTransactions.mockRejectedValue(new Error('load failed'));

    await expect(Page()).rejects.toThrow('load failed');
  });

  test('onExport propagates error when getTransactionsForExport fails', async (): Promise<void> => {
    actions.getCachedAllTransactions.mockResolvedValueOnce([{ id: 't1' }]).mockResolvedValueOnce([{ id: 't1' }]);
    const error = new Error('export failed');
    actions.getTransactionsForExport.mockRejectedValue(error);

    const element = await Page();
    render(element);

    const onExportUnknown = exportHelper.getLastOnExport();
    const onExport = onExportUnknown as (_start?: Date, _end?: Date) => Promise<unknown>;

    await expect(onExport()).rejects.toThrow('export failed');
  });

  test('calls getCachedAuthSession twice and getCachedAllTransactions twice (prefetch + await)', async (): Promise<void> => {
    actions.getCachedAllTransactions.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const element = await Page();
    render(element);

    expect(actions.getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(actions.getCachedAllTransactions).toHaveBeenCalledTimes(2);
  });
});