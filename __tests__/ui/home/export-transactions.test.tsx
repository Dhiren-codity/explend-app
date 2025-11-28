import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import toast from 'react-hot-toast';
import {
  generateCSV,
  generateJSON,
  downloadFile,
  getExportFilename,
  getMimeType,
} from '@/app/lib/export-utils';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: () => null,
}));

vi.mock('@internationalized/date', () => ({
  parseDate: (value: string) => ({ toString: () => value }),
}));

vi.mock('@heroui/react', () => {
  const React = require('react');
  type SelectProps = {
    label?: string;
    selectedKeys?: string[];
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    className?: string;
    children?: React.ReactNode;
  };
  type SelectItemProps = {
    children?: React.ReactNode;
    value?: string;
  };
  type DateRangePickerProps = {
    label?: string;
    defaultValue?: { start: { toString: () => string }; end: { toString: () => string } };
    onChange?: (value: { start: { toString: () => string }; end: { toString: () => string } } | null) => void;
    className?: string;
  };
  type ButtonProps = {
    onPress?: () => void;
    isLoading?: boolean;
    children?: React.ReactNode;
    color?: string;
    startContent?: React.ReactNode;
    className?: string;
  };
  const Select = ({ label, selectedKeys, onChange, children }: SelectProps) => (
    <label>
      {label}
      <select aria-label={label} value={selectedKeys?.[0] ?? ''} onChange={onChange} data-testid="heroui-select">
        {children}
      </select>
    </label>
  );
  const SelectItem = ({ children, value }: SelectItemProps) => (
    <option value={value}>{children}</option>
  );
  const DateRangePicker = ({ label, onChange }: DateRangePickerProps) => (
    <div>
      {label ? <div>{label}</div> : null}
      
        onClick={() =>
          onChange?.({
            start: { toString: () => '2024-01-01' },
            end: { toString: () => '2024-01-31' },
          })
        }
      >
      </button>
      <button type="button" onClick={() => onChange?.(null)}>
      </button>
    </div>
  );
  const Button = ({ onPress, isLoading, children }: ButtonProps) => (
    <button type="button" onClick={onPress} disabled={isLoading}>
      {children}
    </button>
  );
  const Card = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  const CardBody = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  );
  const CardHeader = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;

  return {
    Select,
    SelectItem,
    DateRangePicker,
    Button,
    Card,
    CardBody,
    CardHeader,
  };
});

vi.mock('@/app/lib/export-utils', () => ({
  generateCSV: vi.fn().mockReturnValue('csvcontent'),
  generateJSON: vi.fn().mockReturnValue('jsoncontent'),
  downloadFile: vi.fn(),
  getExportFilename: vi.fn().mockImplementation((format: string) =>
    format === 'csv' ? 'transactions.csv' : 'transactions.json'
  ),
  getMimeType: vi.fn().mockImplementation((format: string) =>
    format === 'csv' ? 'text/csv' : 'application/json'
  ),
}));

describe('ExportTransactions', () => {
  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });


    render(
      
        onExport={vi.fn() as unknown as (start?: Date, end?: Date) => Promise<unknown[]>}
      />
    );

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();

    expect(
      screen.getByText('Ready to export all 3 transactions')
    ).toBeInTheDocument();
  });

    const onExportMock = vi.fn() as unknown as (start?: Date, end?: Date) => Promise<unknown[]>;

    render(
      
      />
    );

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(generateCSV).toHaveBeenCalledTimes(1);
    });

    expect(onExportMock).not.toHaveBeenCalled();
    expect(generateCSV).toHaveBeenCalledWith(transactions);
    expect(getExportFilename).toHaveBeenCalledWith('csv');
    expect(getMimeType).toHaveBeenCalledWith('csv');
    expect(downloadFile).toHaveBeenCalledWith('csvcontent', 'transactions.csv', 'text/csv');
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
  });

    const onExportMock = vi.fn() as unknown as (start?: Date, end?: Date) => Promise<unknown[]>;

    render(
      
      />
    );

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'json' } });

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(generateJSON).toHaveBeenCalledTimes(1);
    });

    expect(onExportMock).not.toHaveBeenCalled();
    expect(generateCSV).not.toHaveBeenCalled();
    expect(generateJSON).toHaveBeenCalledWith(transactions);
    expect(getExportFilename).toHaveBeenCalledWith('json');
    expect(getMimeType).toHaveBeenCalledWith('json');
    expect(downloadFile).toHaveBeenCalledWith('jsoncontent', 'transactions.json', 'application/json');
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
  });

    const onExportMock = vi.fn().mockResolvedValue([{ id: 'ex1' }]) as unknown as (start?: Date, end?: Date) => Promise<unknown[]>;

    render(
      
      />
    );

    fireEvent.click(screen.getByText('Set Range'));
    expect(
      screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(onExportMock).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByText('Clear Range'));
    expect(
      screen.getByText('Ready to export all 1 transaction')
    ).toBeInTheDocument();
  });

    const returned = [{ id: 'r1' }] as unknown as unknown[];
    const onExportSpy = vi.fn().mockResolvedValue(returned) as unknown as (start?: Date, end?: Date) => Promise<unknown[]>;

    render(
      
      />
    );

    fireEvent.click(screen.getByText('Set Range'));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(onExportSpy).toHaveBeenCalledTimes(1);
    });

    const callArgs = (onExportSpy as unknown as vi.Mock).mock.calls[0] as unknown[];
    const startArg = callArgs[0] as Date;
    const endArg = callArgs[1] as Date;

    expect(startArg).toBeInstanceOf(Date);
    expect(endArg).toBeInstanceOf(Date);
    expect(endArg.getMinutes()).toBe(59);
    expect(endArg.getSeconds()).toBe(59);
    expect(endArg.getMilliseconds()).toBe(999);

    expect(generateCSV).toHaveBeenCalledWith(returned);
    expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction');
  });


    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
    });

    expect(onExportMock).not.toHaveBeenCalled();
    expect(downloadFile).not.toHaveBeenCalled();
    expect(generateCSV).not.toHaveBeenCalled();
    expect(generateJSON).not.toHaveBeenCalled();
  });

    const error = new Error('fetch failed');
    const onExportMock = vi.fn().mockRejectedValue(error) as unknown as (start?: Date, end?: Date) => Promise<unknown[]>;

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation((): void => {});

    render(
      
      />
    );

    fireEvent.click(screen.getByText('Set Range'));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions');
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

    let resolveExport: ((value: unknown) => void) | null = null;
      .fn()
      .mockImplementation(
        (): Promise<unknown[]> =>
          new Promise((resolve) => {
            resolveExport = resolve;
          })
      ) as unknown as (start?: Date, end?: Date) => Promise<unknown[]>;

    render(
      
      />
    );

    fireEvent.click(screen.getByText('Set Range'));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(screen.getByRole('button', { name: 'Exporting...' })).toBeInTheDocument();

    resolveExport?.([{ id: 'done' }]);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });

    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });
});
