import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import toast from 'react-hot-toast';
import type { TTransaction } from '@/app/lib/types';
import { downloadFile, generateCSV, generateJSON, getExportFilename, getMimeType } from '@/app/lib/export-utils';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: (): null => null,
}));

vi.mock('@heroui/react', () => {
  const Select = (props: Record<string, unknown>): JSX.Element => {
    const label = props.label as string | undefined;
    const selectedKeys = (props.selectedKeys as string[] | undefined) ?? [];
    const onChange = props.onChange as ((e: unknown) => void) | undefined;
    return (
      <label>
        {label}
        <select
          aria-label={label}
          role="combobox"
          value={selectedKeys[0] ?? ''}
          onChange={(e): void => {
            if (onChange) onChange(e);
          }}
        >
          {props.children as JSX.Element}
        </select>
      </label>
    );
  };

  const SelectItem = (props: Record<string, unknown>): JSX.Element => {
    const value = props.value as string;
    return <option value={value}>{props.children as JSX.Element}</option>;
  };

  const DateRangePicker = (props: Record<string, unknown>): JSX.Element => {
    const label = props.label as string | undefined;
    const onChange = props.onChange as ((value: unknown) => void) | undefined;
    return (
      <div>
        {label ? <span>{label}</span> : null}
        <button
          type="button"
          onClick={(): void => {
            if (onChange) {
              onChange({
                start: { toString: (): string => '2023-01-01' },
                end: { toString: (): string => '2023-01-31' },
              });
            }
          }}
        >
          Set Date Range
        </button>
        <button
          type="button"
          onClick={(): void => {
            if (onChange) onChange(null);
          }}
        >
          Clear Date Range
        </button>
      </div>
    );
  };

  const Button = (props: Record<string, unknown>): JSX.Element => {
    const isLoading = props.isLoading === true;
    const onPress = props.onPress as (() => void) | undefined;
    const children = props.children as JSX.Element | string | undefined;
    return (
      <button
        type="button"
        onClick={(): void => {
          if (onPress) onPress();
        }}
        disabled={isLoading}
      >
        {isLoading ? 'Exporting...' : children}
      </button>
    );
  };

  const Card = (props: Record<string, unknown>): JSX.Element => <div>{props.children as JSX.Element}</div>;
  const CardHeader = (props: Record<string, unknown>): JSX.Element => <div>{props.children as JSX.Element}</div>;
  const CardBody = (props: Record<string, unknown>): JSX.Element => <div>{props.children as JSX.Element}</div>;

  return {
    Select,
    SelectItem,
    DateRangePicker,
    Button,
    Card,
    CardHeader,
    CardBody,
  };
});

vi.mock('@/app/lib/export-utils', () => ({
  downloadFile: vi.fn(),
  generateCSV: vi.fn(),
  generateJSON: vi.fn(),
  getExportFilename: vi.fn(),
  getMimeType: vi.fn(),
}));

