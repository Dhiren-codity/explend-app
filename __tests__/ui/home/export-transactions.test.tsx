import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from 'app/ui/home/export-transactions';
import type { TTransaction } from '@/app/lib/types';
import {
  generateCSV,
  generateJSON,
  getExportFilename,
  getMimeType,
  downloadFile,
} from '@/app/lib/export-utils';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: () => null,
}));

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 16,
}));

vi.mock('@heroui/react', () => {
  const Select = ({
    label,
    selectedKeys,
    onChange,
    children,
  }: {
    label?: string;
    selectedKeys?: string[];
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children?: React.ReactNode;
  }): JSX.Element => {
    return (
      <label>
        {label ? <span>{label}</span> : null}
        <select aria-label={label} value={selectedKeys?.[0]} onChange={onChange}>
          {children}
        </select>
      </label>
    );
  };

  const SelectItem = ({
    value,
    children,
  }: {
    value?: string;
    children?: React.ReactNode;
  }): JSX.Element => {
    return <option value={value}>{children}</option>;
  };

  const Button = ({
    onPress,
    isLoading,
    children,
  }: {
    onPress?: () => void;
    isLoading?: boolean;
    children?: React.ReactNode;
  }): JSX.Element => {
    return (
      <button type="button" onClick={onPress} disabled={isLoading}>
        {children}
      </button>
    );
  };

  const Card = ({ children }: { children?: React.ReactNode }): JSX.Element => <div>{children}</div>;
  const CardHeader = ({ children }: { children?: React.ReactNode }): JSX.Element => <div>{children}</div>;
  const CardBody = ({ children }: { children?: React.ReactNode }): JSX.Element => <div>{children}</div>;

  type DateLike = { toString: () => string };
  const DateRangePicker = ({
    label,
    onChange,
  }: {
    label?: string;
    onChange?: (value: { start: DateLike; end: DateLike } | null) => void;
  }): JSX.Element => {
    return (
      <div>
        {label ? <span>{label}</span> : null}
        
          onClick={(): void => {
            onChange?.({
              start: { toString: () => '2024-01-01' },
              end: { toString: () => '2024-01-31' },
            });
          }}
        >
        </button>
        
          onClick={(): void => {
            onChange?.(null);
          }}
        >
        </button>
      </div>
    );
  };

  return {
    Select,
    SelectItem,
    Button,
    Card,
    CardBody,
    CardHeader,
    DateRangePicker,
  };

vi.mock('@/app/lib/export-utils', () => ({
  generateCSV: vi.fn(() => 'csv-content'),
  generateJSON: vi.fn(() => 'json-content'),
  getExportFilename: vi.fn((fmt: string) => `export.${fmt}`),
  getMimeType: vi.fn((fmt: string) => (fmt === 'csv' ? 'text/csv' : 'application/json')),
  downloadFile: vi.fn(),
}));

  const transactionB = { id: '2', amount: 200 } as unknown as TTransaction;
  const transactionsList: TTransaction[] = [transactionA, transactionB];

  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  beforeEach((): void => {
    vi.clearAllMocks();
  });


    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(
      screen.getByText('Ready to export all 2 transactions'),
    ).toBeInTheDocument();
  });


    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(onExport).not.toHaveBeenCalled();
      expect(generateCSV).toHaveBeenCalledWith(transactionsList);
      expect(generateJSON).not.toHaveBeenCalled();
      expect(getExportFilename).toHaveBeenCalledWith('csv');
      expect(getMimeType).toHaveBeenCalledWith('csv');
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv');
      expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
    });


    const formatSelect = screen.getByLabelText('Export Format') as HTMLSelectElement;
    fireEvent.change(formatSelect, { target: { value: 'json' } });

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(onExport).not.toHaveBeenCalled();
      expect(generateJSON).toHaveBeenCalledWith(transactionsList);
      expect(generateCSV).not.toHaveBeenCalled();
      expect(getExportFilename).toHaveBeenCalledWith('json');
      expect(getMimeType).toHaveBeenCalledWith('json');
      expect(downloadFile).toHaveBeenCalledWith('json-content', 'export.json', 'application/json');
      expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
    });


    expect(screen.getByText('Ready to export all 0 transactions')).toBeInTheDocument();

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
      expect(generateCSV).not.toHaveBeenCalled();
      expect(generateJSON).not.toHaveBeenCalled();
      expect(onExport).not.toHaveBeenCalled();
    });

  test('selecting a date range calls onExport with start and end-of-day end date, updates helper text, and exports: Promise<void>', async (): Promise<void> => {
    const rangedResult: TTransaction[] = [transactionA];
      .fn<[_start?: Date, _end?: Date], Promise<TTransaction[]>>()
      .mockImplementation(async (start?: Date, end?: Date): Promise<TTransaction[]> => {
        expect(start).toBeInstanceOf(Date);
        expect(end).toBeInstanceOf(Date);
        const endDate = end as Date;
        expect(endDate.getHours()).toBe(23);
        expect(endDate.getMinutes()).toBe(59);
        expect(endDate.getSeconds()).toBe(59);
        expect(endDate.getMilliseconds()).toBe(999);
        return rangedResult;
      });

    render(<ExportTransactions transactions={transactionsList} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Set Date Range' }));

    expect(
      screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1);
      expect(generateCSV).toHaveBeenCalledWith(rangedResult);
      expect(downloadFile).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction');
    });


    fireEvent.click(screen.getByRole('button', { name: 'Set Date Range' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
    });


    fireEvent.click(screen.getByRole('button', { name: 'Set Date Range' }));

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    expect(screen.getByRole('button', { name: 'Exporting...' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
      expect(delayedOnExport).toHaveBeenCalledTimes(1);
      expect(downloadFile).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });


    (generateCSV as unknown as vi.Mock).mockImplementationOnce(() => {
      throw new Error('Boom');
    });

    render(<ExportTransactions transactions={transactionsList} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
