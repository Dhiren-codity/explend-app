import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

vi.mock('@heroui/react', () => {
  const Select = ({ label, children, onChange }: any) => {
    return (
      <label>
        {label}
        <select aria-label={label} onChange={onChange}>
          {children}
        </select>
      </label>
    );
  };
  const SelectItem = ({ value, children }: any) => {
    return <option value={value}>{children}</option>;
  };
  const Button = ({ children, onPress, isLoading }: any) => {
    return (
      <button onClick={onPress} disabled={isLoading}>
        {children}
      </button>
    );
  };
  const Card = ({ children }: any) => <div>{children}</div>;
  const CardBody = ({ children }: any) => <div>{children}</div>;
  const CardHeader = ({ children }: any) => <div>{children}</div>;
  const DateRangePicker = ({ label, onChange }: any) => {
    const [start, setStart] = React.useState('');
    const [end, setEnd] = React.useState('');
    return (
      <fieldset>
        <legend>{label}</legend>
        
          onChange={(e) => setStart(e.target.value)}
        />
        
          onChange={(e) => setEnd(e.target.value)}
        />
        
          onClick={() => {
            if (start && end) {
              const makeDateObj = (val: string) => ({ toString: () => val });
              onChange?.({ start: makeDateObj(start), end: makeDateObj(end) });
            }
          }}
        >
        </button>
        <button type="button" onClick={() => onChange?.(null)}>
        </button>
      </fieldset>
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
});

vi.mock('@internationalized/date', () => {
  return {
    parseDate: (s: string) => ({ toString: () => s }),
  };
});

vi.mock('date-fns', () => {
  return {
    format: (_date: Date, _fmt: string) => '2024-01-01',
    subMonths: (date: Date, _n: number) => new Date(date),
  };
});

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('react-hot-toast', () => {
  return {
    default: {
      success: toastSuccess,
      error: toastError,
    },
  };
});

vi.mock('react-icons/pi', () => {
  return {
    PiDownloadSimpleFill: () => <svg data-testid="icon" />,
  };
});

vi.mock('@/config/constants/main', () => {
  return { DEFAULT_ICON_SIZE: 24 };
});

const mockGenerateCSV = vi.fn(() => 'csv-content');
const mockGenerateJSON = vi.fn(() => '{"data":true}');
const mockGetExportFilename = vi.fn((fmt: 'csv' | 'json') => `export.${fmt}`);
const mockGetMimeType = vi.fn((fmt: 'csv' | 'json') => (fmt === 'csv' ? 'text/csv' : 'application/json'));
const mockDownloadFile = vi.fn();

vi.mock('@/app/lib/export-utils', () => {
  return {
    generateCSV: mockGenerateCSV,
    generateJSON: mockGenerateJSON,
    getExportFilename: mockGetExportFilename,
    getMimeType: mockGetMimeType,
    downloadFile: mockDownloadFile,
  };
});

import ExportTransactions from '@/app/ui/home/export-transactions';

describe('ExportTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders and shows default info with transaction count', () => {
    render(
      
      />
    );
    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(
      screen.getByText('Ready to export all 2 transactions')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(screen.getByText('CSV (Spreadsheet)')).toBeInTheDocument();
    expect(screen.getByText('JSON (Data)')).toBeInTheDocument();
  });

  test('exports CSV by default using provided transactions', async () => {
    const onExport = vi.fn();
    render(
      
      />
    );

    const exportBtn = screen.getByRole('button', { name: 'Export' });
    await userEvent.click(exportBtn);

    await waitFor(() => {
      expect(mockGenerateCSV).toHaveBeenCalledTimes(1);
      expect(mockGenerateJSON).not.toHaveBeenCalled();
      expect(mockDownloadFile).toHaveBeenCalledWith(
        'csv-content',
        'export.csv',
        'text/csv'
      );
      expect(toastSuccess).toHaveBeenCalledWith('Exported 2 transactions');
      expect(onExport).not.toHaveBeenCalled();
    });
  });

  test('switches to JSON format and exports JSON', async () => {
    render(
      
      />
    );

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'json' } });

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(mockGenerateJSON).toHaveBeenCalledTimes(1);
      expect(mockGenerateCSV).not.toHaveBeenCalled();
      expect(mockGetExportFilename).toHaveBeenCalledWith('json');
      expect(mockGetMimeType).toHaveBeenCalledWith('json');
      expect(mockDownloadFile).toHaveBeenCalledWith(
        '{"data":true}',
        'export.json',
        'application/json'
      );
      expect(toastSuccess).toHaveBeenCalledWith('Exported 1 transaction');
    });
  });

  test('applies date range and calls onExport with start and end dates', async () => {
    const filteredTx = [{ id: 'only-in-range' } as any];
    const onExport = vi.fn().mockResolvedValue(filteredTx);
    render(
      
      />
    );

    const startInput = screen.getByLabelText('Date Range (Optional) Start');
    const endInput = screen.getByLabelText('Date Range (Optional) End');

    await userEvent.type(startInput, '2024-05-01');
    await userEvent.type(endInput, '2024-05-31');
    await userEvent.click(screen.getByRole('button', { name: 'Apply Date Range' }));

    expect(
      screen.getByText('Exporting transactions from 2024-05-01 to 2024-05-31')
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1);
    });

    const [startArg, endArg] = onExport.mock.calls[0];
    expect(startArg).toBeInstanceOf(Date);
    expect(endArg).toBeInstanceOf(Date);
    expect((startArg as Date).toISOString().slice(0, 10)).toBe('2024-05-01');
    expect((endArg as Date).toISOString().slice(0, 10)).toBe('2024-05-31');
    expect((endArg as Date).getHours()).toBe(23);
    expect((endArg as Date).getMinutes()).toBe(59);
    expect((endArg as Date).getSeconds()).toBe(59);
    expect((endArg as Date).getMilliseconds()).toBe(999);

    await waitFor(() => {
      expect(mockGenerateCSV).toHaveBeenCalledWith(filteredTx);
      expect(mockDownloadFile).toHaveBeenCalled();
      expect(toastSuccess).toHaveBeenCalledWith('Exported 1 transaction');
    });
  });

  test('shows error toast when no transactions to export for selected range', async () => {
    const onExport = vi.fn().mockResolvedValue([]);
    render(
      
      />
    );

    const startInput = screen.getByLabelText('Date Range (Optional) Start');
    const endInput = screen.getByLabelText('Date Range (Optional) End');
    await userEvent.type(startInput, '2024-06-01');
    await userEvent.type(endInput, '2024-06-02');
    await userEvent.click(screen.getByRole('button', { name: 'Apply Date Range' }));

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith('No transactions to export');
      expect(mockDownloadFile).not.toHaveBeenCalled();
      expect(mockGenerateCSV).not.toHaveBeenCalled();
      expect(mockGenerateJSON).not.toHaveBeenCalled();
    });
  });

  test('handles export errors and shows failure toast', async () => {
    mockGenerateCSV.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith('Failed to export transactions');
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
