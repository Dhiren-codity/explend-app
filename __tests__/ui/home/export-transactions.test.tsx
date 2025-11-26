import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import '@testing-library/jest-dom';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: (): JSX.Element => <span data-icon="download" />,
}));

vi.mock('@internationalized/date', () => ({
  parseDate: (value: string): { toString: () => string } => ({
    toString: (): string => value,
  }),
}));

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 16,
}));

vi.mock('@heroui/react', async () => {
  const ReactModule = await import('react');
  const ReactLib = ReactModule as unknown as typeof React;
  type DateRangeValue = { start: { toString: () => string }; end: { toString: () => string } };

  const Card: React.FC<{ children?: React.ReactNode }> = ({ children }) => <div>{children}</div>;
  const CardHeader: React.FC<{ children?: React.ReactNode }> = ({ children }) => <div>{children}</div>;
  const CardBody: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children }) => <div>{children}</div>;

  const Select: React.FC<{
    label?: string;
    selectedKeys?: string[];
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    className?: string;
    children?: React.ReactNode;
  }> = ({ label, selectedKeys, onChange, children }) => {
    return (
      <label>
        {label}
        <select aria-label={label} value={selectedKeys ? selectedKeys[0] : ''} onChange={onChange}>
          {children}
        </select>
      </label>
    );
  };

  const SelectItem: React.FC<{ value: string; children?: React.ReactNode }> = ({ value, children }) => {
    return <option value={value}>{children}</option>;
  };

  const Button: React.FC<{
    color?: string;
    startContent?: React.ReactNode;
    onPress?: () => void;
    isLoading?: boolean;
    className?: string;
    children?: React.ReactNode;
  }> = ({ onPress, isLoading, children, startContent }) => {
    return (
      <button onClick={onPress} disabled={!!isLoading}>
        {startContent}
        {children}
      </button>
    );
  };

  const DateRangePicker: React.FC<{
    label?: string;
    className?: string;
    defaultValue?: DateRangeValue | undefined;
    onChange?: (value: DateRangeValue | null) => void;
  }> = ({ label, onChange }) => {
    const [start, setStart] = ReactLib.useState<string>('');
    const [end, setEnd] = ReactLib.useState<string>('');

    const notifyChange = (s: string, e: string): void => {
      if (onChange) {
        if (s && e) {
          onChange({
            start: { toString: () => s },
            end: { toString: () => e },
          });
        } else {
          onChange(null);
        }
      }
    };

    return (
      <div>
        <label>
          {label}
          <input
            aria-label={`${label} Start`}
            type="date"
            value={start}
            onChange={(ev): void => {
              const val = (ev.target as HTMLInputElement).value;
              setStart(val);
              notifyChange(val, end);
            }}
          />
          <input
            aria-label={`${label} End`}
            type="date"
            value={end}
            onChange={(ev): void => {
              const val = (ev.target as HTMLInputElement).value;
              setEnd(val);
              notifyChange(start, val);
            }}
          />
        </label>
      </div>
    );
  };

  return {
    Button,
    Card,
    CardBody,
    CardHeader,
    DateRangePicker,
    Select,
    SelectItem,
  };
});

vi.mock('@/app/lib/export-utils', () => {
  return {
    generateCSV: vi.fn((_rows: ReadonlyArray<Record<string, unknown>>): string => 'csv-content'),
    generateJSON: vi.fn((_rows: ReadonlyArray<Record<string, unknown>>): string => 'json-content'),
    downloadFile: vi.fn((_content: string, _filename: string, _mime: string): void => {}),
    getExportFilename: vi.fn((fmt: string): string => (fmt === 'json' ? 'export.json' : 'export.csv')),
    getMimeType: vi.fn((fmt: string): string => (fmt === 'json' ? 'application/json' : 'text/csv')),
  };
});

import toast from 'react-hot-toast';
import {
  generateCSV,
  generateJSON,
  downloadFile,
  getExportFilename,
  getMimeType,
} from '@/app/lib/export-utils';

