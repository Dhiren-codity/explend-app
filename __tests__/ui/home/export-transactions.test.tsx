import React from 'react';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from './export-transactions';
import toast from 'react-hot-toast';
import { downloadFile, generateCSV, generateJSON, getExportFilename, getMimeType } from '@/app/lib/export-utils';

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 16,
}));

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: (): null => null,
}));

vi.mock('@internationalized/date', () => ({
  parseDate: vi.fn((value: string) => ({ toString: (): string => value })),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@heroui/react', () => {
  const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }): JSX.Element => {
    return <option value={value}>{children}</option>;
  };

  const Select = ({
    label,
    selectedKeys,
    onChange,
    children,
    className,
  }: {
    label?: string;
    selectedKeys?: string[];
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children?: React.ReactNode;
    className?: string;
  }): JSX.Element => {
    const value = selectedKeys?.[0] ?? '';
    return (
      <label>
        {label}
        <select aria-label={label} value={value} onChange={onChange} data-testid="export-format-select" className={className}>
          {children}
        </select>
      </label>
    );
  };

  const Button = ({
    children,
    onPress,
    isLoading,
    className,
    startContent,
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
    isLoading?: boolean;
    className?: string;
    startContent?: React.ReactNode;
  }): JSX.Element => {
    return (
      <button type="button" onClick={(): void => onPress?.()} aria-busy={isLoading === true} className={className}>
        {startContent}
        {children}
      </button>
    );
  };

  const Card = ({ children }: { children?: React.ReactNode }): JSX.Element => <div>{children}</div>;
  const CardHeader = ({ children }: { children?: React.ReactNode }): JSX.Element => <div>{children}</div>;
  const CardBody = ({ children, className }: { children?: React.ReactNode; className?: string }): JSX.Element => (
    <div className={className}>{children}</div>
  );

  const DateRangePicker = ({
    label,
    onChange,
    className,
  }: {
    label?: string;
    onChange?: (value: { start: { toString: () => string }; end: { toString: () => string } } | null) => void;
    className?: string;
  }): JSX.Element => {
    return (
      <div className={className}>
        <span>{label}</span>
        <button
          type="button"
          aria-label="set-date-range"
          onClick={(): void =>
            onChange?.({
              start: { toString: (): string => '2023-01-01' },
              end: { toString: (): string => '2023-01-31' },
            })
          }
        >
          Set Date
        </button>
        <button type="button" aria-label="clear-date-range" onClick={(): void => onChange?.(null)}>
          Clear Date
        </button>
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

vi.mock('@/app/lib/export-utils', () => ({
  generateCSV: vi.fn(() => 'csv-content'),
  generateJSON: vi.fn(() => 'json-content'),
  getExportFilename: vi.fn((format: string) => (format === 'csv' ? 'export.csv' : 'export.json')),
  getMimeType: vi.fn((format: string) => (format === 'csv' ? 'text/csv' : 'application/json')),
  downloadFile: vi.fn(),
}));


    const onExport = vi.fn();

    render(<ExportTransactions transactions={transactions as unknown as Record<string, unknown>[]} onExport={onExport} />);

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(screen.getByText('Date Range (Optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument();
  });

    const onExport = vi.fn();

    render(<ExportTransactions transactions={transactions as unknown as Record<string, unknown>[]} onExport={onExport} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await await waitFor((): void => {
      expect(onExport).not.toHaveBeenCalled();
      expect(generateCSV).toHaveBeenCalledTimes(1);
      expect(generateCSV).toHaveBeenCalledWith(transactions);
      expect(getExportFilename).toHaveBeenCalledWith('csv');
      expect(getMimeType).toHaveBeenCalledWith('csv');
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv');
      expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
    });

    const onExport = vi.fn();

    render(<ExportTransactions transactions={transactions as unknown as Record<string, unknown>[]} onExport={onExport} />);

    const select = screen.getByLabelText('Export Format');
    fireEvent.change(select, { target: { value: 'json' } });

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await await waitFor((): void => {
      expect(onExport).not.toHaveBeenCalled();
      expect(generateJSON).toHaveBeenCalledTimes(1);
      expect(generateJSON).toHaveBeenCalledWith(transactions);
      expect(getExportFilename).toHaveBeenCalledWith('json');
      expect(getMimeType).toHaveBeenCalledWith('json');
      expect(downloadFile).toHaveBeenCalledWith('json-content', 'export.json', 'application/json');
      expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction');
    });

    const filteredTransactions = [{ id: 'only-one' }];
    const onExport = vi.fn(async (_start?: Date, _end?: Date): Promise<Record<string, unknown>[]> => {
      return new Promise((resolve) => setTimeout(() => resolve(filteredTransactions), 0));
    });

    render(<ExportTransactions transactions={initialTransactions as unknown as Record<string, unknown>[]} onExport={onExport} />);

    // Set date range via mocked DateRangePicker
    const setRangeButton = screen.getByRole('button', { name: 'set-date-range' });
    fireEvent.click(setRangeButton);

    expect(screen.getByText('Exporting transactions from 2023-01-01 to 2023-01-31')).toBeInTheDocument();

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
    });

    const [startArg, endArg] = onExport.mock.calls[0] as [Date, Date];
    expect(startArg).toBeInstanceOf(Date);
    expect(endArg).toBeInstanceOf(Date);
    expect(startArg.toISOString().startsWith('2023-01-01')).toBe(true);
    expect(endArg.getHours()).toBe(23);
    expect(endArg.getMinutes()).toBe(59);
    expect(endArg.getSeconds()).toBe(59);
    expect(endArg.getMilliseconds()).toBe(999);

    await await waitFor((): void => {
      expect(generateCSV).toHaveBeenCalledWith(filteredTransactions);
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv');
      expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction');
    });

    const onExport = vi.fn(async (): Promise<Record<string, unknown>[]> => {
      return [];
    });

    render(<ExportTransactions transactions={initialTransactions as unknown as Record<string, unknown>[]} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'set-date-range' }));

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
      expect(generateCSV).not.toHaveBeenCalled();
      expect(generateJSON).not.toHaveBeenCalled();
      expect(downloadFile).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
    });

    const onExport = vi.fn(async (): Promise<Record<string, unknown>[]> => {
      throw new Error('Boom');
    });

    render(<ExportTransactions transactions={transactions as unknown as Record<string, unknown>[]} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'set-date-range' }));

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
      expect(downloadFile).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions');
    });

    const onExport = vi.fn();

    render(<ExportTransactions transactions={transactions as unknown as Record<string, unknown>[]} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'set-date-range' }));
    expect(screen.getByText('Exporting transactions from 2023-01-01 to 2023-01-31')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'clear-date-range' }));
    expect(screen.getByText('Ready to export all 3 transactions')).toBeInTheDocument();
  });
