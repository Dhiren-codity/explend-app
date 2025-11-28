import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('@/config/constants/navigation', () => ({
  __esModule: true,
  NAV_TITLE: { EXPORT: 'Export' },
}));


vi.mock('../ui/home/export-transactions', () => ({
  __esModule: true,
  default: (props) => {
    capturedExportProps = props;
    return React.createElement('div', { 'data-testid': 'export-transactions' });
  },
}));

vi.mock('../ui/no-transactions-plug', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'no-transactions-plug' }),
}));

vi.mock('../ui/sidebar/with-sidebar', () => ({
  __esModule: true,
  default: ({ contentNearby }) =>
    React.createElement('div', { 'data-testid': 'with-sidebar' }, contentNearby),
}));

vi.mock('../lib/actions', () => ({
  __esModule: true,
  getCachedAuthSession: vi.fn(),
  getCachedAllTransactions: vi.fn(),
  getTransactionsForExport: vi.fn(),
}));

import Page, { metadata } from './page';
import {
  getCachedAuthSession,
  getCachedAllTransactions,
  getTransactionsForExport,
} from '../lib/actions';

describe('app/export/page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedExportProps = undefined;

    getCachedAuthSession.mockResolvedValue({
      user: { email: 'user@example.com' },
    });

    getCachedAllTransactions.mockResolvedValue([]);

    getTransactionsForExport.mockResolvedValue([]);
  });

  test('metadata.title is set to NAV_TITLE.EXPORT', () => {
    expect(metadata.title).toBe('Export');
  });

  test('renders empty state when there are no transactions', async () => {
    getCachedAllTransactions.mockResolvedValue([]);

    const ui = await Page();
    render(ui);

    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument();
    expect(screen.queryByTestId('export-transactions')).not.toBeInTheDocument();

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com');
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com');
  });

  test('renders ExportTransactions when transactions exist and onExport works', async () => {
    const transactions = [{ id: 't1' }];
    getCachedAllTransactions.mockResolvedValue(transactions);

    const exported = [{ id: 'e1' }];
    getTransactionsForExport.mockResolvedValue(exported);

    const ui = await Page();
    render(ui);

    expect(screen.queryByTestId('no-transactions-plug')).not.toBeInTheDocument();
    expect(screen.getByTestId('export-transactions')).toBeInTheDocument();

    expect(capturedExportProps).toBeDefined();
    expect(Array.isArray(capturedExportProps.transactions)).toBe(true);
    expect(capturedExportProps.transactions).toBe(transactions);
    expect(typeof capturedExportProps.onExport).toBe('function');

    const result1 = await capturedExportProps.onExport();
    expect(result1).toBe(exported);
    expect(getTransactionsForExport).toHaveBeenLastCalledWith('user@example.com', undefined, undefined);

    const start = new Date('2020-01-01');
    const end = new Date('2020-12-31');
    const result2 = await capturedExportProps.onExport(start, end);
    expect(result2).toBe(exported);
    expect(getTransactionsForExport).toHaveBeenLastCalledWith('user@example.com', start, end);
  });

  test('propagates error when fetching transactions fails', async () => {
    getCachedAllTransactions
      .mockResolvedValueOnce([]) // first prefetch call (not awaited)
      .mockRejectedValueOnce(new Error('Failed to fetch transactions')); // awaited call

    await expect(Page()).rejects.toThrow('Failed to fetch transactions');
  });
});
