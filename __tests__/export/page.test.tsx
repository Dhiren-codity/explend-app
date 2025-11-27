import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Page from './page';

const getCachedAuthSessionMock = vi.fn();
const getCachedAllTransactionsMock = vi.fn();
const getTransactionsForExportMock = vi.fn();

const exportTransactionsRenderMock = vi.fn();
const withSidebarRenderMock = vi.fn();

vi.mock('@/config/constants/navigation', () => {
  return {
    NAV_TITLE: { EXPORT: 'Export' },
  };
});

vi.mock('../lib/actions', () => {
  return {
    getCachedAllTransactions: getCachedAllTransactionsMock,
    getCachedAuthSession: getCachedAuthSessionMock,
    getTransactionsForExport: getTransactionsForExportMock,
  };
});

vi.mock('../ui/home/export-transactions', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactLocal = require('react') as unknown as typeof import('react');
  type ExportTransactionsProps = {
    transactions: Array<Record<string, unknown>>;
    onExport: (startDate?: Date, endDate?: Date) => Promise<Array<Record<string, unknown>>>;
  };
  const ExportTransactions = (props: ExportTransactionsProps): JSX.Element => {
    exportTransactionsRenderMock(props);
    return ReactLocal.createElement('div', { 'data-testid': 'export-transactions' }, 'ExportTransactions');
  };
  return { __esModule: true, default: ExportTransactions };
});

vi.mock('../ui/no-transactions-plug', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactLocal = require('react') as unknown as typeof import('react');
  const NoTransactionsPlug = (): JSX.Element =>
    ReactLocal.createElement('div', { 'data-testid': 'no-transactions-plug' }, 'NoTransactionsPlug');
  return { __esModule: true, default: NoTransactionsPlug };
});

vi.mock('../ui/sidebar/with-sidebar', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactLocal = require('react') as unknown as typeof import('react');
  type WithSidebarProps = { contentNearby: React.ReactNode };
  const WithSidebar = (props: WithSidebarProps): JSX.Element => {
    withSidebarRenderMock(props);
    return ReactLocal.createElement('div', { 'data-testid': 'with-sidebar' }, props.contentNearby as React.ReactNode);
  };
  return { __esModule: true, default: WithSidebar };
});

describe('Page', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks();
    getCachedAuthSessionMock.mockResolvedValue({ user: { email: 'user@example.com' } });
    getCachedAllTransactionsMock.mockResolvedValue([]);
    getTransactionsForExportMock.mockResolvedValue([]);
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  test('renders heading and NoTransactionsPlug when no transactions', async (): Promise<void> => {
    getCachedAllTransactionsMock.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const element = await Page();
    const html = renderToStaticMarkup(element as unknown as React.ReactElement);

    expect(html.includes('Export')).toBe(true);
    expect(html.includes('data-testid="no-transactions-plug"')).toBe(true);
    expect(html.includes('data-testid="export-transactions"')).toBe(false);

    expect(getCachedAuthSessionMock).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactionsMock).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactionsMock).toHaveBeenNthCalledWith(1, 'user@example.com');
    expect(getCachedAllTransactionsMock).toHaveBeenNthCalledWith(2, 'user@example.com');
    expect(withSidebarRenderMock).toHaveBeenCalledTimes(1);
  });

    getCachedAllTransactionsMock.mockResolvedValueOnce(sampleTxs).mockResolvedValueOnce(sampleTxs);

    const returnedForExport: Array<Record<string, unknown>> = [{ id: 'exp-1' }];
    getTransactionsForExportMock.mockResolvedValueOnce(returnedForExport);

    const element = await Page();
    const html = renderToStaticMarkup(element as unknown as React.ReactElement);

    expect(html.includes('data-testid="export-transactions"')).toBe(true);
    expect(html.includes('data-testid="no-transactions-plug"')).toBe(false);

    expect(exportTransactionsRenderMock).toHaveBeenCalledTimes(1);
    const props = exportTransactionsRenderMock.mock.calls[0][0] as {
      transactions: Array<Record<string, unknown>>;
      onExport: (startDate?: Date, endDate?: Date) => Promise<Array<Record<string, unknown>>>;
    };
    expect(props.transactions).toEqual(sampleTxs);

    const startDate = new Date('2020-01-01T00:00:00.000Z');
    const endDate = new Date('2020-01-31T23:59:59.999Z');
    const exportResult = await props.onExport(startDate, endDate);
    expect(getTransactionsForExportMock).toHaveBeenCalledTimes(1);
    expect(getTransactionsForExportMock).toHaveBeenCalledWith('user@example.com', startDate, endDate);
    expect(exportResult).toEqual(returnedForExport);
  });

    getCachedAllTransactionsMock.mockResolvedValueOnce(sampleTxs).mockResolvedValueOnce(sampleTxs);

    const exportResultValue: Array<Record<string, unknown>> = [{ id: 'exp-2' }];
    getTransactionsForExportMock.mockResolvedValueOnce(exportResultValue);

    const element = await Page();
    renderToStaticMarkup(element as unknown as React.ReactElement);

    const props = exportTransactionsRenderMock.mock.calls[0][0] as {
      onExport: (startDate?: Date, endDate?: Date) => Promise<Array<Record<string, unknown>>>;
    };
    const exportResult = await props.onExport();
    expect(getTransactionsForExportMock).toHaveBeenCalledWith('user@example.com', undefined, undefined);
    expect(exportResult).toEqual(exportResultValue);
  });


    const sampleTxs: Array<Record<string, unknown>> = [{ id: 'a' }];
    getCachedAllTransactionsMock.mockResolvedValueOnce(sampleTxs).mockResolvedValueOnce(sampleTxs);

    const element = await Page();
    renderToStaticMarkup(element as unknown as React.ReactElement);

    expect(getCachedAllTransactionsMock).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactionsMock).toHaveBeenNthCalledWith(1, undefined);
    expect(getCachedAllTransactionsMock).toHaveBeenNthCalledWith(2, undefined);

    const props = exportTransactionsRenderMock.mock.calls[0][0] as {
      onExport: (startDate?: Date, endDate?: Date) => Promise<Array<Record<string, unknown>>>;
    };

    await props.onExport();
    expect(getTransactionsForExportMock).toHaveBeenCalledWith(undefined, undefined, undefined);
  });

  test('propagates error when getCachedAuthSession rejects', async (): Promise<void> => {
    getCachedAuthSessionMock.mockRejectedValueOnce(new Error('Auth error'));

    await expect(Page()).rejects.toThrow('Auth error');
  });

  test('propagates error when getCachedAllTransactions rejects', async (): Promise<void> => {
    getCachedAllTransactionsMock.mockRejectedValueOnce(new Error('Transactions error'));

    await expect(Page()).rejects.toThrow('Transactions error');
  });

    getCachedAllTransactionsMock.mockResolvedValueOnce(sampleTxs).mockResolvedValueOnce(sampleTxs);

    getTransactionsForExportMock.mockRejectedValueOnce(new Error('Export error'));

    const element = await Page();
    renderToStaticMarkup(element as unknown as React.ReactElement);

    const props = exportTransactionsRenderMock.mock.calls[0][0] as {
      onExport: (startDate?: Date, endDate?: Date) => Promise<Array<Record<string, unknown>>>;
    };

    await expect(props.onExport()).rejects.toThrow('Export error');
  });
});
