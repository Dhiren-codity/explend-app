import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import Page, { metadata } from './page';
import { NAV_TITLE } from '@/config/constants/navigation';
import { getCachedAllTransactions, getCachedAuthSession, getTransactionsForExport } from '../lib/actions';
import ExportTransactions from '../ui/home/export-transactions';
import NoTransactionsPlug from '../ui/no-transactions-plug';
import WithSidebar from '../ui/sidebar/with-sidebar';

vi.mock('@/config/constants/navigation', () => {
  return { NAV_TITLE: { EXPORT: 'Export' } };
});

vi.mock('../lib/actions', () => {
  return {
    getCachedAllTransactions: vi.fn(),
    getCachedAuthSession: vi.fn(),
    getTransactionsForExport: vi.fn(),
  };
});

vi.mock('../ui/home/export-transactions', () => {
  return { default: vi.fn((_props: unknown) => null) };
});

vi.mock('../ui/no-transactions-plug', () => {
  return { default: vi.fn((_props: unknown) => null) };
});

vi.mock('../ui/sidebar/with-sidebar', () => {
  return { default: vi.fn((_props: unknown) => null) };
});

type ReactElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

describe('Page', (): void => {
  const defaultUserId = 'user@example.com';
  const sampleTransactions = [{ id: 't1' } as Record<string, unknown>];

  beforeEach((): void => {
    vi.clearAllMocks();

    (getCachedAuthSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: defaultUserId },
    });

    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      sampleTransactions,
    );

    (getTransactionsForExport as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'exp1' } as Record<string, unknown>,
    ]);
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  test('metadata has correct title', (): void => {
    expect(metadata.title).toBe(NAV_TITLE.EXPORT);
  });

  test('renders ExportTransactions when transactions exist and wires onExport correctly', async (): Promise<void> => {
    const element = (await Page()) as unknown as ReactElementLike;

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect((getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>)).toHaveBeenNthCalledWith(
      1,
      defaultUserId,
    );
    expect((getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>)).toHaveBeenNthCalledWith(
      2,
      defaultUserId,
    );

    expect(element).toBeDefined();
    expect(element.props).toBeDefined();
    expect(element.props.contentNearby).toBeDefined();

    const content = element.props.contentNearby as unknown as ReactElementLike;
    const contentChildren = content.props.children as unknown[];

    const heading = (contentChildren as ReactElementLike[]).find(
      (child: unknown) =>
        Boolean(child) &&
        (child as ReactElementLike).type === 'h1',
    ) as ReactElementLike;
    expect(heading).toBeDefined();
    expect(heading.props.children).toBe(NAV_TITLE.EXPORT);

    const container = (contentChildren as ReactElementLike[]).find(
      (child: unknown) =>
        Boolean(child) &&
        (child as ReactElementLike).type === 'div' &&
        typeof (child as ReactElementLike).props.className === 'string' &&
        ((child as ReactElementLike).props.className as string).includes('max-w-2xl'),
    ) as ReactElementLike;

    expect(container).toBeDefined();

    const exportEl = container.props.children as unknown as ReactElementLike;
    expect(exportEl.type).toBe(ExportTransactions);
    expect(exportEl.props.transactions).toEqual(sampleTransactions);

    const startDate = new Date('2023-01-01T00:00:00.000Z');
    const endDate = new Date('2023-12-31T23:59:59.999Z');

    const onExport = exportEl.props.onExport as unknown as (_a?: Date, _b?: Date) => Promise<unknown>;
    const exported = (await onExport(startDate, endDate)) as unknown as Record<string, unknown>[];

    expect(getTransactionsForExport).toHaveBeenCalledTimes(1);
    expect((getTransactionsForExport as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
      defaultUserId,
      startDate,
      endDate,
    );
    expect(Array.isArray(exported)).toBe(true);
  });

  test('renders NoTransactionsPlug when no transactions exist', async (): Promise<void> => {
    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);
    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

    const element = (await Page()) as unknown as ReactElementLike;

    const content = element.props.contentNearby as unknown as ReactElementLike;
    const contentChildren = content.props.children as unknown[];

    const container = (contentChildren as ReactElementLike[]).find(
      (child: unknown) =>
        Boolean(child) &&
        (child as ReactElementLike).type === 'div' &&
        typeof (child as ReactElementLike).props.className === 'string' &&
        ((child as ReactElementLike).props.className as string).includes('max-w-3xl'),
    ) as ReactElementLike;

    expect(container).toBeDefined();

    const noTxEl = container.props.children as unknown as ReactElementLike;
    expect(noTxEl.type).toBe(NoTransactionsPlug);
  });

  test('passes undefined userId when session is missing', async (): Promise<void> => {
    (getCachedAuthSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await Page();

    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect((getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>)).toHaveBeenNthCalledWith(
      1,
      undefined,
    );
    expect((getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>)).toHaveBeenNthCalledWith(
      2,
      undefined,
    );
  });

  test('throws when getCachedAuthSession (awaited call) rejects', async (): Promise<void> => {
    (getCachedAuthSession as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ user: { email: defaultUserId } })
      .mockRejectedValueOnce(new Error('session failed'));

    await expect(Page()).rejects.toThrow('session failed');
    expect(getCachedAllTransactions).not.toHaveBeenCalled();
  });

  test('throws when getCachedAllTransactions (awaited call) rejects', async (): Promise<void> => {
    (getCachedAuthSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: defaultUserId },
    });

    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error('tx error'));

    await expect(Page()).rejects.toThrow('tx error');
  });

  test('onExport propagates errors from getTransactionsForExport', async (): Promise<void> => {
    const error = new Error('export failed');
    (getTransactionsForExport as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);

    const element = (await Page()) as unknown as ReactElementLike;
    const content = element.props.contentNearby as unknown as ReactElementLike;
    const contentChildren = content.props.children as unknown[];

    const container = (contentChildren as ReactElementLike[]).find(
      (child: unknown) =>
        Boolean(child) &&
        (child as ReactElementLike).type === 'div' &&
        typeof (child as ReactElementLike).props.className === 'string' &&
        ((child as ReactElementLike).props.className as string).includes('max-w-2xl'),
    ) as ReactElementLike;

    const exportEl = container.props.children as unknown as ReactElementLike;
    expect(exportEl.type).toBe(ExportTransactions);

    const onExport = exportEl.props.onExport as unknown as (_a?: Date, _b?: Date) => Promise<unknown>;

    await expect(onExport()).rejects.toThrow('export failed');
    expect(getTransactionsForExport).toHaveBeenCalledWith(defaultUserId, undefined, undefined);
  });

  test('outer component is WithSidebar and receives contentNearby prop', async (): Promise<void> => {
    const element = (await Page()) as unknown as ReactElementLike;
    expect(element.type).toBe(WithSidebar);
    expect(element.props.contentNearby).toBeDefined();
  });
});
