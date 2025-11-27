import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Page, { metadata } from './page';
import { NAV_TITLE } from '@/config/constants/navigation';
import * as actions from '../lib/actions';
import ExportTransactions from '../ui/home/export-transactions';
import NoTransactionsPlug from '../ui/no-transactions-plug';
import WithSidebar from '../ui/sidebar/with-sidebar';
import '@testing-library/jest-dom';

vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: {
    EXPORT: 'Export Transactions',
  },
}));

vi.mock('../lib/actions', () => ({
  getCachedAllTransactions: vi.fn(),
  getCachedAuthSession: vi.fn(),
  getTransactionsForExport: vi.fn(),
}));

vi.mock('../ui/home/export-transactions', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="export-transactions" />),
}));

vi.mock('../ui/no-transactions-plug', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="no-transactions-plug" />),
}));

vi.mock('../ui/sidebar/with-sidebar', () => ({
  __esModule: true,
  default: vi.fn(({ contentNearby }: { contentNearby: React.ReactNode }) => (
    <div data-testid="with-sidebar">{contentNearby}</div>
  )),
}));

describe('Page', (): void => {
  const mockSession = { user: { email: 'user@example.com' } };
  const mockTransactions = [
    { id: '1', amount: 100, date: '2024-01-01' },
    { id: '2', amount: 200, date: '2024-01-02' },
  ];

  beforeEach((): void => {
    (actions.getCachedAuthSession as unknown as vi.Mock).mockReset();
    (actions.getCachedAllTransactions as unknown as vi.Mock).mockReset();
    (actions.getTransactionsForExport as unknown as vi.Mock).mockReset();
    (ExportTransactions as unknown as vi.Mock).mockClear();
    (NoTransactionsPlug as unknown as vi.Mock).mockClear();
    (WithSidebar as unknown as vi.Mock).mockClear();
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  test('should export correct metadata', (): void => {
    expect(metadata).toEqual({ title: 'Export Transactions' });
  });

  test('should render NoTransactionsPlug when transactions are empty', async (): Promise<void> => {
    (actions.getCachedAuthSession as unknown as vi.Mock).mockResolvedValueOnce(mockSession);
    (actions.getCachedAllTransactions as unknown as vi.Mock).mockResolvedValueOnce([]);

    const PageComponent = await Page();

    // Render the returned JSX
    render(PageComponent);

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument();
    expect(screen.queryByTestId('export-transactions')).toBeNull();
    expect(WithSidebar).toHaveBeenCalled();
    expect(NoTransactionsPlug).toHaveBeenCalled();
  });

  test('should render ExportTransactions when transactions exist', async (): Promise<void> => {
    (actions.getCachedAuthSession as unknown as vi.Mock).mockResolvedValueOnce(mockSession);
    (actions.getCachedAllTransactions as unknown as vi.Mock).mockResolvedValueOnce(mockTransactions);

    const PageComponent = await Page();

    render(PageComponent);

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByTestId('export-transactions')).toBeInTheDocument();
    expect(screen.queryByTestId('no-transactions-plug')).toBeNull();
    expect(WithSidebar).toHaveBeenCalled();
    expect(ExportTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        transactions: mockTransactions,
        onExport: expect.any(Function),
      }),
      {},
    );
  });

  test('should call getCachedAuthSession and getCachedAllTransactions with correct userId', async (): Promise<void> => {
    (actions.getCachedAuthSession as unknown as vi.Mock).mockResolvedValueOnce(mockSession);
    (actions.getCachedAllTransactions as unknown as vi.Mock).mockResolvedValueOnce(mockTransactions);

    await Page();

    expect(actions.getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(actions.getCachedAllTransactions).toHaveBeenCalledWith('user@example.com');
    expect(actions.getCachedAllTransactions).toHaveBeenCalledTimes(2);
  });

  test('should handle missing session gracefully (userId undefined)', async (): Promise<void> => {
    (actions.getCachedAuthSession as unknown as vi.Mock).mockResolvedValueOnce(null);
    (actions.getCachedAllTransactions as unknown as vi.Mock).mockResolvedValueOnce([]);

    const PageComponent = await Page();

    render(PageComponent);

    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument();
    expect(actions.getCachedAllTransactions).toHaveBeenCalledWith(undefined);
  });

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('DB error');
  });

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('Session error');
  });


    const PageComponent = await Page();

    // Find the onExport prop from ExportTransactions mock
    const exportTransactionsCall = (ExportTransactions as unknown as vi.Mock).mock.calls[0][0];
    const onExport = exportTransactionsCall.onExport;

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    const result = await onExport(startDate, endDate);

    expect(actions.getTransactionsForExport).toHaveBeenCalledWith('user@example.com', startDate, endDate);
    expect(result).toEqual([{ id: '3', amount: 300, date: '2024-01-03' }]);
  });

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('Export error');
  });

  test('should render correct heading', async (): Promise<void> => {
    (actions.getCachedAuthSession as unknown as vi.Mock).mockResolvedValueOnce(mockSession);
    (actions.getCachedAllTransactions as unknown as vi.Mock).mockResolvedValueOnce(mockTransactions);

    const PageComponent = await Page();

    render(PageComponent);

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
  });
});
