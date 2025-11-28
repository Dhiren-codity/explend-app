import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

vi.mock('@/config/constants/navigation', () => {
  return {
    __esModule: true,
    NAV_TITLE: { EXPORT: 'Export' },
  };
});

vi.mock('../lib/actions', () => {
  return {
    __esModule: true,
    getCachedAuthSession: vi.fn(),
    getCachedAllTransactions: vi.fn(),
    getTransactionsForExport: vi.fn(),
  };
});

vi.mock('../ui/home/export-transactions', () => {
  let lastProps = null;
  function MockExportTransactions(props) {
    lastProps = props;
    return React.createElement('div', { 'data-testid': 'export-transactions', 'data-count': String(props.transactions?.length ?? 0) });
  }
  return {
    __esModule: true,
    default: MockExportTransactions,
    __getLastExportProps: () => lastProps,
    __resetExportProps: () => { lastProps = null; },
  };
});

vi.mock('../ui/no-transactions-plug', () => {
  function MockNoTransactionsPlug() {
    return React.createElement('div', { 'data-testid': 'no-transactions' }, 'No Transactions');
  }
  return {
    __esModule: true,
    default: MockNoTransactionsPlug,
  };
});

vi.mock('../ui/sidebar/with-sidebar', () => {
  function MockWithSidebar(props) {
    return React.createElement('div', { 'data-testid': 'with-sidebar' }, props.contentNearby);
  }
  return {
    __esModule: true,
    default: MockWithSidebar,
  };
});

import Page, { metadata } from './page';
import { getCachedAuthSession, getCachedAllTransactions, getTransactionsForExport } from '../lib/actions';
import { __getLastExportProps, __resetExportProps } from '../ui/home/export-transactions';

describe('app/export/page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    __resetExportProps();
  });

  test('metadata title is set from NAV_TITLE.EXPORT', async () => {
    expect(metadata.title).toBe('Export');
  });

  test('renders NoTransactionsPlug when there are no transactions', async () => {
    getCachedAuthSession.mockResolvedValue({ user: { email: 'user@example.com' } });
    getCachedAllTransactions.mockResolvedValue([]);

    const element = await Page();
    render(element);

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com');
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com');

    expect(screen.getByTestId('with-sidebar')).toBeDefined();
    expect(screen.getByTestId('no-transactions')).toBeDefined();
    expect(screen.queryByTestId('export-transactions')).toBeNull();
  });

  test('renders ExportTransactions when transactions exist and onExport works', async () => {
    const userId = 'user@example.com';
    const initialTx = [{ id: 't1' }];
    const exportedTx = [{ id: 't2' }];

    getCachedAuthSession.mockResolvedValue({ user: { email: userId } });
    getCachedAllTransactions.mockResolvedValue(initialTx);
    getTransactionsForExport.mockResolvedValue(exportedTx);

    const element = await Page();
    render(element);

    const exportNode = screen.getByTestId('export-transactions');
    expect(exportNode).toBeDefined();
    expect(exportNode.getAttribute('data-count')).toBe(String(initialTx.length));

    const props = __getLastExportProps();
    expect(typeof props.onExport).toBe('function');

    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-01-31T23:59:59Z');

    const result = await props.onExport(startDate, endDate);
    expect(getTransactionsForExport).toHaveBeenCalledTimes(1);
    expect(getTransactionsForExport).toHaveBeenCalledWith(userId, startDate, endDate);
    expect(result).toEqual(exportedTx);
  });

  test('passes undefined userId when session is missing', async () => {
    getCachedAuthSession.mockResolvedValue(undefined);
    getCachedAllTransactions.mockResolvedValue([]);

    const element = await Page();
    render(element);

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, undefined);
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(2, undefined);

    expect(screen.getByTestId('no-transactions')).toBeDefined();
  });

  test('propagates error when fetching transactions fails', async () => {
    getCachedAuthSession.mockResolvedValue({ user: { email: 'user@example.com' } });
    getCachedAllTransactions.mockImplementation(() => {
      throw new Error('fetch-failed');
    });

    await expect(Page()).rejects.toThrow('fetch-failed');
  });

  test('onExport propagates error from getTransactionsForExport', async () => {
    const userId = 'user@example.com';
    getCachedAuthSession.mockResolvedValue({ user: { email: userId } });
    getCachedAllTransactions.mockResolvedValue([{ id: 't1' }]);
    getTransactionsForExport.mockRejectedValue(new Error('export-failed'));

    const element = await Page();
    render(element);

    const props = __getLastExportProps();
    expect(props).toBeDefined();
    await expect(props.onExport(new Date('2024-02-01'), new Date('2024-02-28'))).rejects.toThrow('export-failed');
    expect(getTransactionsForExport).toHaveBeenCalledWith(userId, new Date('2024-02-01'), new Date('2024-02-28'));
  });
});
