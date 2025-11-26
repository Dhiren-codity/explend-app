import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import type { TTransaction } from '@/app/lib/types';
import toast from 'react-hot-toast';
import { downloadFile, generateCSV, generateJSON, getExportFilename, getMimeType } from '@/app/lib/export-utils';
import '@testing-library/jest-dom';

vi.mock('@heroui/react', async () => {
  const MockButton = ({
    children,
    onPress,
    isLoading,
    ..._props
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    isLoading?: boolean;
  }): JSX.Element => (
    <button type="button" onClick={onPress} disabled={Boolean(isLoading)}>
      {children}
    </button>
  );

  const MockSelectItem = ({
    value,
    children,
  }: {
    value?: string;
    children: React.ReactNode;
  }): JSX.Element => <option value={value}>{children}</option>;

  const MockSelect = ({
    label,
    selectedKeys,
    onChange,
    children,
  }: {
    label?: string;
    selectedKeys?: Iterable<string>;
    onChange?: (e: { target: { value: string } }) => void;
    children?: React.ReactNode;
  }): JSX.Element => {
    const value =
      selectedKeys && Array.isArray(selectedKeys) ? (selectedKeys[0] as string) : (selectedKeys as unknown as string);

    return (
      <label>
        <span>{label}</span>
        <select
          aria-label={label}
          value={value}
          onChange={(e): void => {
            onChange?.({ target: { value: (e.target as HTMLSelectElement).value } });
          }}
        >
          {children}
        </select>
      </label>
    );
  };

  const MockDateRangePicker = ({
    label,
    defaultValue,
    onChange,
  }: {
    label?: string;
    defaultValue?: { start: { toString: () => string }; end: { toString: () => string } };
    onChange?: (value: { start: { toString: () => string }; end: { toString: () => string } } | null) => void;
  }): JSX.Element => {
    const [start, setStart] = useState<string>(defaultValue?.start?.toString?.() ?? '');
    const [end, setEnd] = useState<string>(defaultValue?.end?.toString?.() ?? '');

    const emitChange = (nextStart: string, nextEnd: string): void => {
      if (!onChange) return;
      if (nextStart && nextEnd) {
        onChange({
          start: { toString: (): string => nextStart },
          end: { toString: (): string => nextEnd },
        });
      } else if (!nextStart && !nextEnd) {
        onChange(null);
      }
    };

    return (
      <div>
        <label>
          <span>{label}</span>
          <input
            aria-label={`${label} start`}
            type="date"
            value={start}
            onChange={(e): void => {
              const val = (e.target as HTMLInputElement).value;
              setStart(val);
              emitChange(val, end);
            }}
          />
          <input
            aria-label={`${label} end`}
            type="date"
            value={end}
            onChange={(e): void => {
              const val = (e.target as HTMLInputElement).value;
              setEnd(val);
              emitChange(start, val);
            }}
          />
        </label>
      </div>
    );
  };

  const MockCard = ({ children }: { children: React.ReactNode }): JSX.Element => <div>{children}</div>;
  const MockCardHeader = ({ children }: { children: React.ReactNode }): JSX.Element => <div>{children}</div>;
  const MockCardBody = ({ children }: { children: React.ReactNode }): JSX.Element => <div>{children}</div>;

  return {
    Button: MockButton,
    Card: MockCard,
    CardHeader: MockCardHeader,
    CardBody: MockCardBody,
    DateRangePicker: MockDateRangePicker,
    Select: MockSelect,
    SelectItem: MockSelectItem,
  };
});

vi.mock('react-hot-toast', () => {
  return {
    default: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: (): JSX.Element => <svg aria-hidden="true" />,
}));

vi.mock('@/app/lib/export-utils', () => {
  return {
    generateCSV: vi.fn((): string => 'csv-content'),
    generateJSON: vi.fn((): string => 'json-content'),
    downloadFile: vi.fn(),
    getExportFilename: vi.fn((fmt: string): string => (fmt === 'csv' ? 'export.csv' : 'export.json')),
    getMimeType: vi.fn((fmt: string): string => (fmt === 'csv' ? 'text/csv' : 'application/json')),
  };
});

