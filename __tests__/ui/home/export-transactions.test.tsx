import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

vi.mock('react-hot-toast', () => {
  return {
    default: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock('@heroui/react', () => {
  const React = require('react');
  const Button = ({
    children,
    onPress,
    ...rest
  }: {
    children: React.ReactNode;
    onPress?: () => void;
  }): React.ReactElement => {
    return React.createElement('button', { onClick: onPress, ...rest }, children);
  };

  const Select = ({
    label,
    selectedKeys,
    onChange,
  }: {
    label?: string;
    selectedKeys?: string[];
    onChange?: (e: { target: { value: string } }) => void;
  }): React.ReactElement => {
    return React.createElement(
      'label',
      {},
      label ?? 'Select',
      React.createElement(
        'select',
        {
          'aria-label': label ?? 'Select',
          value: selectedKeys?.[0] ?? '',
          onChange: (e: { target: { value: string } }): void => {
            onChange?.(e);
          },
        },
        React.createElement('option', { value: 'csv' }, 'CSV (Spreadsheet)'),
        React.createElement('option', { value: 'json' }, 'JSON (Data)'),
      ),
    );
  };

  const SelectItem = ({ children }: { children: React.ReactNode }): React.ReactElement => {
    return React.createElement(React.Fragment, null, children);
  };

  const DateRangePicker = ({
    label,
    onChange,
  }: {
    label?: string;
    onChange?: (value: { start: { toString: () => string }; end: { toString: () => string } } | null) => void;
  }): React.ReactElement => {
    const React = require('react');
    const startRef = React.useRef<string>('');
    const endRef = React.useRef<string>('');

    const handleChange = (): void => {
      if (onChange) {
        const start = startRef.current;
        const end = endRef.current;
        if (start && end) {
          onChange({
            start: { toString: (): string => start },
            end: { toString: (): string => end },
          });
        }
      }
    };

    return React.createElement(
      'div',
      {},
      React.createElement('div', {}, label ?? 'Date Range'),
      React.createElement('input', {
        'aria-label': `${label ?? 'Date Range'} start`,
        placeholder: 'start',
        onChange: (e: { target: { value: string } }): void => {
          startRef.current = e.target.value;
          handleChange();
        },
      }),
      React.createElement('input', {
        'aria-label': `${label ?? 'Date Range'} end`,
        placeholder: 'end',
        onChange: (e: { target: { value: string } }): void => {
          endRef.current = e.target.value;
          handleChange();
        },
      }),
    );
  };

  const Card = ({ children }: { children: React.ReactNode }): React.ReactElement =>
    React.createElement('div', { role: 'region' }, children);
  const CardHeader = ({ children }: { children: React.ReactNode }): React.ReactElement =>
    React.createElement('div', {}, children);
  const CardBody = ({ children }: { children: React.ReactNode }): React.ReactElement =>
    React.createElement('div', {}, children);

  return {
    Button,
    Select,
    SelectItem,
    DateRangePicker,
    Card,
    CardHeader,
    CardBody,
  };
});

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: (): null => null,
}));

import ExportTransactions from '@/app/ui/home/export-transactions';
import * as exportUtils from '@/app/lib/export-utils';
import toast from 'react-hot-toast';
import type { TTransaction } from '@/app/lib/types';

