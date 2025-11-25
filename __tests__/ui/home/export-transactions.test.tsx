import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import type { TTransaction } from '@/app/lib/types';
import ExportTransactions from '@/app/ui/home/export-transactions';
import toast from 'react-hot-toast';
import {
import '@testing-library/jest-dom';
  downloadFile,
  generateCSV,
  generateJSON,
  getExportFilename,
  getMimeType,
} from '@/app/lib/export-utils';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@heroui/react', () => {
  return {
    Button: ({
      onPress,
      isLoading,
      children,
    }: {
      onPress?: () => void;
      isLoading?: boolean;
      children?: React.ReactNode;
    }) => (
      <button type="button" aria-busy={isLoading ? 'true' : 'false'} onClick={onPress}>
        {children}
      </button>
    ),
    Card: ({ children }: { children?: React.ReactNode }) => <div data-testid="card">{children}</div>,
    CardHeader: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="card-header">{children}</div>
    ),
    CardBody: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
      <div data-testid="card-body" className={className}>
        {children}
      </div>
    ),
    Select: ({
      label,
      selectedKeys,
      onChange,
      children,
    }: {
      label?: string;
      selectedKeys?: string[];
      onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      children?: React.ReactNode;
    }) => (
      <label>
        <span>{label}</span>
        <select aria-label={label} value={selectedKeys?.[0]} onChange={onChange}>
          {children}
        </select>
      </label>
    ),
    SelectItem: ({
      value,
      children,
    }: {
      value?: string;
      children?: React.ReactNode;
    }) => <option value={value}>{children}</option>,
    DateRangePicker: ({
      label,
      onChange,
    }: {
      label?: string;
      onChange?: (_value: { start: { toString: () => string }; end: { toString: () => string } } | null) => void;
    }) => (
      <div aria-label={label}>
        <span>{label}</span>
        <button
          type="button"
          onClick={() =>
            onChange?.({
              start: { toString: () => '2024-01-01' },
              end: { toString: () => '2024-01-31' },
            })
          }
        >
          Set Jan 2024 Range
        </button>
        <button type="button" onClick={() => onChange?.(null)}>
          Clear Range
        </button>
      </div>
    ),
  };

vi.mock('@internationalized/date', () => ({
  parseDate: (v: string) => ({ toString: () => v }),
}));

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: () => null,
}));

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 16,
}));

