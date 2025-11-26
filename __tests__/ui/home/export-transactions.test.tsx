import React, { ReactElement } from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import type { TTransaction } from '@/app/lib/types';
import toast from 'react-hot-toast';
import {
import '@testing-library/jest-dom';
  generateCSV,
  generateJSON,
  downloadFile,
  getExportFilename,
  getMimeType,
} from '@/app/lib/export-utils';

vi.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: (_props: { size?: number }): ReactElement => (
    <span data-testid="mock-icon" />
  ),
}));

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 16,
}));

vi.mock('@/app/lib/export-utils', () => ({
  generateCSV: vi.fn(() => 'mock-csv-content'),
  generateJSON: vi.fn(() => 'mock-json-content'),
  downloadFile: vi.fn(),
  getExportFilename: vi.fn((format: string) =>
    format === 'csv' ? 'transactions.csv' : 'transactions.json',
  ),
  getMimeType: vi.fn((format: string) =>
    format === 'csv' ? 'text/csv' : 'application/json',
  ),
}));

vi.mock('@heroui/react', async () => {
  const ReactModule = await vi.importActual<typeof import('react')>('react');
  const ReactLib = ReactModule as typeof import('react');

  const Select = ({
    label,
    selectedKeys,
    onChange,
    children,
    className,
  }: {
    label?: string;
    selectedKeys?: string[];
    onChange?: (e: { target: { value: string } }) => void;
    children?: ReactLib.ReactNode;
    className?: string;
  }): ReactElement => {
    const options = ReactLib.Children.toArray(children) as ReactLib.ReactElement[];
    const value = selectedKeys?.[0] ?? '';
    return (
      <label className={className}>
        {label}
        <select
          aria-label={label}
          data-testid="format-select"
          value={value}
          onChange={(e) => onChange?.({ target: { value: e.target.value } })}
        >
          {options.map((opt) => {
            const val = (opt.props.value ?? String(opt.key)) as string;
            const text = opt.props.children as string;
            return (
              <option key={val} value={val}>
                {text}
              </option>
            );
          })}
        </select>
      </label>
    );
  };

  const SelectItem = ({
    children,
  }: {
    children?: ReactLib.ReactNode;
  }): ReactElement | null => {
    return <>{children}</>;
  };

  const Button = ({
    children,
    onPress,
    isLoading,
    startContent,
    className,
    color,
  }: {
    children?: ReactLib.ReactNode;
    onPress?: () => void;
    isLoading?: boolean;
    startContent?: ReactLib.ReactNode;
    className?: string;
    color?: string;
  }): ReactElement => {
    return (
      <button type="button" className={className} data-color={color} onClick={onPress}>
        {!isLoading && startContent}
        {children}
      </button>
    );
  };

  const DateRangePicker = ({
    label,
    onChange,
    className,
  }: {
    label?: string;
    onChange?: (
      value:
        | {
            start: { toString: () => string };
            end: { toString: () => string };
          }
        | null,
    ) => void;
    className?: string;
  }): ReactElement => {
    return (
      <div className={className}>
        <span>{label}</span>
        <button
          type="button"
          aria-label="set-date-range"
          onClick={() =>
            onChange?.({
              start: { toString: () => '2024-01-01' },
              end: { toString: () => '2024-01-31' },
            })
          }
        >
          Set Date
        </button>
        <button type="button" aria-label="clear-date-range" onClick={() => onChange?.(null)}>
          Clear Date
        </button>
      </div>
    );
  };

  const Card = ({ children }: { children?: ReactLib.ReactNode }): ReactElement => (
    <div>{children}</div>
  );
  const CardBody = ({ children, className }: { children?: ReactLib.ReactNode; className?: string }): ReactElement => (
    <div className={className}>{children}</div>
  );
  const CardHeader = ({ children }: { children?: ReactLib.ReactNode }): ReactElement => (
    <div>{children}</div>
  );

  return {
    Select,
    SelectItem,
    Button,
    DateRangePicker,
    Card,
    CardBody,
    CardHeader,
  };
});

const createTransactions = (count: number): TTransaction[] => {
  const rows = Array.from({ length: count }, (_v, i) => ({
    id: String(i + 1),
    amount: i + 10,
    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
  }));
  return rows as unknown as TTransaction[];
};

