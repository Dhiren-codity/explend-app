import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import Page from './page';
import { getCachedAllTransactions, getCachedAuthSession, getTransactionsForExport } from '../lib/actions';

let lastExportProps:
  | {
      transactions: unknown[];
      onExport: (startDate?: Date, endDate?: Date) => Promise<unknown[]>;
    }
  | undefined;

vi.mock('next', () => {
  return { __esModule: true };
});

vi.mock('@/config/constants/navigation', () => {
  return {
    __esModule: true,
    NAV_TITLE: { EXPORT: 'Export' },
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

vi.mock('../ui/home/export-transactions', () => {
  type ExportProps = {
    transactions: unknown[];
    onExport: (startDate?: Date, endDate?: Date) => Promise<unknown[]>;
  };
  const ExportTransactionsMock = (props: ExportProps): JSX.Element => {
    lastExportProps = { transactions: props.transactions, onExport: props.onExport };
    return <div data-testid="export-transactions" />;
  };
  ExportTransactionsMock.displayName = 'ExportTransactionsMock';
  return {
    __esModule: true,
    default: ExportTransactionsMock,
  };
});

vi.mock('../ui/no-transactions-plug', () => {
  const NoTransactionsPlugMock = (): JSX.Element => <div data-testid="no-transactions-plug" />;
  NoTransactionsPlugMock.displayName = 'NoTransactionsPlugMock';
  return {
    __esModule: true,
    default: NoTransactionsPlugMock,
  };
});

vi.mock('../ui/sidebar/with-sidebar', () => {
  type WithSidebarProps = { contentNearby: React.ReactNode };
  const WithSidebarMock = (props: WithSidebarProps): JSX.Element => <>{props.contentNearby}</>;
  WithSidebarMock.displayName = 'WithSidebarMock';
  return {
    __esModule: true,
    default: WithSidebarMock,
  };
});

function findByTestId(node: unknown, testId: string): boolean {
  const visit = (n: unknown): boolean => {
    if (Array.isArray(n)) {
      for (const child of n) {
        if (visit(child)) return true;
      }
      return false;
    }
    if (n && typeof n === 'object' && 'props' in (n as Record<string, unknown>)) {
      const el = n as { props?: Record<string, unknown> };
      const props = el.props ?? {};
      const dataTestId = props['data-testid'];
      if (dataTestId === testId) return true;
      const children = props.children;
      if (Array.isArray(children)) {
        for (const child of children) {
          if (visit(child)) return true;
        }
      } else if (children !== undefined && children !== null) {
        if (visit(children)) return true;
      }
    }
    return false;
  };
  return visit(node);
}

describe('Page', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks();
    lastExportProps = undefined;
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  test('renders NoTransactionsPlug when there are no transactions', async (): Promise<void> => {
    (getCachedAuthSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: 'user@example.com' },
    });
    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const element = await Page();

    expect(findByTestId(element as unknown, 'no-transactions-plug')).toBe(true);
    expect(getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenCalledWith('user@example.com');
  });

  test('renders ExportTransactions when transactions exist and onExport calls getTransactionsForExport', async (): Promise<void> => {
    const transactions: unknown[] = [{ id: 1 }, { id: 2 }];
    (getCachedAuthSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: 'user@example.com' },
    });
    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(transactions);
    const exported: unknown[] = [{ id: 10 }];
    (getTransactionsForExport as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(exported);

    const element = await Page();

    expect(findByTestId(element as unknown, 'export-transactions')).toBe(true);
    expect(lastExportProps).toBeDefined();
    expect(Array.isArray(lastExportProps?.transactions)).toBe(true);
    expect((lastExportProps?.transactions ?? []).length).toBe(2);

    const start = new Date('2024-01-01T00:00:00.000Z');
    const end = new Date('2024-12-31T23:59:59.000Z');
    const result = await (lastExportProps as {
      onExport: (startDate?: Date, endDate?: Date) => Promise<unknown[]>;
    }).onExport(start, end);

    expect(getTransactionsForExport).toHaveBeenCalledTimes(1);
    expect(getTransactionsForExport).toHaveBeenCalledWith('user@example.com', start, end);
    expect(result).toEqual(exported);
  });

  test('propagates error when getCachedAuthSession rejects', async (): Promise<void> => {
    // First unawaited call resolves to avoid unhandled rejection; second awaited call rejects
    (getCachedAuthSession as unknown as ReturnType<typeof vi.fn>)
      .mockImplementationOnce(async (): Promise<unknown> => ({ user: { email: 'x' } }))
      .mockImplementationOnce(async (): Promise<unknown> => {
        throw new Error('session failed');
      });

    await expect(Page()).rejects.toThrow('session failed');
    expect(getCachedAllTransactions).not.toHaveBeenCalled();
  });

  test('propagates error when getCachedAllTransactions rejects', async (): Promise<void> => {
    (getCachedAuthSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: 'user@example.com' },
    });
    // First unawaited call resolves; second awaited call rejects
    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>)
      .mockImplementationOnce(async (): Promise<unknown> => [])
      .mockImplementationOnce(async (): Promise<unknown> => {
        throw new Error('transactions failed');
      });

    await expect(Page()).rejects.toThrow('transactions failed');
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
  });

  test('onExport propagates error when getTransactionsForExport rejects', async (): Promise<void> => {
    (getCachedAuthSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: 'user@example.com' },
    });
    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: 1 }]);
    (getTransactionsForExport as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('export failed'),
    );

    await Page();

    expect(lastExportProps).toBeDefined();
    await expect(
      (lastExportProps as {
        onExport: (startDate?: Date, endDate?: Date) => Promise<unknown[]>;
      }).onExport(),
    ).rejects.toThrow('export failed');
    expect(getTransactionsForExport).toHaveBeenCalledWith('user@example.com', undefined, undefined);
  });

  test('handles undefined userId when session email is missing', async (): Promise<void> => {
    (getCachedAuthSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const element = await Page();

    expect(findByTestId(element as unknown, 'no-transactions-plug')).toBe(true);
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenCalledWith(undefined);
  });
});
