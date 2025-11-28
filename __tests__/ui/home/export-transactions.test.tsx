import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import type { TTransaction } from '@/app/lib/types';
import '@testing-library/jest-dom';

const mockToast = {
  success: vi.fn<(message: string) => void>(),
  error: vi.fn<(message: string) => void>(),
};

const mockGenerateCSV = vi.fn<(rows: unknown[]) => string>().mockReturnValue('csv-content');
const mockGenerateJSON = vi.fn<(rows: unknown[]) => string>().mockReturnValue('json-content');
const mockGetExportFilename = vi.fn<(format: string) => string>().mockImplementation((fmt: string) => `export.${fmt}`);
const mockGetMimeType = vi.fn<(format: string) => string>().mockReturnValue('text/plain');
const mockDownloadFile = vi.fn<(content: string, filename: string, mimeType: string) => void>();

vi.mock('react-hot-toast', () => ({
  default: mockToast,
}));

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: () => <span data-testid="download-icon" />,
}));

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 16,
}));

vi.mock('@/app/lib/export-utils', () => ({
  generateCSV: mockGenerateCSV,
  generateJSON: mockGenerateJSON,
  getExportFilename: mockGetExportFilename,
  getMimeType: mockGetMimeType,
  downloadFile: mockDownloadFile,
}));

vi.mock('@heroui/react', () => {
  const ReactActual = require('react') as typeof import('react');

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
  }) => {
    return (
      <label>
        {label}
        
        >
          {children}
        </select>
      </label>
    );
  };

  const SelectItem = ({
    value,
    children,
  }: {
    value: string;
    children?: React.ReactNode;
  }) => {
    return <option value={value}>{children}</option>;
  };

  const Button = ({
    children,
    onPress,
    isLoading,
    className,
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
    isLoading?: boolean;
    className?: string;
  }) => {
    return (
      
      >
        {isLoading ? 'Exporting...' : children}
      </button>
    );
  };

  const Card = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  const CardHeader = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  const CardBody = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;

  const DateRangePicker = ({
    label,
    onChange,
    className,
  }: {
    label?: string;
    onChange?: (
        | {
            start: { toString: () => string };
            end: { toString: () => string };
          }
    ) => void;
    className?: string;
  }) => {
    let startValue = '';
    let endValue = '';

    const handleStart = (e: React.ChangeEvent<HTMLInputElement>): void => {
      startValue = e.target.value;
      if (onChange && endValue) {
        onChange({
          start: { toString: () => startValue },
          end: { toString: () => endValue },
        });
      }
    };

    const handleEnd = (e: React.ChangeEvent<HTMLInputElement>): void => {
      endValue = e.target.value;
      if (onChange && startValue) {
        onChange({
          start: { toString: () => startValue },
          end: { toString: () => endValue },
        });
      }
    };

    const handleClear = (): void => {
      startValue = '';
      endValue = '';
      if (onChange) onChange(null);
    };

    return (
      <div className={className}>
        <label>
          {label}
          <input aria-label="start-date" placeholder="start" onChange={handleStart} />
          <input aria-label="end-date" placeholder="end" onChange={handleEnd} />
        </label>
        <button type="button" onClick={handleClear}>
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
});

describe('ExportTransactions', () => {
  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  const makeTransaction = (overrides: Record<string, unknown> = {}): TTransaction => {
    const base = {
      id: String(Math.random()),
      description: 'Test',
      amount: 100,
      date: new Date().toISOString(),
      ...overrides,
    };
    return base as unknown as TTransaction;
  };


    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(
      screen.getByText('Ready to export all 2 transactions')
    ).toBeInTheDocument();
  });


    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(onExport).not.toHaveBeenCalled();
      expect(mockGenerateCSV).toHaveBeenCalledTimes(1);
      expect(mockGenerateCSV).toHaveBeenCalledWith(transactions);
      expect(mockDownloadFile).toHaveBeenCalledTimes(1);
      expect(mockToast.success).toHaveBeenCalledWith('Exported 2 transactions');
    });
  });


    const select = screen.getByLabelText('Export Format');
    fireEvent.change(select, { target: { value: 'json' } });

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(mockGenerateJSON).toHaveBeenCalledTimes(1);
      expect(mockGenerateJSON).toHaveBeenCalledWith(transactions);
      expect(mockGenerateCSV).not.toHaveBeenCalled();
      expect(mockGetExportFilename).toHaveBeenCalledWith('json');
      expect(mockDownloadFile).toHaveBeenCalledTimes(1);
      expect(mockToast.success).toHaveBeenCalledWith('Exported 3 transactions');
    });
  });


    const startInput = screen.getByLabelText('start-date');
    const endInput = screen.getByLabelText('end-date');

    fireEvent.change(startInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endInput, { target: { value: '2024-01-31' } });

    expect(
      screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1);
    });

    const [startArg, endArg] = onExport.mock.calls[0] as [Date, Date];

    expect(startArg).toBeInstanceOf(Date);
    expect(endArg).toBeInstanceOf(Date);
    expect(startArg.toISOString().startsWith('2024-01-01')).toBe(true);
    expect(endArg.getHours()).toBe(23);
    expect(endArg.getMinutes()).toBe(59);
    expect(endArg.getSeconds()).toBe(59);
    expect(endArg.getMilliseconds()).toBe(999);

    await waitFor(() => {
      expect(mockGenerateCSV).toHaveBeenCalledWith(filtered);
      expect(mockToast.success).toHaveBeenCalledWith('Exported 1 transaction');
    });
  });


    const startInput = screen.getByLabelText('start-date');
    const endInput = screen.getByLabelText('end-date');
    fireEvent.change(startInput, { target: { value: '2024-02-01' } });
    fireEvent.change(endInput, { target: { value: '2024-02-10' } });

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('No transactions to export');
      expect(mockDownloadFile).not.toHaveBeenCalled();
      expect(mockGenerateCSV).not.toHaveBeenCalled();
      expect(mockGenerateJSON).not.toHaveBeenCalled();
    });
  });


      .fn<[_start?: Date, _end?: Date], Promise<TTransaction[]>>()
      .mockRejectedValue(new Error('fail'));

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    const startInput = screen.getByLabelText('start-date');
    const endInput = screen.getByLabelText('end-date');
    fireEvent.change(startInput, { target: { value: '2024-03-01' } });
    fireEvent.change(endInput, { target: { value: '2024-03-05' } });

    const button = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Exporting...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to export transactions');
      expect(consoleSpy).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });


    const startInput = screen.getByLabelText('start-date');
    const endInput = screen.getByLabelText('end-date');
    fireEvent.change(startInput, { target: { value: '2024-04-01' } });
    fireEvent.change(endInput, { target: { value: '2024-04-02' } });

    expect(
      screen.getByText('Exporting transactions from 2024-04-01 to 2024-04-02')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Clear Range'));

    await waitFor(() => {
      expect(
        screen.getByText('Ready to export all 3 transactions')
      ).toBeInTheDocument();
    });
  });
});
