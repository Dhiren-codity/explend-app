import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import toast from 'react-hot-toast';
import {
  generateCSV,
  generateJSON,
  getExportFilename,
  getMimeType,
  downloadFile,
} from '@/app/lib/export-utils';

vi.mock('react-hot-toast', () => {
  return {
    default: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock('react-icons/pi', () => {
  return {
    PiDownloadSimpleFill: () => null,
  };
});

vi.mock('@/config/constants/main', () => {
  return {
    DEFAULT_ICON_SIZE: 16,
  };
});

vi.mock('@heroui/react', () => {
  const React = require('react');
  return {
    Button: ({ onPress, isLoading, children, ...rest }: any) => {
      return (
        <button type="button" aria-busy={isLoading} onClick={onPress} {...rest}>
          {children}
        </button>
      );
    },
    Card: ({ children, ...rest }: any) => {
      return <div {...rest}>{children}</div>;
    },
    CardBody: ({ children, ...rest }: any) => {
      return <div {...rest}>{children}</div>;
    },
    CardHeader: ({ children, ...rest }: any) => {
      return <div {...rest}>{children}</div>;
    },
    Select: ({ label, selectedKeys, onChange, children, className }: any) => {
      const value = Array.isArray(selectedKeys) ? selectedKeys[0] : undefined;
      return (
        <label className={className}>
          <span>{label}</span>
          <select aria-label={label} value={value} onChange={onChange}>
            {children}
          </select>
        </label>
      );
    },
    SelectItem: ({ value, children }: any) => {
      return <option value={value}>{children}</option>;
    },
    DateRangePicker: ({ label, onChange, className }: any) => {
      return (
        <div className={className}>
          <span>{label}</span>
          
            onClick={() =>
              onChange({
                start: { toString: () => '2023-01-01' },
                end: { toString: () => '2023-01-31' },
              })
            }
          >
          </button>
          <button type="button" data-testid="clear-range" onClick={() => onChange(null)}>
          </button>
        </div>
      );
    },
  };
});

vi.mock('@/app/lib/export-utils', () => {
  return {
    generateCSV: vi.fn(() => 'csvcontent'),
    generateJSON: vi.fn(() => 'jsoncontent'),
    getExportFilename: vi.fn((fmt: string) => (fmt === 'json' ? 'file.json' : 'file.csv')),
    getMimeType: vi.fn((fmt: string) => (fmt === 'json' ? 'application/json' : 'text/csv')),
    downloadFile: vi.fn(),
  };
});

describe('ExportTransactions', () => {
  const mockTransactions = [
    { id: '1', amount: 100, date: '2023-01-10' },
    { id: '2', amount: 200, date: '2023-01-12' },
  ] as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders heading, controls, and default info text', () => {
    const onExport = vi.fn();
    render(<ExportTransactions transactions={mockTransactions} onExport={onExport} />);
    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(screen.getByText('Date Range (Optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(
      screen.getByText('Ready to export all 2 transactions')
    ).toBeInTheDocument();
  });

  test('exports CSV by default using provided transactions (no date range)', () => {
    const onExport = vi.fn();
    render(<ExportTransactions transactions={mockTransactions} onExport={onExport} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    exportButton.click();

    expect(onExport).not.toHaveBeenCalled();
    expect(generateCSV).toHaveBeenCalledTimes(1);
    expect(generateCSV).toHaveBeenCalledWith(mockTransactions);
    expect(getExportFilename).toHaveBeenCalledWith('csv');
    expect(getMimeType).toHaveBeenCalledWith('csv');
    expect(downloadFile).toHaveBeenCalledWith('csvcontent', 'file.csv', 'text/csv');
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
  });

  test('switching format to JSON uses JSON generators', () => {
    const onExport = vi.fn();
    render(<ExportTransactions transactions={mockTransactions} onExport={onExport} />);

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement;
    select.value = 'json';
    select.dispatchEvent(new Event('change', { bubbles: true }));

    const exportButton = screen.getByRole('button', { name: 'Export' });
    exportButton.click();

    expect(generateJSON).toHaveBeenCalledTimes(1);
    expect(generateJSON).toHaveBeenCalledWith(mockTransactions);
    expect(getExportFilename).toHaveBeenCalledWith('json');
    expect(getMimeType).toHaveBeenCalledWith('json');
    expect(downloadFile).toHaveBeenCalledWith('jsoncontent', 'file.json', 'application/json');
  });

  test('date range triggers onExport with adjusted end date and exports returned data', async () => {
    const returned = [{ id: '3', amount: 300, date: '2023-01-15' }] as any;
    const onExport = vi.fn(async (start?: Date, end?: Date) => {
      return returned;
    });

    render(<ExportTransactions transactions={mockTransactions} onExport={onExport} />);

    screen.getByTestId('set-range').click();

    const exportButton = screen.getByRole('button', { name: 'Export' });
    exportButton.click();

    await Promise.resolve();

    expect(onExport).toHaveBeenCalledTimes(1);
    const [startArg, endArg] = onExport.mock.calls[0];
    expect(startArg).toBeInstanceOf(Date);
    expect(endArg).toBeInstanceOf(Date);
    expect((startArg as Date).toISOString().startsWith('2023-01-01')).toBe(true);
    const end = endArg as Date;
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
    expect(end.getMilliseconds()).toBe(999);

    expect(generateCSV).toHaveBeenCalledWith(returned);
    expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction');
  });

  test('shows error toast when no transactions to export for selected range', async () => {
    const onExport = vi.fn(async () => {
      return [];
    });

    render(<ExportTransactions transactions={mockTransactions} onExport={onExport} />);

    screen.getByTestId('set-range').click();

    const exportButton = screen.getByRole('button', { name: 'Export' });
    exportButton.click();

    await Promise.resolve();

    expect(onExport).toHaveBeenCalledTimes(1);
    expect(downloadFile).not.toHaveBeenCalled();
    expect(generateCSV).not.toHaveBeenCalled();
    expect(generateJSON).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('No transactions to export');
  });
});
