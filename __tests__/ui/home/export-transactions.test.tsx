import React from 'react';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import toast from 'react-hot-toast';
import {
import '@testing-library/jest-dom';
  generateCSV,
  generateJSON,
  downloadFile,
  getExportFilename,
  getMimeType,
} from '@/app/lib/export-utils';

vi.mock('react-hot-toast', () => {
  return {
    default: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };

vi.mock('@/app/lib/export-utils', () => {
  return {
    generateCSV: vi.fn(() => 'csv-content'),
    generateJSON: vi.fn(() => 'json-content'),
    downloadFile: vi.fn(),
    getExportFilename: vi.fn((fmt: string) => `file.${fmt}`),
    getMimeType: vi.fn((fmt: string) => `text/${fmt}`),
  };

vi.mock('@heroui/react', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react') as typeof import('react');

  const Button = ({
    children,
    onPress,
    isLoading,
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
    isLoading?: boolean;
  }) => (
    <button type="button" onClick={onPress} disabled={!!isLoading}>
      {isLoading ? 'Exporting...' : children}
    </button>
  );

  const Select = ({
    label,
    onChange,
    children,
  }: {
    label?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children?: React.ReactNode;
    selectedKeys?: string[];
    className?: string;
  }) => (
    <label>
      {label}
      <select aria-label={label} onChange={onChange}>
        {children}
      </select>
    </label>
  );

  const SelectItem = ({
    children,
    value,
    ...props
  }: {
    children?: React.ReactNode;
    value?: string;
    key?: string;
  }) => {
    const keyVal = (props as Record<string, unknown>).key as string | undefined;
    return <option value={value ?? keyVal}>{children}</option>;
  };

  const DateRangePicker = ({
    label,
    onChange,
  }: {
    label?: string;
    onChange?: (
      value:
        | {
            start: { toString: () => string };
            end: { toString: () => string };
          }
        | null,
    ) => void;
    defaultValue?: unknown;
    className?: string;
  }) => {
    const [start, setStart] = React.useState('');
    const [end, setEnd] = React.useState('');
    return (
      <div aria-label={label}>
        <label>
          {label} start
          <input
            aria-label={`${label} start`}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            placeholder="start"
          />
        </label>
        <label>
          {label} end
          <input
            aria-label={`${label} end`}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            placeholder="end"
          />
        </label>
        <button
          type="button"
          onClick={() =>
            onChange &&
            onChange({
              start: { toString: () => start },
              end: { toString: () => end },
            })
          }
        >
          Apply
        </button>
        <button type="button" onClick={() => onChange && onChange(null)}>
          Clear
        </button>
      </div>
    );
  };

  const Card = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  const CardBody = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  const CardHeader = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;

  return {
    Button,
    Select,
    SelectItem,
    DateRangePicker,
    Card,
    CardBody,
    CardHeader,
  };

type LooseProps = {
  transactions: unknown[];
  onExport: (_start?: Date, _end?: Date) => Promise<unknown[]>;
};
const ExportTransactionsLoose =
  ExportTransactions as unknown as React.FC<LooseProps>;


    const onExport = vi.fn<[_start?: Date, _end?: Date], Promise<unknown[]>>().mockResolvedValue([]);

    render(<ExportTransactionsLoose transactions={transactions} onExport={onExport} />);

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Export Format' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(
      screen.getByText('Ready to export all 2 transactions'),
    ).toBeInTheDocument();
  });

    const onExport = vi.fn<[_start?: Date, _end?: Date], Promise<unknown[]>>().mockResolvedValue([]);

    render(<ExportTransactionsLoose transactions={transactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor(() => {
      expect(vi.mocked(generateCSV)).toHaveBeenCalledTimes(1);
    });

    expect(vi.mocked(generateCSV)).toHaveBeenCalledWith(transactions);
    expect(vi.mocked(generateJSON)).not.toHaveBeenCalled();
    expect(vi.mocked(getExportFilename)).toHaveBeenCalledWith('csv');
    expect(vi.mocked(getMimeType)).toHaveBeenCalledWith('csv');
    expect(vi.mocked(downloadFile)).toHaveBeenCalledWith(
      'csv-content',
      'file.csv',
      'text/csv',
    );
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
    expect(onExport).not.toHaveBeenCalled();
  });

    const onExport = vi.fn<[_start?: Date, _end?: Date], Promise<unknown[]>>().mockResolvedValue([]);

    render(<ExportTransactionsLoose transactions={transactions} onExport={onExport} />);

    const formatSelect = screen.getByRole('combobox', { name: 'Export Format' });
    fireEvent.change(formatSelect, { target: { value: 'json' } });

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor(() => {
      expect(vi.mocked(generateJSON)).toHaveBeenCalledTimes(1);
    });

    expect(vi.mocked(generateCSV)).not.toHaveBeenCalled();
    expect(vi.mocked(generateJSON)).toHaveBeenCalledWith(transactions);
    expect(vi.mocked(getExportFilename)).toHaveBeenCalledWith('json');
    expect(vi.mocked(getMimeType)).toHaveBeenCalledWith('json');
    expect(vi.mocked(downloadFile)).toHaveBeenCalledWith(
      'json-content',
      'file.json',
      'text/json',
    );
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
  });

    const returnedTransactions: unknown[] = [{ id: 'x' }];
    const onExport = vi
      .fn<[_start?: Date, _end?: Date], Promise<unknown[]>>()
      .mockResolvedValue(returnedTransactions);

    render(<ExportTransactionsLoose transactions={baseTransactions} onExport={onExport} />);

    // Set date range via mocked DateRangePicker
    const startInput = screen.getByLabelText('Date Range (Optional) start');
    const endInput = screen.getByLabelText('Date Range (Optional) end');
    fireEvent.change(startInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endInput, { target: { value: '2024-01-31' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(
      screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1);
    });

    const callArgs = onExport.mock.calls[0];
    const startArg = callArgs[0] as Date;
    const endArg = callArgs[1] as Date;

    expect(startArg).toBeInstanceOf(Date);
    expect(endArg).toBeInstanceOf(Date);
    expect(startArg.getFullYear()).toBe(2024);
    expect(startArg.getMonth()).toBe(0);
    expect(startArg.getDate()).toBe(1);
    expect(startArg.getHours()).toBe(0);
    expect(startArg.getMinutes()).toBe(0);

    expect(endArg.getFullYear()).toBe(2024);
    expect(endArg.getMonth()).toBe(0);
    expect(endArg.getDate()).toBe(31);
    expect(endArg.getHours()).toBe(23);
    expect(endArg.getMinutes()).toBe(59);
    expect(endArg.getSeconds()).toBe(59);
    expect(endArg.getMilliseconds()).toBe(999);

    await await waitFor(() => {
      expect(vi.mocked(generateCSV)).toHaveBeenCalledWith(returnedTransactions);
    });

    expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction');
  });

    const onExport = vi
      .fn<[_start?: Date, _end?: Date], Promise<unknown[]>>()
      .mockResolvedValue([]);

    render(<ExportTransactionsLoose transactions={baseTransactions} onExport={onExport} />);

    const startInput = screen.getByLabelText('Date Range (Optional) start');
    const endInput = screen.getByLabelText('Date Range (Optional) end');
    fireEvent.change(startInput, { target: { value: '2024-02-01' } });
    fireEvent.change(endInput, { target: { value: '2024-02-02' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
    });

    expect(vi.mocked(generateCSV)).not.toHaveBeenCalled();
    expect(vi.mocked(generateJSON)).not.toHaveBeenCalled();
    expect(vi.mocked(downloadFile)).not.toHaveBeenCalled();
  });

    const onExport = vi.fn<[_start?: Date, _end?: Date], Promise<unknown[]>>().mockResolvedValue([]);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation((): void => {});

    vi.mocked(generateCSV).mockImplementation(() => {
      throw new Error('boom');
    });

    render(<ExportTransactionsLoose transactions={transactions} onExport={onExport} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions');
    });

    await await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

    let resolveFn: ((value: unknown[]) => void) | null = null;
    const onExport = vi
      .fn<[_start?: Date, _end?: Date], Promise<unknown[]>>()
      .mockImplementation(
        () =>
          new Promise<unknown[]>((resolve) => {
            resolveFn = resolve;
          }),
      );

    render(<ExportTransactionsLoose transactions={baseTransactions} onExport={onExport} />);

    // Set a date range to trigger onExport usage
    const startInput = screen.getByLabelText('Date Range (Optional) start');
    const endInput = screen.getByLabelText('Date Range (Optional) end');
    fireEvent.change(startInput, { target: { value: '2024-03-01' } });
    fireEvent.change(endInput, { target: { value: '2024-03-31' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    // Loading state visible
    expect(screen.getByRole('button', { name: 'Exporting...' })).toBeDisabled();

    // Resolve the promise
    resolveFn && resolveFn([{ id: 'z' }]);

    await await waitFor(() => {
      expect(vi.mocked(generateCSV)).toHaveBeenCalledWith([{ id: 'z' }]);
    });

    // Back to idle
    await await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });


    expect(screen.getByText('Ready to export all 0 transactions')).toBeInTheDocument();
  });