describe('ExportTransactions', () => {
  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  const sampleTransactionsTwo = [
    { id: '1', amount: 10, date: '2024-05-10', description: 'Coffee' },
    { id: '2', amount: 20, date: '2024-05-11', description: 'Groceries' },
  ] as unknown as Array<Record<string, unknown>>;
  const sampleTransactionsOne = [
    { id: '1', amount: 10, date: '2024-05-10', description: 'Coffee' },
  ] as unknown as Array<Record<string, unknown>>;

  test('renders heading, default message, and Export button', (): void => {
    const onExport = vi.fn(async (): Promise<Array<Record<string, unknown>>> => sampleTransactionsTwo);

    render(<ExportTransactions transactions={sampleTransactionsTwo as unknown as never[]} onExport={onExport as unknown as never} />);

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
  });

  test('shows singular "transaction" when only one', (): void => {
    const onExport = vi.fn(async (): Promise<Array<Record<string, unknown>>> => sampleTransactionsOne);

    render(<ExportTransactions transactions={sampleTransactionsOne as unknown as never[]} onExport={onExport as unknown as never} />);

    expect(screen.getByText('Ready to export all 1 transaction')).toBeInTheDocument();
  });

  test('exports CSV by default without date range (uses props transactions) and shows success toast', async (): Promise<void> => {
    const onExport = vi.fn(async (): Promise<Array<Record<string, unknown>>> => sampleTransactionsTwo);

    render(<ExportTransactions transactions={sampleTransactionsTwo as unknown as never[]} onExport={onExport as unknown as never} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor((): void => {
      expect(onExport).not.toHaveBeenCalled();
      expect(generateCSV).toHaveBeenCalledWith(sampleTransactionsTwo);
      expect(generateJSON).not.toHaveBeenCalled();
      expect(getExportFilename).toHaveBeenCalledWith('csv');
      expect(getMimeType).toHaveBeenCalledWith('csv');
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv');
      expect((toast as unknown as { success: (msg: string) => void }).success).toHaveBeenCalledWith('Exported 2 transactions');
    });
  });

  test('switches to JSON and exports using JSON generators', async (): Promise<void> => {
    const onExport = vi.fn(async (): Promise<Array<Record<string, unknown>>> => sampleTransactionsTwo);

    render(<ExportTransactions transactions={sampleTransactionsTwo as unknown as never[]} onExport={onExport as unknown as never} />);

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'json' } });

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor((): void => {
      expect(onExport).not.toHaveBeenCalled();
      expect(generateJSON).toHaveBeenCalledWith(sampleTransactionsTwo);
      expect(generateCSV).not.toHaveBeenCalled();
      expect(getExportFilename).toHaveBeenCalledWith('json');
      expect(getMimeType).toHaveBeenCalledWith('json');
      expect(downloadFile).toHaveBeenCalledWith('json-content', 'export.json', 'application/json');
      expect((toast as unknown as { success: (msg: string) => void }).success).toHaveBeenCalledWith('Exported 2 transactions');
    });
  });

  test('selecting a date range updates helper text', async (): Promise<void> => {
    const onExport = vi.fn(async (): Promise<Array<Record<string, unknown>>> => sampleTransactionsTwo);

    render(<ExportTransactions transactions={sampleTransactionsTwo as unknown as never[]} onExport={onExport as unknown as never} />);

    const startInput = screen.getByLabelText('Date Range (Optional) Start') as HTMLInputElement;
    const endInput = screen.getByLabelText('Date Range (Optional) End') as HTMLInputElement;

    fireEvent.change(startInput, { target: { value: '2024-05-01' } });
    fireEvent.change(endInput, { target: { value: '2024-05-31' } });

    expect(screen.getByText('Exporting transactions from 2024-05-01 to 2024-05-31')).toBeInTheDocument();
  });

  test('exports with date range using onExport and adjusts end time to end of day', async (): Promise<void> => {
    const returned = [{ id: '3' }] as unknown as Array<Record<string, unknown>>;
    const onExport = vi.fn(async (_start?: Date, _end?: Date): Promise<Array<Record<string, unknown>>> => returned);

    render(<ExportTransactions transactions={sampleTransactionsTwo as unknown as never[]} onExport={onExport as unknown as never} />);

    const startInput = screen.getByLabelText('Date Range (Optional) Start') as HTMLInputElement;
    const endInput = screen.getByLabelText('Date Range (Optional) End') as HTMLInputElement;

    fireEvent.change(startInput, { target: { value: '2024-05-01' } });
    fireEvent.change(endInput, { target: { value: '2024-05-31' } });

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
    });

    const call = onExport.mock.calls[0] as [Date, Date];
    const startDate = call[0];
    const endDate = call[1];

    expect(startDate).toBeInstanceOf(Date);
    expect(endDate).toBeInstanceOf(Date);
    expect(startDate.toISOString().startsWith('2024-05-01')).toBe(true);
    expect(endDate.getHours()).toBe(23);
    expect(endDate.getMinutes()).toBe(59);
    expect(endDate.getSeconds()).toBe(59);
    expect(endDate.getMilliseconds()).toBe(999);

    await waitFor((): void => {
      expect(generateCSV).toHaveBeenCalledWith(returned);
      expect((toast as unknown as { success: (msg: string) => void }).success).toHaveBeenCalledWith('Exported 1 transaction');
      expect(downloadFile).toHaveBeenCalled();
    });
  });

  test('shows loading state during async export and reverts after completion', async (): Promise<void> => {
    const delayed: Array<Record<string, unknown>> = [{ id: '1' }];
    const onExport = vi.fn(
      async (): Promise<Array<Record<string, unknown>>> =>
        await new Promise<Array<Record<string, unknown>>>((resolve) => setTimeout(() => resolve(delayed), 50)),
    );

    render(<ExportTransactions transactions={sampleTransactionsTwo as unknown as never[]} onExport={onExport as unknown as never} />);

    const startInput = screen.getByLabelText('Date Range (Optional) Start') as HTMLInputElement;
    const endInput = screen.getByLabelText('Date Range (Optional) End') as HTMLInputElement;

    fireEvent.change(startInput, { target: { value: '2024-05-01' } });
    fireEvent.change(endInput, { target: { value: '2024-05-31' } });

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    expect(screen.getByRole('button', { name: 'Exporting...' })).toBeInTheDocument();
    expect((screen.getByRole('button', { name: 'Exporting...' }) as HTMLButtonElement).disabled).toBe(true);

    await waitFor((): void => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });
  });

  test('shows error toast when no transactions available without date range', async (): Promise<void> => {
    const onExport = vi.fn(async (): Promise<Array<Record<string, unknown>>> => []);

    render(<ExportTransactions transactions={[] as unknown as never[]} onExport={onExport as unknown as never} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor((): void => {
      expect((toast as unknown as { error: (msg: string) => void }).error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
      expect(generateCSV).not.toHaveBeenCalled();
      expect(generateJSON).not.toHaveBeenCalled();
      expect(onExport).not.toHaveBeenCalled();
    });
  });

  test('shows error toast when onExport returns empty with date range', async (): Promise<void> => {
    const onExport = vi.fn(async (): Promise<Array<Record<string, unknown>>> => []);

    render(<ExportTransactions transactions={sampleTransactionsTwo as unknown as never[]} onExport={onExport as unknown as never} />);

    const startInput = screen.getByLabelText('Date Range (Optional) Start') as HTMLInputElement;
    const endInput = screen.getByLabelText('Date Range (Optional) End') as HTMLInputElement;

    fireEvent.change(startInput, { target: { value: '2024-05-01' } });
    fireEvent.change(endInput, { target: { value: '2024-05-31' } });

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
      expect((toast as unknown as { error: (msg: string) => void }).error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
      expect(generateCSV).not.toHaveBeenCalled();
      expect(generateJSON).not.toHaveBeenCalled();
    });
  });

  test('handles export errors and shows failure toast', async (): Promise<void> => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation((): void => {});
    const onExport = vi.fn(async (): Promise<Array<Record<string, unknown>>> => {
      throw new Error('Failed');
    });

    render(<ExportTransactions transactions={sampleTransactionsTwo as unknown as never[]} onExport={onExport as unknown as never} />);

    const startInput = screen.getByLabelText('Date Range (Optional) Start') as HTMLInputElement;
    const endInput = screen.getByLabelText('Date Range (Optional) End') as HTMLInputElement;

    fireEvent.change(startInput, { target: { value: '2024-05-01' } });
    fireEvent.change(endInput, { target: { value: '2024-05-31' } });

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
      expect((toast as unknown as { error: (msg: string) => void }).error).toHaveBeenCalledWith('Failed to export transactions');
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
});
