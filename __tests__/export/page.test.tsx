import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import Page, { metadata } from './page';
import { getCachedAuthSession, getCachedAllTransactions, getTransactionsForExport } from '../lib/actions';

vi.mock('react/jsx-runtime', () => {
  const jsx = (type: unknown, props: Record<string, unknown> | undefined, _key?: unknown): Record<string, unknown> => {
    return { type, props };
  };
  const jsxs = jsx;
  const Fragment = 'Fragment';
  return { jsx, jsxs, Fragment };
});

vi.mock('@/config/constants/navigation', () => {
  return {
    NAV_TITLE: {
      EXPORT: 'Export',
    },
  };

vi.mock('../lib/actions', () => {
  return {
    getCachedAuthSession: vi.fn(),
    getCachedAllTransactions: vi.fn(),
    getTransactionsForExport: vi.fn(),
  };

vi.mock('../ui/home/export-transactions', () => {
  return {
    default: 'ExportTransactions',
  };

vi.mock('../ui/no-transactions-plug', () => {
  return {
    default: 'NoTransactionsPlug',
  };

vi.mock('../ui/sidebar/with-sidebar', () => {
  return {
    default: 'WithSidebar',
  };





  const transactionsValue = [{ id: 't1' }, { id: 't2' }] as unknown[];
  const exportedTransactions = [{ id: 'e1' }] as unknown[];

  beforeEach((): void => {
    vi.clearAllMocks();
    (getCachedAuthSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(sessionValue);
    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(transactionsValue);
    (getTransactionsForExport as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(exportedTransactions);
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  test('metadata has correct title', (): void => {
    expect(metadata.title).toBe('Export');
  });

  test('renders WithSidebar and ExportTransactions with transactions and provides working onExport', async (): Promise<void> => {
    const element = await Page();
    expect(isElement(element)).toBe(true);
    const root = element as MockElement;
    expect(root.type).toBe('WithSidebar');

    const contentNearby = root.props?.contentNearby as unknown;
    expect(isElement(contentNearby)).toBe(true);

    const exportNodes = findElementsByType(contentNearby, 'ExportTransactions');
    expect(exportNodes.length).toBe(1);
    const exportNode = exportNodes[0];

    expect(exportNode.props?.transactions).toEqual(transactionsValue);
    const onExport = exportNode.props?.onExport as ((startDate?: Date, endDate?: Date) => Promise<unknown[]>);
    expect(typeof onExport).toBe('function');

    const startDate = new Date('2024-01-01T00:00:00.000Z');
    const endDate = new Date('2024-12-31T00:00:00.000Z');
    const result = await onExport(startDate, endDate);
    expect(result).toEqual(exportedTransactions);

    expect((getCachedAuthSession as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(2);
    expect((getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(2);
    const firstAllTxCallArgs = (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as unknown[];
    const secondAllTxCallArgs = (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mock.calls[1] as unknown[];
    expect(firstAllTxCallArgs[0]).toBe(userId);
    expect(secondAllTxCallArgs[0]).toBe(userId);

    const exportCallArgs = (getTransactionsForExport as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as unknown[];
    expect(exportCallArgs[0]).toBe(userId);
    expect(exportCallArgs[1]).toEqual(startDate);
    expect(exportCallArgs[2]).toEqual(endDate);
  });

  test('renders NoTransactionsPlug when there are no transactions', async (): Promise<void> => {
    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    const element = await Page();
    const root = element as MockElement;
    expect(root.type).toBe('WithSidebar');

    const contentNearby = root.props?.contentNearby as unknown;
    const noTxNodes = findElementsByType(contentNearby, 'NoTransactionsPlug');
    expect(noTxNodes.length).toBe(1);

    const exportNodes = findElementsByType(contentNearby, 'ExportTransactions');
    expect(exportNodes.length).toBe(0);
  });

  test('propagates error when getCachedAllTransactions fails', async (): Promise<void> => {
    const err = new Error('fetch all transactions failed');
    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(err);
    await expect(Page()).rejects.toThrow('fetch all transactions failed');
  });

  test('works when session is null and still renders ExportTransactions if transactions exist; onExport uses undefined userId', async (): Promise<void> => {
    (getCachedAuthSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(transactionsValue).mockResolvedValueOnce(transactionsValue);

    const element = await Page();
    const root = element as MockElement;
    expect(root.type).toBe('WithSidebar');

    const contentNearby = root.props?.contentNearby as unknown;
    const exportNodes = findElementsByType(contentNearby, 'ExportTransactions');
    expect(exportNodes.length).toBe(1);
    const exportNode = exportNodes[0];
    const onExport = exportNode.props?.onExport as ((startDate?: Date, endDate?: Date) => Promise<unknown[]>);
    expect(typeof onExport).toBe('function');

    await onExport(undefined, undefined);

    const exportCallArgs = (getTransactionsForExport as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as unknown[];
    expect(exportCallArgs[0]).toBeUndefined();
    expect(exportCallArgs[1]).toBeUndefined();
    expect(exportCallArgs[2]).toBeUndefined();
  });

  test('onExport propagates error when getTransactionsForExport fails', async (): Promise<void> => {
    const exportError = new Error('export failed');
    (getTransactionsForExport as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(exportError);

    const element = await Page();
    const root = element as MockElement;
    const contentNearby = root.props?.contentNearby as unknown;
    const exportNodes = findElementsByType(contentNearby, 'ExportTransactions');
    expect(exportNodes.length).toBe(1);
    const exportNode = exportNodes[0];
    const onExport = exportNode.props?.onExport as ((startDate?: Date, endDate?: Date) => Promise<unknown[]>);

    await expect(onExport()).rejects.toThrow('export failed');
  });
