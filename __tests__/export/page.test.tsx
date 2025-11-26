import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';

vi.mock('@/config/constants/navigation', (): Record<string, unknown> => {
  return {
    NAV_TITLE: { EXPORT: 'Export Title' },
  };

vi.mock('../lib/actions', (): Record<string, unknown> => {
  const getCachedAuthSession = vi.fn();
  const getCachedAllTransactions = vi.fn();
  const getTransactionsForExport = vi.fn();

  const globalObj: Record<string, unknown> = globalThis as unknown as Record<string, unknown>;
  globalObj.testMocks = { getCachedAuthSession, getCachedAllTransactions, getTransactionsForExport };

  return {
    getCachedAuthSession,
    getCachedAllTransactions,
    getTransactionsForExport,
  };

vi.mock('../ui/home/export-transactions', (): Record<string, unknown> => {
  type ExportTransactionsProps = {
    transactions: unknown[];
    onExport: (startDate?: Date, endDate?: Date) => Promise<unknown[]>;
  };
  const ExportTransactions = ({ transactions, onExport }: ExportTransactionsProps): JSX.Element => {
    const handleClick = (): void => {
      void onExport();
    };
    const handleClickWithDates = (): void => {
      const start = new Date('2020-01-01T00:00:00.000Z');
      const end = new Date('2020-12-31T00:00:00.000Z');
      void onExport(start, end);
    };
    return (
      <div data-testid="export-transactions">
        <div>transactions-count:{transactions.length}</div>
        <button data-testid="export-btn" onClick={handleClick}>Export</button>
        <button data-testid="export-btn-with-dates" onClick={handleClickWithDates}>Export With Dates</button>
      </div>
    );
  };
  return { default: ExportTransactions };
});

vi.mock('../ui/no-transactions-plug', (): Record<string, unknown> => {
  const NoTransactionsPlug = (): JSX.Element => (
    <div data-testid="no-transactions-plug">NoTransactionsPlug</div>
  );
  return { default: NoTransactionsPlug };
});

vi.mock('../ui/sidebar/with-sidebar', (): Record<string, unknown> => {
  type WithSidebarProps = { contentNearby?: React.ReactNode };
  const WithSidebar = ({ contentNearby }: WithSidebarProps): JSX.Element => (
    <div data-testid="with-sidebar">{contentNearby}</div>
  );
  return { default: WithSidebar };
});

import Page, { metadata } from './app/export/page';

type MockFn = ReturnType<typeof vi.fn>;
type TestMocks = {
  getCachedAuthSession: MockFn;
  getCachedAllTransactions: MockFn;
  getTransactionsForExport: MockFn;
};

const getTestMocks = (): TestMocks => {
  const globalObj: Record<string, unknown> = globalThis as unknown as Record<string, unknown>;
  return globalObj.testMocks as TestMocks;
};


  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('metadata', (): void => {
    test('should expose correct title', (): void => {
      expect(metadata.title).toBe('Export Title');
    });

  describe('Page component', (): void => {
    test('renders NoTransactionsPlug when there are no transactions', async (): Promise<void> => {
      const element = await Page();
      render(element);

      expect(screen.getByText('Export Title')).toBeDefined();
      expect(screen.getByTestId('with-sidebar')).toBeDefined();
      expect(screen.getByTestId('no-transactions-plug')).toBeDefined();

      const { getCachedAuthSession, getCachedAllTransactions } = getTestMocks();
      expect(getCachedAuthSession).toHaveBeenCalledTimes(2);
      expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
      const allCalls = getCachedAllTransactions.mock.calls;
      expect(allCalls[0][0]).toBe('user@example.com');
      expect(allCalls[1][0]).toBe('user@example.com');
    });

      getCachedAllTransactions.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const element = await Page();
      render(element);

      expect(screen.getByText('Export Title')).toBeDefined();
      expect(screen.getByTestId('with-sidebar')).toBeDefined();
      const exportSection = screen.getByTestId('export-transactions');
      expect(exportSection).toBeDefined();
      expect(screen.getByText('transactions-count:2')).toBeDefined();
    });

      getCachedAllTransactions.mockResolvedValue([{ id: 1 }]);

      const element = await Page();
      render(element);

      fireEvent.click(screen.getByTestId('export-btn'));

      await waitFor((): void => {
        expect(getTransactionsForExport).toHaveBeenCalledTimes(1);
      });

      const call = getTransactionsForExport.mock.calls[0];
      expect(call[0]).toBe('user@example.com');
      expect(call[1]).toBeUndefined();
      expect(call[2]).toBeUndefined();
    });

      getCachedAllTransactions.mockResolvedValue([{ id: 1 }]);

      const element = await Page();
      render(element);

      fireEvent.click(screen.getByTestId('export-btn-with-dates'));

      await waitFor((): void => {
        expect(getTransactionsForExport).toHaveBeenCalledTimes(1);
      });

      const call = getTransactionsForExport.mock.calls[0];
      expect(call[0]).toBe('user@example.com');
      const startDate = call[1] as Date | undefined;
      const endDate = call[2] as Date | undefined;
      expect(startDate instanceof Date).toBe(true);
      expect(endDate instanceof Date).toBe(true);
      if (startDate && endDate) {
        expect(startDate.toISOString()).toBe('2020-01-01T00:00:00.000Z');
        expect(endDate.toISOString()).toBe('2020-12-31T00:00:00.000Z');
      }

      getCachedAuthSession.mockResolvedValue(undefined);
      getCachedAllTransactions.mockResolvedValue([]);

      const element = await Page();
      render(element);

      expect(screen.getByText('Export Title')).toBeDefined();
      expect(screen.getByTestId('no-transactions-plug')).toBeDefined();

      expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
      const calls = getCachedAllTransactions.mock.calls;
      expect(calls[0][0]).toBeUndefined();
      expect(calls[1][0]).toBeUndefined();
    });

      getCachedAllTransactions.mockRejectedValue(new Error('boom'));

      await expect(Page()).rejects.toThrow('boom');
    });