describe('ExportTransactions', (): void => {
  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  test('renders with default CSV format and shows total count message', (): void => {
    const transactions = [{ id: 1 }, { id: 2 }] as unknown as TTransaction[];
    const onExport = vi.fn(async (): Promise<TTransaction[]> => transactions);

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();

    const formatSelect = screen.getByLabelText('Export Format') as HTMLSelectElement;
    expect(formatSelect.value).toBe('csv');

    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(
      screen.getByText('Ready to export all 2 transactions', { exact: false }),
    ).toBeInTheDocument();
  });

  test('exports as CSV by default without calling onExport when no date range', async (): Promise<void> => {
    const transactions = [{ id: 'a' }, { id: 'b' }] as unknown as TTransaction[];
    const onExport = vi.fn(async (): Promise<TTransaction[]> => transactions);

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor((): void => {
      expect(generateCSV).toHaveBeenCalledTimes(1);
      expect(generateCSV).toHaveBeenCalledWith(transactions);
      expect(generateJSON).not.toHaveBeenCalled();
      expect(onExport).not.toHaveBeenCalled();

      expect(getExportFilename).toHaveBeenCalledWith('csv');
      expect(getMimeType).toHaveBeenCalledWith('csv');
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv');

      expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
    });
  });

  test('switches to JSON format and exports correctly', async (): Promise<void> => {
    const transactions = [{ id: 1 }] as unknown as TTransaction[];
    const onExport = vi.fn(async (): Promise<TTransaction[]> => transactions);

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    const formatSelect = screen.getByLabelText('Export Format') as HTMLSelectElement;
    fireEvent.change(formatSelect, { target: { value: 'json' } });

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor((): void => {
      expect(generateJSON).toHaveBeenCalledTimes(1);
      expect(generateJSON).toHaveBeenCalledWith(transactions);
      expect(generateCSV).not.toHaveBeenCalled();

      expect(getExportFilename).toHaveBeenCalledWith('json');
      expect(getMimeType).toHaveBeenCalledWith('json');
      expect(downloadFile).toHaveBeenCalledWith('json-content', 'export.json', 'application/json');

      expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction');
    });
  });

  test('sets date range and calls onExport with correct dates and end-of-day handling', async (): Promise<void> => {
    const initialTransactions = [{ id: 1 }, { id: 2 }] as unknown as TTransaction[];
    const filtered = [{ id: 2 }] as unknown as TTransaction[];
    const onExport = vi.fn(async (_start?: Date, _end?: Date): Promise<TTransaction[]> => filtered);

    render(<ExportTransactions transactions={initialTransactions} onExport={onExport} />);

    const startInput = screen.getByLabelText('Date Range (Optional) start') as HTMLInputElement;
    const endInput = screen.getByLabelText('Date Range (Optional) end') as HTMLInputElement;

    fireEvent.change(startInput, { target: { value: '2023-01-01' } });
    fireEvent.change(endInput, { target: { value: '2023-01-31' } });

    expect(
      screen.getByText('Exporting transactions from 2023-01-01 to 2023-01-31'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
      const startArg = onExport.mock.calls[0][0] as Date;
      const endArg = onExport.mock.calls[0][1] as Date;

      expect(startArg).toBeInstanceOf(Date);
      expect(endArg).toBeInstanceOf(Date);

      expect(startArg.toISOString().slice(0, 10)).toBe('2023-01-01');
      expect(endArg.toISOString().slice(0, 10)).toBe('2023-01-31');
      expect(endArg.getHours()).toBe(23);
      expect(endArg.getMinutes()).toBe(59);
      expect(endArg.getSeconds()).toBe(59);

      expect(generateCSV).toHaveBeenCalledWith(filtered);
      expect(downloadFile).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction');
    });
  });

  test('shows error toast when no transactions to export (no date range)', async (): Promise<void> => {
    const transactions = [] as unknown as TTransaction[];
    const onExport = vi.fn(async (): Promise<TTransaction[]> => transactions);

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
      expect(generateCSV).not.toHaveBeenCalled();
      expect(generateJSON).not.toHaveBeenCalled();
    });
  });

  test('shows error toast when no transactions to export (date range yields empty)', async (): Promise<void> => {
    const initialTransactions = [{ id: 1 }] as unknown as TTransaction[];
    const onExport = vi.fn(async (): Promise<TTransaction[]> => [] as unknown as TTransaction[]);

    render(<ExportTransactions transactions={initialTransactions} onExport={onExport} />);

    const startInput = screen.getByLabelText('Date Range (Optional) start') as HTMLInputElement;
    const endInput = screen.getByLabelText('Date Range (Optional) end') as HTMLInputElement;

    fireEvent.change(startInput, { target: { value: '2024-04-01' } });
    fireEvent.change(endInput, { target: { value: '2024-04-30' } });

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
    });
  });

  test('handles export failure and shows error toast', async (): Promise<void> => {
    const transactions = [{ id: 1 }] as unknown as TTransaction[];
    const onExport = vi.fn(async (): Promise<TTransaction[]> => transactions);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation((): void => {});

    (downloadFile as unknown as ReturnType<typeof vi.fn>).mockImplementation((): void => {
      throw new Error('boom');
    });

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