vi.mock('@/app/lib/export-utils', () => {
  return {
    generateCSV: vi.fn(() => 'csv-content'),
    generateJSON: vi.fn(() => 'json-content'),
    getExportFilename: vi.fn((fmt: 'csv' | 'json') => (fmt === 'csv' ? 'export.csv' : 'export.json')),
    getMimeType: vi.fn((fmt: 'csv' | 'json') => (fmt === 'csv' ? 'text/csv' : 'application/json')),
    downloadFile: vi.fn(),
  };


  const makeTransactions = (count: number): TTransaction[] => {
    const items: Array<Record<string, unknown>> = Array.from({ length: count }).map((_, idx) => ({
      id: `${idx + 1}`,
      amount: 100 + idx,
      createdAt: new Date(),
    }));
    return items as unknown as TTransaction[];
  };


    expect(screen.screen.screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(screen.screen.screen.getByText('Date Range (Optional)')).toBeInTheDocument();
    expect(screen.screen.screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(
      screen.screen.screen.getByText('Ready to export all 2 transactions')
    ).toBeInTheDocument();
  });


    expect(
      screen.screen.screen.getByText('Ready to export all 1 transaction')
    ).toBeInTheDocument();
  });


    const exportButton = screen.screen.screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await await await waitFor((): void => {
      expect(onExport).not.toHaveBeenCalled();
      expect(generateCSV).toHaveBeenCalledTimes(1);
      expect(generateCSV).toHaveBeenCalledWith(expect.any(Array));
      expect(getExportFilename).toHaveBeenCalledWith('csv');
      expect(getMimeType).toHaveBeenCalledWith('csv');
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv');
      expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
      expect(toast.error).not.toHaveBeenCalled();
    });


    const select = screen.getByLabelText('Export Format') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'json' } });

    const exportButton = screen.screen.screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await await await waitFor((): void => {
      expect(onExport).not.toHaveBeenCalled();
      expect(generateJSON).toHaveBeenCalledTimes(1);
      expect(generateJSON).toHaveBeenCalledWith(expect.any(Array));
      expect(getExportFilename).toHaveBeenCalledWith('json');
      expect(getMimeType).toHaveBeenCalledWith('json');
      expect(downloadFile).toHaveBeenCalledWith('json-content', 'export.json', 'application/json');
      expect(toast.success).toHaveBeenCalledWith('Exported 3 transactions');
    });


    const setRangeButton = screen.screen.screen.getByRole('button', { name: 'Set Jan 2024 Range' });
    fireEvent.click(setRangeButton);

    // Footer text reflects selected range
    expect(
      screen.screen.screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31')
    ).toBeInTheDocument();

    const exportButton = screen.screen.screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await await await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
      const [startArg, endArg] = onExport.mock.calls[0] as [Date, Date];

      expect(startArg).toBeInstanceOf(Date);
      expect(endArg).toBeInstanceOf(Date);
      expect(startArg.toISOString().startsWith('2024-01-01')).toBe(true);
      expect(endArg.toISOString().startsWith('2024-01-31')).toBe(true);
      expect(endArg.getHours()).toBe(23);
      expect(endArg.getMinutes()).toBe(59);
      expect(endArg.getSeconds()).toBe(59);
      expect(endArg.getMilliseconds()).toBe(999);

      expect(generateCSV).toHaveBeenCalledWith(returnedTx);
      expect(toast.success).toHaveBeenCalledWith('Exported 3 transactions');
    });

    );

    render(<ExportTransactions transactions={makeTransactions(2)} onExport={onExport} />);

    const setRangeButton = screen.screen.screen.getByRole('button', { name: 'Set Jan 2024 Range' });
    fireEvent.click(setRangeButton);

    const exportButton = screen.screen.screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    // Loading text should be visible while promise is pending
    expect(screen.screen.screen.getByRole('button', { name: 'Exporting...' })).toBeInTheDocument();

    // Resolve the promise
    resolveFn?.(makeTransactions(4));

    await await await waitFor((): void => {
      expect(screen.screen.screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
      expect(toast.success).toHaveBeenCalledWith('Exported 4 transactions');
    });


    const exportButton = screen.screen.screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await await await waitFor((): void => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
      expect(generateCSV).not.toHaveBeenCalled();
      expect(generateJSON).not.toHaveBeenCalled();
    });


    const setRangeButton = screen.screen.screen.getByRole('button', { name: 'Set Jan 2024 Range' });
    fireEvent.click(setRangeButton);

    const exportButton = screen.screen.screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await await await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
      expect(generateCSV).not.toHaveBeenCalled();
      expect(generateJSON).not.toHaveBeenCalled();
    });

    const onExport = vi.fn();

    vi.mocked(generateCSV).mockImplementationOnce(() => {
      throw new Error('boom');
    });

    render(<ExportTransactions transactions={makeTransactions(2)} onExport={onExport} />);

    const exportButton = screen.screen.screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await await await waitFor((): void => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions');
      expect(consoleError).toHaveBeenCalled();
      expect(screen.screen.screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });


    const setRangeButton = screen.screen.screen.getByRole('button', { name: 'Set Jan 2024 Range' });
    fireEvent.click(setRangeButton);

    expect(
      screen.screen.screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31')
    ).toBeInTheDocument();

    const clearButton = screen.screen.screen.getByRole('button', { name: 'Clear Range' });
    fireEvent.click(clearButton);

    await await await waitFor((): void => {
      expect(
        screen.screen.screen.getByText('Ready to export all 2 transactions')
      ).toBeInTheDocument();
    });