describe('ExportTransactions', () => {
  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  test('renders with default props and accessibility labels', (): void => {
    const transactions = createTransactions(2);
    const onExport = vi.fn(async (): Promise<TTransaction[]> => transactions);

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(screen.getByText('Date Range (Optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(
      screen.getByText('Ready to export all 2 transactions'),
    ).toBeInTheDocument();
  });

  test('exports CSV by default with provided transactions (no date range)', async (): Promise<void> => {
    const transactions = createTransactions(2);
    const onExport = vi.fn(async (): Promise<TTransaction[]> => transactions);

    vi.mocked(generateCSV).mockReturnValue('csv-content');
    vi.mocked(getExportFilename).mockReturnValue('file.csv');
    vi.mocked(getMimeType).mockReturnValue('text/csv');

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(onExport).not.toHaveBeenCalled();
      expect(generateCSV).toHaveBeenCalledTimes(1);
      expect(generateCSV).toHaveBeenCalledWith(transactions);
      expect(generateJSON).not.toHaveBeenCalled();
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'file.csv', 'text/csv');
      expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
    });
  });

  test('switches to JSON format and exports JSON', async (): Promise<void> => {
    const transactions = createTransactions(3);
    const onExport = vi.fn(async (): Promise<TTransaction[]> => transactions);

    vi.mocked(generateJSON).mockReturnValue('json-content');
    vi.mocked(getExportFilename).mockReturnValue('file.json');
    vi.mocked(getMimeType).mockReturnValue('application/json');

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    const formatSelect = screen.getByTestId('format-select');
    fireEvent.change(formatSelect, { target: { value: 'json' } });

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(onExport).not.toHaveBeenCalled();
      expect(generateJSON).toHaveBeenCalledTimes(1);
      expect(generateJSON).toHaveBeenCalledWith(transactions);
      expect(generateCSV).not.toHaveBeenCalled();
      expect(downloadFile).toHaveBeenCalledWith(
        'json-content',
        'file.json',
        'application/json',
      );
      expect(toast.success).toHaveBeenCalledWith('Exported 3 transactions');
    });
  });

  test('selecting date range uses onExport(start, end) and exports result', async (): Promise<void> => {
    const allTransactions = createTransactions(5);
    const filtered = createTransactions(1);

    const onExport = vi.fn(async (_start?: Date, _end?: Date): Promise<TTransaction[]> => filtered);

    vi.mocked(generateCSV).mockReturnValue('filtered-csv');
    vi.mocked(getExportFilename).mockReturnValue('range.csv');
    vi.mocked(getMimeType).mockReturnValue('text/csv');

    render(<ExportTransactions transactions={allTransactions} onExport={onExport} />);

    fireEvent.click(screen.getByLabelText('set-date-range'));

    expect(
      screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1);
    });

    const callArgs = onExport.mock.calls[0];
    const startDate = callArgs[0] as Date;
    const endDate = callArgs[1] as Date;

    // Verify end of day adjustment
    expect(startDate).toBeInstanceOf(Date);
    expect(endDate).toBeInstanceOf(Date);
    expect(endDate.getHours()).toBe(23);
    expect(endDate.getMinutes()).toBe(59);
    expect(endDate.getSeconds()).toBe(59);
    expect(endDate.getMilliseconds()).toBe(999);

    await waitFor(() => {
      expect(generateCSV).toHaveBeenCalledWith(filtered);
      expect(downloadFile).toHaveBeenCalledWith('filtered-csv', 'range.csv', 'text/csv');
      expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction');
    });
  });

  test('date range returns no transactions -> shows error and does not download', async (): Promise<void> => {
    const allTransactions = createTransactions(4);
    const onExport = vi.fn(async (): Promise<TTransaction[]> => [] as unknown as TTransaction[]);

    render(<ExportTransactions transactions={allTransactions} onExport={onExport} />);

    fireEvent.click(screen.getByLabelText('set-date-range'));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
      expect(generateCSV).not.toHaveBeenCalled();
      expect(generateJSON).not.toHaveBeenCalled();
    });
  });

  test('handles errors during export (generator throws) and resets loading state', async (): Promise<void> => {
    const transactions = createTransactions(2);
    const onExport = vi.fn(async (): Promise<TTransaction[]> => transactions);

    vi.mocked(generateCSV).mockImplementation(() => {
      throw new Error('gen fail');
    });

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions');
      expect(downloadFile).not.toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });
  });

  test('shows loading state while exporting and restores after completion', async (): Promise<void> => {
    const transactions = createTransactions(3);

    let resolveFn: ((value: TTransaction[]) => void) | undefined;
    const onExport = vi.fn(
      (_start?: Date, _end?: Date): Promise<TTransaction[]> =>
        new Promise<TTransaction[]>((resolve) => {
          resolveFn = resolve;
        }),
    );

    vi.mocked(generateCSV).mockReturnValue('csv-content');
    vi.mocked(getExportFilename).mockReturnValue('file.csv');
    vi.mocked(getMimeType).mockReturnValue('text/csv');

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    // Set a date range to trigger onExport path
    fireEvent.click(screen.getByLabelText('set-date-range'));

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(screen.getByText('Exporting...')).toBeInTheDocument();
    });

    // Resolve the async export
    if (resolveFn) {
      resolveFn(transactions as unknown as TTransaction[]);
    }

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
      expect(toast.success).toHaveBeenCalledWith('Exported 3 transactions');
    });
  });

  test('clearing date range resets info text', async (): Promise<void> => {
    const transactions = createTransactions(1);
    const onExport = vi.fn(async (): Promise<TTransaction[]> => transactions);

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    fireEvent.click(screen.getByLabelText('set-date-range'));
    expect(
      screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('clear-date-range'));

    await waitFor(() => {
      expect(
        screen.getByText('Ready to export all 1 transaction'),
      ).toBeInTheDocument();
    });
  });
});
