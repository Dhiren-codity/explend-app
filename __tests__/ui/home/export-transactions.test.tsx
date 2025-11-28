import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import '@testing-library/jest-dom';

vi.mock('react-hot-toast', () => {
  const success = vi.fn();
  const error = vi.fn();
  return {
    default: { success, error },
    success,
    error
  };

vi.mock('@internationalized/date', () => {
  return {
    parseDate: (s: string) => ({ toString: () => s })
  };

vi.mock('@heroui/react', () => {
  const React = require('react');
  const Card = ({ children }: any) => <div data-testid="card">{children}</div>;
  const CardHeader = ({ children }: any) => <div data-testid="card-header">{children}</div>;
  const CardBody = ({ children, className }: any) => <div data-testid="card-body" className={className}>{children}</div>;
  const Button = ({ children, onPress, isLoading }: any) => (
    <button onClick={onPress} disabled={isLoading}>
      {children}
    </button>
  );
  const SelectItem = ({ children, value }: any) => <option value={value}>{children}</option>;
  const Select = ({ label, onChange, children }: any) => {
    const id = 'mock-select';
    return (
      <label htmlFor={id}>
        {label}
        <select id={id} aria-label={label} onChange={onChange}>
          {children}
        </select>
      </label>
    );
  };
  const DateRangePicker = ({ label, onChange }: any) => {
    const [start, setStart] = React.useState('');
    const [end, setEnd] = React.useState('');
    return (
      <div>
        <span>{label}</span>
        
          onChange={(e) => setStart(e.target.value)}
        />
        
          onChange={(e) => setEnd(e.target.value)}
        />
        <button onClick={() => onChange && onChange({ start: { toString: () => start }, end: { toString: () => end } })}>
        </button>
        <button onClick={() => onChange && onChange(null)}>
        </button>
      </div>
    );
  };
  return {
    Card,
    CardHeader,
    CardBody,
    Button,
    Select,
    SelectItem,
    DateRangePicker
  };

const mockGenerateCSV = vi.fn(() => 'csv-content');
const mockGenerateJSON = vi.fn(() => 'json-content');
const mockGetExportFilename = vi.fn((format: string) => `export.${format}`);
const mockGetMimeType = vi.fn((format: string) => (format === 'csv' ? 'text/csv' : 'application/json'));
const mockDownloadFile = vi.fn();

vi.mock('@/app/lib/export-utils', () => {
  return {
    generateCSV: mockGenerateCSV,
    generateJSON: mockGenerateJSON,
    getExportFilename: mockGetExportFilename,
    getMimeType: mockGetMimeType,
    downloadFile: mockDownloadFile
  };


  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test('renders UI with default state', () => {
    render(
      
      />
    );

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(screen.getByText('Date Range (Optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument();
  });


    render(
      
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(mockGenerateCSV).toHaveBeenCalledTimes(1);
    expect(mockGenerateCSV).toHaveBeenCalledWith(transactions);
    expect(mockGenerateJSON).not.toHaveBeenCalled();

    expect(mockGetExportFilename).toHaveBeenCalledWith('csv');
    expect(mockGetMimeType).toHaveBeenCalledWith('csv');
    expect(mockDownloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv');

    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
  });


    render(
      
      />
    );

    const select = screen.getByLabelText('Export Format');
    fireEvent.change(select, { target: { value: 'json' } });

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(mockGenerateJSON).toHaveBeenCalledTimes(1);
    expect(mockGenerateJSON).toHaveBeenCalledWith(transactions);
    expect(mockGenerateCSV).not.toHaveBeenCalled();

    expect(mockGetExportFilename).toHaveBeenCalledWith('json');
    expect(mockGetMimeType).toHaveBeenCalledWith('json');
    expect(mockDownloadFile).toHaveBeenCalledWith('json-content', 'export.json', 'application/json');

    expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction');
  });


    expect(toast.error).toHaveBeenCalledWith('No transactions to export');
    expect(mockDownloadFile).not.toHaveBeenCalled();
    expect(mockGenerateCSV).not.toHaveBeenCalled();
    expect(mockGenerateJSON).not.toHaveBeenCalled();
  });


    render(
      
      />
    );

    const startInput = screen.getByLabelText('Date Range (Optional) Start');
    const endInput = screen.getByLabelText('Date Range (Optional) End');

    fireEvent.change(startInput, { target: { value: '2025-01-01' } });
    fireEvent.change(endInput, { target: { value: '2025-01-31' } });

    fireEvent.click(screen.getByText('Apply Date Range'));

    expect(screen.getByText('Exporting transactions from 2025-01-01 to 2025-01-31')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1);
    });

    const [startArg, endArg] = onExport.mock.calls[0];

    expect(startArg).toBeInstanceOf(Date);
    expect(endArg).toBeInstanceOf(Date);

    expect(startArg.getFullYear()).toBe(2025);
    expect(startArg.getMonth()).toBe(0);
    expect(startArg.getDate()).toBe(1);

    expect(endArg.getFullYear()).toBe(2025);
    expect(endArg.getMonth()).toBe(0);
    expect(endArg.getDate()).toBe(31);
    expect(endArg.getHours()).toBe(23);
    expect(endArg.getMinutes()).toBe(59);
    expect(endArg.getSeconds()).toBe(59);
    expect(endArg.getMilliseconds()).toBe(999);

    expect(mockGenerateCSV).toHaveBeenCalledWith([{ id: 'range-1' }, { id: 'range-2' }]);
    expect(mockDownloadFile).toHaveBeenCalled();
    expect(require('react-hot-toast').default.success).toHaveBeenCalledWith('Exported 2 transactions');
  });

    fireEvent.change(endInput, { target: { value: '2025-01-02' } });
    fireEvent.click(screen.getByText('Apply Date Range'));

    expect(screen.getByText('Exporting transactions from 2025-01-01 to 2025-01-02')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Clear Date Range'));

    expect(screen.getByText('Ready to export all 1 transaction')).toBeInTheDocument();
  });


    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      
      />
    );

    const startInput = screen.getByLabelText('Date Range (Optional) Start');
    const endInput = screen.getByLabelText('Date Range (Optional) End');

    fireEvent.change(startInput, { target: { value: '2025-01-01' } });
    fireEvent.change(endInput, { target: { value: '2025-01-02' } });
    fireEvent.click(screen.getByText('Apply Date Range'));

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(require('react-hot-toast').default.error).toHaveBeenCalledWith('Failed to export transactions');
    });

    expect(consoleErrorSpy).toHaveBeenCalled();

    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });


    render(
      
      />
    );

    fireEvent.change(screen.getByLabelText('Date Range (Optional) Start'), { target: { value: '2025-02-01' } });
    fireEvent.change(screen.getByLabelText('Date Range (Optional) End'), { target: { value: '2025-02-15' } });
    fireEvent.click(screen.getByText('Apply Date Range'));

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(screen.getByRole('button', { name: 'Exporting...' })).toBeInTheDocument();

    resolveFn!([{ id: 'a' }] as any);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });
