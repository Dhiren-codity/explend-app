import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Page, { metadata } from './page';

vi.mock('@/config/constants/navigation', () => {
  return {
    NAV_TITLE: { EXPORT: 'Export Test' },
  };
});

vi.mock('../lib/actions', () => {
  const getCachedAuthSession = vi.fn(async (): Promise<unknown> => ({ user: { email: 'user@example.com' } }));
  const getCachedAllTransactions = vi.fn(async (_userId?: string): Promise<unknown> => []);
  const getTransactionsForExport = vi.fn(async (_userId?: string, _start?: Date, _end?: Date): Promise<unknown> => []);
  const exported = { getCachedAuthSession, getCachedAllTransactions, getTransactionsForExport };
  (globalThis as unknown as Record<string, unknown>).__actionsMock = exported;
  return exported;
});

vi.mock('../ui/home/export-transactions', () => {
  const ExportTransactions = (props: Record<string, unknown>): JSX.Element => {
    (globalThis as unknown as Record<string, unknown>).__lastExportProps = props;
    return <div data-testid="export-transactions">ExportTransactions</div>;
  };
  return { default: ExportTransactions };
});

vi.mock('../ui/no-transactions-plug', () => {
  const NoTransactionsPlug = (): JSX.Element => {
    return <div data-testid="no-transactions-plug">NoTransactionsPlug</div>;
  };
  return { default: NoTransactionsPlug };
});

vi.mock('../ui/sidebar/with-sidebar', () => {
  const WithSidebar = (props: Record<string, unknown>): JSX.Element => {
    const contentNearby = props.contentNearby as JSX.Element | null | undefined;
    return <div data-testid="with-sidebar">{contentNearby}</div>;
  };
  return { default: WithSidebar };
});

describe('Page', (): void => {
  const getActions = (): {
    getCachedAuthSession: ((..._args: unknown[]) => Promise<unknown>) & {
      mockResolvedValue: (_value: unknown) => unknown;
      mockRejectedValue: (_error: unknown) => unknown;
      mock: { calls: unknown[][] };
    };
    getCachedAllTransactions: ((..._args: unknown[]) => Promise<unknown>) & {
      mockResolvedValue: (_value: unknown) => unknown;
      mockResolvedValueOnce: (_value: unknown) => unknown;
      mockRejectedValue: (_error: unknown) => unknown;
      mockRejectedValueOnce: (_error: unknown) => unknown;
      mock: { calls: unknown[][] };
    };
    getTransactionsForExport: ((..._args: unknown[]) => Promise<unknown>) & {
      mockResolvedValue: (_value: unknown) => unknown;
      mockRejectedValue: (_error: unknown) => unknown;
      mock: { calls: unknown[][] };
    };
  } => {
    const actions = (globalThis as unknown as Record<string, unknown>).__actionsMock as Record<string, unknown>;
    return actions as unknown as {
      getCachedAuthSession: ((..._args: unknown[]) => Promise<unknown>) & {
        mockResolvedValue: (_value: unknown) => unknown;
        mockRejectedValue: (_error: unknown) => unknown;
        mock: { calls: unknown[][] };
      };
      getCachedAllTransactions: ((..._args: unknown[]) => Promise<unknown>) & {
        mockResolvedValue: (_value: unknown) => unknown;
        mockResolvedValueOnce: (_value: unknown) => unknown;
        mockRejectedValue: (_error: unknown) => unknown;
        mockRejectedValueOnce: (_error: unknown) => unknown;
        mock: { calls: unknown[][] };
      };
      getTransactionsForExport: ((..._args: unknown[]) => Promise<unknown>) & {
        mockResolvedValue: (_value: unknown) => unknown;
        mockRejectedValue: (_error: unknown) => unknown;
        mock: { calls: unknown[][] };
      };
    };
  };

  const getLastExportProps = (): Record<string, unknown> | undefined => {
    const store = (globalThis as unknown as Record<string, unknown>).__lastExportProps as Record<string, unknown> | undefined;
    return store;
  };

  beforeEach((): void => {
    cleanup();
    delete (globalThis as unknown as Record<string, unknown>).__lastExportProps;
  });

  afterEach((): void => {
    vi.clearAllMocks();
    cleanup();
  });

  test('should export metadata title from NAV_TITLE.EXPORT', (): void => {
    expect(metadata.title).toBe('Export Test');
  });

  test('should render NoTransactionsPlug when no transactions', async (): Promise<void> => {
    const actions = getActions();
    actions.getCachedAuthSession.mockResolvedValue({ user: { email: 'user@example.com' } });
    actions.getCachedAllTransactions.mockResolvedValue([]);

    const element = await Page();
    render(element);

    const sidebar = screen.queryByTestId('with-sidebar');
    const plug = screen.queryByTestId('no-transactions-plug');
    const exporter = screen.queryByTestId('export-transactions');

    expect(sidebar).not.toBeNull();
    expect(plug).not.toBeNull();
    expect(exporter).toBeNull();

    expect(actions.getCachedAuthSession.mock.calls.length).toBe(2);
    expect(actions.getCachedAllTransactions.mock.calls.length).toBe(2);
    const firstArgs = actions.getCachedAllTransactions.mock.calls[0];
    const secondArgs = actions.getCachedAllTransactions.mock.calls[1];
    expect(firstArgs[0]).toBe('user@example.com');
    expect(secondArgs[0]).toBe('user@example.com');
  });

  test('should render ExportTransactions and pass handleExport when transactions exist', async (): Promise<void> => {
    const actions = getActions();
    actions.getCachedAuthSession.mockResolvedValue({ user: { email: 'user@example.com' } });
    const seededTransactions = [{ id: 't1' }];
    actions.getCachedAllTransactions.mockResolvedValue(seededTransactions);
    const exportedTransactions = [{ id: 'e1' }];
    actions.getTransactionsForExport.mockResolvedValue(exportedTransactions);

    const element = await Page();
    render(element);

    const exporter = screen.queryByTestId('export-transactions');
    expect(exporter).not.toBeNull();

    const lastProps = getLastExportProps();
    expect(lastProps).toBeDefined();

    const transactionsProp = (lastProps as Record<string, unknown>).transactions as unknown[];
    expect(Array.isArray(transactionsProp)).toBe(true);
    expect(transactionsProp.length).toBe(1);

    const onExport = (lastProps as Record<string, unknown>).onExport as (..._args: unknown[]) => Promise<unknown>;
    expect(typeof onExport).toBe('function');

    const start = new Date('2020-01-01T00:00:00.000Z');
    const end = new Date('2020-01-31T00:00:00.000Z');
    const result = await onExport(start, end);
    expect(result).toEqual(exportedTransactions);

    expect(actions.getTransactionsForExport.mock.calls.length).toBe(1);
    const call = actions.getTransactionsForExport.mock.calls[0];
    expect(call[0]).toBe('user@example.com');
    expect(call[1]).toEqual(start);
    expect(call[2]).toEqual(end);
  });

  test('should handle null session (no userId) and show NoTransactionsPlug', async (): Promise<void> => {
    const actions = getActions();
    actions.getCachedAuthSession.mockResolvedValue(null);
    actions.getCachedAllTransactions.mockResolvedValue([]);

    const element = await Page();
    render(element);

    const plug = screen.queryByTestId('no-transactions-plug');
    expect(plug).not.toBeNull();

    expect(actions.getCachedAuthSession.mock.calls.length).toBe(2);
    expect(actions.getCachedAllTransactions.mock.calls.length).toBe(2);
    const firstArgs = actions.getCachedAllTransactions.mock.calls[0];
    const secondArgs = actions.getCachedAllTransactions.mock.calls[1];
    expect(firstArgs[0]).toBeUndefined();
    expect(secondArgs[0]).toBeUndefined();
  });

  test('should propagate error when transactions fetching fails', async (): Promise<void> => {
    const actions = getActions();
    actions.getCachedAuthSession.mockResolvedValue({ user: { email: 'user@example.com' } });
    actions.getCachedAllTransactions.mockResolvedValueOnce([]);
    actions.getCachedAllTransactions.mockRejectedValueOnce(new Error('load failed'));

    await expect(Page()).rejects.toThrow('load failed');
  });

  test('handleExport should propagate error when export fails', async (): Promise<void> => {
    const actions = getActions();
    actions.getCachedAuthSession.mockResolvedValue({ user: { email: 'user@example.com' } });
    actions.getCachedAllTransactions.mockResolvedValue([{ id: 't1' }]);
    actions.getTransactionsForExport.mockRejectedValue(new Error('export failed'));

    const element = await Page();
    render(element);

    const lastProps = getLastExportProps();
    expect(lastProps).toBeDefined();

    const onExport = (lastProps as Record<string, unknown>).onExport as (..._args: unknown[]) => Promise<unknown>;
    await expect(onExport(new Date('2020-01-01T00:00:00.000Z'), new Date('2020-01-31T00:00:00.000Z'))).rejects.toThrow('export failed');
  });
});