describe('ExportTransactions', (): void => {
  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  const makeTransactions = (count: number): TTransaction[] => {
    const result = Array.from({ length: count }).map((_, idx) => ({
      id: String(idx + 1),
      amount: idx + 1,
      createdAt: `2023-01-${String(idx + 1).padStart(2, '0')}`,
    })) as unknown as TTransaction[];
    return result;
  };

  test('renders correctly with default props', (): void => {
    const transactions = makeTransactions(2);
    const onExport = vi.fn<[(Date | undefined)?, (Date | undefined)?], Promise<TTransaction[]>>().mockResolvedValue(
      transactions,
    );

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Export Format' })).toBeInTheDocument();
    expect(screen.getByText('Date Range (Optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument();
  });

  test('exports CSV without date range using provided transactions', async (): Promise<void> => {
    const transactions = makeTransactions(2);
    const onExport = vi.fn<[(Date | undefined)?, (Date | undefined)?], Promise<TTransaction[]>>().mockResolvedValue(
      [],
    );

    vi.mocked(generateCSV).mockReturnValue('csv-content');
    vi.mocked(getExportFilename).mockReturnValue('transactions.csv');
    vi.mocked(getMimeType).mockReturnValue('text/csv');

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(onExport).not.toHaveBeenCalled();
      expect(generateCSV).toHaveBeenCalledTimes(1);
      expect(generateCSV).toHaveBeenCalledWith(transactions);
      expect(generateJSON).not.toHaveBeenCalled();
      expect(getExportFilename).toHaveBeenCalledWith('csv');
      expect(getMimeType).toHaveBeenCalledWith('csv');
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'transactions.csv', 'text/csv');
      expect(vi.mocked(toast).success).toHaveBeenCalledWith('Exported 2 transactions');
    });
  });

  test('changing format to JSON exports JSON', async (): Promise<void> => {
    const transactions = makeTransactions(1);
    const onExport = vi.fn<[(Date | undefined)?, (Date | undefined)?], Promise<TTransaction[]>>().mockResolvedValue(
      transactions,
    );

    vi.mocked(generateJSON).mockReturnValue('json-content');
    vi.mocked(getExportFilename).mockReturnValue('transactions.json');
    vi.mocked(getMimeType).mockReturnValue('application/json');

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    const select = screen.getByRole('combobox', { name: 'Export Format' });
    fireEvent.change(select, { target: { value: 'json' } });

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(generateJSON).toHaveBeenCalledTimes(1);
      expect(generateCSV).not.toHaveBeenCalled();
      expect(getExportFilename).toHaveBeenCalledWith('json');
      expect(getMimeType).toHaveBeenCalledWith('json');
      expect(downloadFile).toHaveBeenCalledWith('json-content', 'transactions.json', 'application/json');
      expect(vi.mocked(toast).success).toHaveBeenCalledWith('Exported 1 transaction');
    });
  });

  test('sets and clears date range updates helper text', (): void => {
    const transactions = makeTransactions(3);
    const onExport = vi.fn<[(Date | undefined)?, (Date | undefined)?], Promise<TTransaction[]>>().mockResolvedValue(
      transactions,
    );

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Set Date Range' }));
    expect(
      screen.getByText('Exporting transactions from 2023-01-01 to 2023-01-31'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear Date Range' }));
    expect(screen.getByText('Ready to export all 3 transactions')).toBeInTheDocument();
  });

  test('when date range is set, calls onExport with correct dates and shows loading state', async (): Promise<void> => {
    const transactions = makeTransactions(2);
    let resolveFn: ((value: TTransaction[] | PromiseLike<TTransaction[]>) => void) | null = null;

    const onExport = vi
      .fn<[(Date | undefined)?, (Date | undefined)?], Promise<TTransaction[]>>()
      .mockImplementation(
        (_start?: Date, _end?: Date): Promise<TTransaction[]> =>
          new Promise<TTransaction[]>((resolve) => {
            resolveFn = resolve;
          }),
      );

    vi.mocked(generateCSV).mockReturnValue('csv-content');
    vi.mocked(getExportFilename).mockReturnValue('transactions.csv');
    vi.mocked(getMimeType).mockReturnValue('text/csv');

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Set Date Range' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(screen.getByRole('button', { name: 'Exporting...' })).toBeInTheDocument();
    expect(onExport).toHaveBeenCalledTimes(1);

    const call = onExport.mock.calls[0];
    const startDate = call[0] as Date;
    const endDate = call[1] as Date;

    expect(startDate).toBeInstanceOf(Date);
    expect(endDate).toBeInstanceOf(Date);
    expect(startDate.toISOString().slice(0, 10)).toBe('2023-01-01');
    expect(endDate.toISOString().slice(0, 10)).toBe('2023-01-31');
    expect(endDate.getHours()).toBe(23);
    expect(endDate.getMinutes()).toBe(59);
    expect(endDate.getSeconds()).toBe(59);

    if (resolveFn) resolveFn(transactions);

    await waitFor((): void => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'transactions.csv', 'text/csv');
      expect(vi.mocked(toast).success).toHaveBeenCalledWith('Exported 2 transactions');
    });
  });

  test('shows error toast when no transactions to export (date range path)', async (): Promise<void> => {
    const transactions = makeTransactions(5);
    const onExport = vi
      .fn<[(Date | undefined)?, (Date | undefined)?], Promise<TTransaction[]>>()
      .mockResolvedValue([]);

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Set Date Range' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(vi.mocked(toast).error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
      expect(generateCSV).not.toHaveBeenCalled();
      expect(generateJSON).not.toHaveBeenCalled();
    });
  });

  test('shows error toast when no transactions to export (no date range path)', async (): Promise<void> => {
    const transactions: TTransaction[] = [] as unknown as TTransaction[];
    const onExport = vi.fn<[(Date | undefined)?, (Date | undefined)?], Promise<TTransaction[]>>().mockResolvedValue(
      transactions,
    );

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(vi.mocked(toast).error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
      expect(generateCSV).not.toHaveBeenCalled();
      expect(generateJSON).not.toHaveBeenCalled();
      expect(onExport).not.toHaveBeenCalled();
    });
  });

  test('handles errors and shows failure toast', async (): Promise<void> => {
    const transactions = makeTransactions(2);
    const onExport = vi.fn<[(Date | undefined)?, (Date | undefined)?], Promise<TTransaction[]>>().mockResolvedValue(
      transactions,
    );

    vi.mocked(generateCSV).mockImplementation((): string => {
      throw new Error('boom');
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation((): void => {});

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(vi.mocked(toast).error).toHaveBeenCalledWith('Failed to export transactions');
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(downloadFile).not.toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});