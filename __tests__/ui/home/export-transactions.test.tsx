import React from 'react';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import toast from 'react-hot-toast';
import ExportTransactions from 'app/ui/home/export-transactions';
import {
import '@testing-library/jest-dom';
  generateCSV,
  generateJSON,
  downloadFile,
  getExportFilename,
  getMimeType,
} from '@/app/lib/export-utils';

// Mocks
vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 20,
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: () => null,
}));

vi.mock('@heroui/react', () => {
  const ReactLib = require('react');

  type SelectProps = {
    label?: string;
    selectedKeys?: Iterable<string> | string[];
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children?: React.ReactNode;
    className?: string;
  };

  type SelectItemProps = {
    value?: string;
    children?: React.ReactNode;
    key?: string;
  };

  type ButtonProps = {
    children?: React.ReactNode;
    onPress?: () => void;
    isLoading?: boolean;
    color?: string;
    startContent?: React.ReactNode;
    className?: string;
  };

  type SimpleProps = {
    children?: React.ReactNode;
    className?: string;
  };

  type DateRangePickerProps = {
    label?: string;
    className?: string;
    defaultValue?: unknown;
    onChange?: (value: { start: { toString: () => string }; end: { toString: () => string } } | null) => void;
  };

  const Card = ({ children }: SimpleProps): React.ReactElement => <div data-testid="card">{children}</div>;
  const CardHeader = ({ children }: SimpleProps): React.ReactElement => <div>{children}</div>;
  const CardBody = ({ children }: SimpleProps): React.ReactElement => <div>{children}</div>;

  const Select = ({ label, selectedKeys, onChange, children }: SelectProps): React.ReactElement => {
    const value = Array.isArray(selectedKeys)
      ? (selectedKeys[0] as string | undefined)
      : selectedKeys
        ? (Array.from(selectedKeys as Iterable<string>)[0] as string | undefined)
        : undefined;
    return (
      <label>
        <span>{label}</span>
        <select aria-label={label} value={value} onChange={(e): void => onChange?.(e)}>
          {children}
        </select>
      </label>
    );
  };

  const SelectItem = ({ value, children, key }: SelectItemProps): React.ReactElement => {
    const optionValue = value ?? key ?? '';
    return <option value={optionValue}>{children}</option>;
  };

  const Button = ({ children, onPress, isLoading }: ButtonProps): React.ReactElement => (
    <button type="button" onClick={onPress} disabled={!!isLoading} aria-busy={!!isLoading}>
      {isLoading ? 'Exporting...' : children}
    </button>
  );

  const DateRangePicker = ({ label, onChange }: DateRangePickerProps): React.ReactElement => (
    <div>
      <span>{label}</span>
      <button
        type="button"
        aria-label="Apply date range"
        onClick={(): void =>
          onChange?.({
            start: { toString: () => '2024-01-01' },
            end: { toString: () => '2024-01-31' },
          })
        }
      >
        Apply date range
      </button>
      <button type="button" aria-label="Clear date range" onClick={(): void => onChange?.(null)}>
        Clear date range
      </button>
    </div>
  );

  return {
    Card,
    CardHeader,
    CardBody,
    Select,
    SelectItem,
    Button,
    DateRangePicker,
  };
});

vi.mock('@/app/lib/export-utils', () => ({
  generateCSV: vi.fn().mockReturnValue('csv-content'),
  generateJSON: vi.fn().mockReturnValue('json-content'),
  downloadFile: vi.fn(),
  getExportFilename: vi.fn().mockImplementation((fmt: unknown) => (fmt === 'json' ? 'export.json' : 'export.csv')),
  getMimeType: vi.fn().mockImplementation((fmt: unknown) => (fmt === 'json' ? 'application/json' : 'text/csv')),
}));

type OnExportFn = (startDate?: Date, endDate?: Date) => Promise<unknown[]>;

const ExportTransactionsComponent = ExportTransactions as unknown as React.ComponentType<{
  transactions: unknown[];
  onExport: OnExportFn;
}>;

const createDeferred = <T,>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (err: unknown) => void;
} => {
  let resolve!: (value: T) => void;
  let reject!: (err: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('ExportTransactions', () => {
  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });


    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(screen.getByText('Date Range (Optional)')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'Export' });
    expect(button).toBeInTheDocument();

    expect(screen.getByText('Ready to export all 1 transaction')).toBeInTheDocument();
  });

    );

    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument();
  });


    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await await waitFor((): void => {
      expect(generateCSV).toHaveBeenCalledTimes(1);
      expect(generateJSON).not.toHaveBeenCalled();
      expect(onExport).not.toHaveBeenCalled();
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv');
      expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
    });
  });


    const select = screen.getByLabelText('Export Format') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'json' } });

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await await waitFor((): void => {
      expect(generateJSON).toHaveBeenCalledTimes(1);
      expect(generateCSV).not.toHaveBeenCalled();
      expect(downloadFile).toHaveBeenCalledWith('json-content', 'export.json', 'application/json');
      expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction');
    });
  });


    fireEvent.click(screen.getByRole('button', { name: 'Apply date range' }));

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
      const [startArg, endArg] = onExport.mock.calls[0] as [Date, Date];
      expect(startArg).toBeInstanceOf(Date);
      expect(endArg).toBeInstanceOf(Date);
      // End date should be set to end of day local time
      expect(endArg.getHours()).toBe(23);
      expect(endArg.getMinutes()).toBe(59);
      expect(endArg.getSeconds()).toBe(59);
      expect(endArg.getMilliseconds()).toBe(999);
      expect(downloadFile).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
    });
  });

    const onExport = vi.fn<OnExportFn>().mockResolvedValue(returned);
    render(<ExportTransactionsComponent transactions={[]} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Apply date range' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
      expect(generateCSV).toHaveBeenCalledWith(returned);
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv');
      expect(toast.success).toHaveBeenCalledWith('Exported 3 transactions');
    });
  });


    fireEvent.click(screen.getByRole('button', { name: 'Apply date range' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(screen.getByRole('button', { name: 'Exporting...' })).toBeInTheDocument();

    deferred.resolve([{ id: '1' }]);
    await await waitFor((): void => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });
  });


    fireEvent.click(screen.getByRole('button', { name: 'Apply date range' }));

    await await waitFor((): void => {
      expect(
        screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31')
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Clear date range' }));

    await await waitFor((): void => {
      expect(screen.getByText('Ready to export all 1 transaction')).toBeInTheDocument();
    });
  });


    fireEvent.click(screen.getByRole('button', { name: 'Apply date range' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor((): void => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions');
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });
  });


    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
  });


    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor((): void => {
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'custom.csv', 'text/csv; charset=utf-8');
      expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction');
    });
  });
});