describe('ExportTransactions', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks();
  });

  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  test('renders default UI elements and status text with transactions count', (): void => {
    const transactions = [{} as unknown as TTransaction, {} as unknown as TTransaction];

    render(<ExportTransactions transactions={transactions} onExport={vi.fn()} />);

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(screen.getByLabelText('Date Range (Optional) start')).toBeInTheDocument();
    expect(screen.getByLabelText('Date Range (Optional) end')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument();
  });

  test('exports CSV by default without calling onExport when no date range is set', async (): Promise<void> => {
    const transactions = [
      {} as unknown as TTransaction,
      {} as unknown as TTransaction,
    ];
    const onExport = vi.fn<[_start?: Date | undefined, _end?: Date | undefined], Promise<TTransaction[]>>().mockResolvedValue(
      [],
    );

    const generateCSVSpy = vi.spyOn(exportUtils, 'generateCSV').mockReturnValue('csv-data');
    const getExportFilenameSpy = vi.spyOn(exportUtils, 'getExportFilename').mockReturnValue('export.csv');
    const getMimeTypeSpy = vi.spyOn(exportUtils, 'getMimeType').mockReturnValue('text/csv');
    const downloadFileSpy = vi.spyOn(exportUtils, 'downloadFile').mockImplementation((): void => {});

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor((): void => {
      expect(onExport).not.toHaveBeenCalled();
      expect(generateCSVSpy).toHaveBeenCalledTimes(1);
      expect(generateCSVSpy).toHaveBeenCalledWith(transactions);
      expect(getExportFilenameSpy).toHaveBeenCalledWith('csv');
      expect(getMimeTypeSpy).toHaveBeenCalledWith('csv');
      expect(downloadFileSpy).toHaveBeenCalledWith('csv-data', 'export.csv', 'text/csv');
      expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
    });
  });

  test('allows switching to JSON format and exports filtered date range using onExport', async (): Promise<void> => {
    const baseTransactions = [
      {} as unknown as TTransaction,
      {} as unknown as TTransaction,
      {} as unknown as TTransaction,
    ];
    const filtered = [{} as unknown as TTransaction];

    const onExport = vi
      .fn<[_start?: Date | undefined, _end?: Date | undefined], Promise<TTransaction[]>>()
      .mockImplementation(
        (start?: Date, end?: Date): Promise<TTransaction[]> =>
          new Promise<TTransaction[]>((resolve) => {
            // simulate async
            setTimeout((): void => resolve(filtered), 10);
          }),
      );

    const generateJSONSpy = vi.spyOn(exportUtils, 'generateJSON').mockReturnValue('json-data');
    const getExportFilenameSpy = vi.spyOn(exportUtils, 'getExportFilename').mockReturnValue('export.json');
    const getMimeTypeSpy = vi.spyOn(exportUtils, 'getMimeType').mockReturnValue('application/json');
    const downloadFileSpy = vi.spyOn(exportUtils, 'downloadFile').mockImplementation((): void => {});

    render(<ExportTransactions transactions={baseTransactions} onExport={onExport} />);

    // Change format to JSON
    const formatSelect = screen.getByLabelText('Export Format') as HTMLSelectElement;
    fireEvent.change(formatSelect, { target: { value: 'json' } });
    expect(formatSelect.value).toBe('json');

    // Set date range
    const startInput = screen.getByLabelText('Date Range (Optional) start') as HTMLInputElement;
    const endInput = screen.getByLabelText('Date Range (Optional) end') as HTMLInputElement;

    fireEvent.change(startInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endInput, { target: { value: '2024-01-31' } });

    // Footer text updates with date range
    expect(
      screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31'),
    ).toBeInTheDocument();

    // Click Export
    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    // Loading state
    await waitFor((): void => {
      expect(screen.getByRole('button')).toHaveTextContent('Exporting...');
    });

    // Finish and assert export calls
    await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
    });

    const call = onExport.mock.calls[0];
    const startArg = call[0] as Date;
    const endArg = call[1] as Date;

    expect(startArg).toBeInstanceOf(Date);
    expect(endArg).toBeInstanceOf(Date);
    expect(startArg.toISOString().slice(0, 10)).toBe('2024-01-01');
    expect(endArg.toISOString().slice(0, 10)).toBe('2024-01-31');
    expect(endArg.getHours()).toBe(23);
    expect(endArg.getMinutes()).toBe(59);
    expect(endArg.getSeconds()).toBe(59);
    expect(endArg.getMilliseconds()).toBe(999);

    await waitFor((): void => {
      expect(generateJSONSpy).toHaveBeenCalledWith(filtered);
      expect(getExportFilenameSpy).toHaveBeenCalledWith('json');
      expect(getMimeTypeSpy).toHaveBeenCalledWith('json');
      expect(downloadFileSpy).toHaveBeenCalledWith('json-data', 'export.json', 'application/json');
      expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction');
      expect(screen.getByRole('button')).toHaveTextContent('Export');
    });
  });

  test('shows error toast when there are no transactions to export (no date range)', async (): Promise<void> => {
    const transactions: TTransaction[] = [];
    const onExport = vi.fn<[_start?: Date | undefined, _end?: Date | undefined], Promise<TTransaction[]>>().mockResolvedValue(
      [],
    );

    const generateCSVSpy = vi.spyOn(exportUtils, 'generateCSV');
    const downloadFileSpy = vi.spyOn(exportUtils, 'downloadFile');

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor((): void => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
      expect(generateCSVSpy).not.toHaveBeenCalled();
      expect(downloadFileSpy).not.toHaveBeenCalled();
      expect(onExport).not.toHaveBeenCalled();
    });
  });

  test('shows error toast when filtered onExport returns empty list', async (): Promise<void> => {
    const transactions = [{} as unknown as TTransaction];

    const onExport = vi
      .fn<[_start?: Date | undefined, _end?: Date | undefined], Promise<TTransaction[]>>()
      .mockResolvedValue([]);

    const downloadFileSpy = vi.spyOn(exportUtils, 'downloadFile');

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    // Set date range to trigger onExport
    const startInput = screen.getByLabelText('Date Range (Optional) start') as HTMLInputElement;
    const endInput = screen.getByLabelText('Date Range (Optional) end') as HTMLInputElement;

    fireEvent.change(startInput, { target: { value: '2024-02-01' } });
    fireEvent.change(endInput, { target: { value: '2024-02-10' } });

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFileSpy).not.toHaveBeenCalled();
    });
  });

  test('handles errors during export and shows error toast', async (): Promise<void> => {
    const transactions = [{} as unknown as TTransaction, {} as unknown as TTransaction];
    const onExport = vi.fn<[_start?: Date | undefined, _end?: Date | undefined], Promise<TTransaction[]>>().mockResolvedValue(
      [],
    );

    vi.spyOn(exportUtils, 'generateCSV').mockImplementation((): string => {
      throw new Error('boom');
    });

    const errorSpy = vi.spyOn(console, 'error').mockImplementation((): void => {});

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor((): void => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions');
      expect(errorSpy).toHaveBeenCalled();
    });

    errorSpy.mockRestore();
  });

  test('updates footer text when date range is provided', (): void => {
    const transactions = [{} as unknown as TTransaction];

    render(<ExportTransactions transactions={transactions} onExport={vi.fn()} />);

    const startInput = screen.getByLabelText('Date Range (Optional) start') as HTMLInputElement;
    const endInput = screen.getByLabelText('Date Range (Optional) end') as HTMLInputElement;

    fireEvent.change(startInput, { target: { value: '2024-03-01' } });
    fireEvent.change(endInput, { target: { value: '2024-03-15' } });

    expect(
      screen.getByText('Exporting transactions from 2024-03-01 to 2024-03-15'),
    ).toBeInTheDocument();
  });
});