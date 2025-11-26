import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import toast from 'react-hot-toast';
import type { TTransaction } from '@/app/lib/types';
import { downloadFile, generateCSV, generateJSON, getExportFilename, getMimeType } from '@/app/lib/export-utils';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: (): null => null,
}));

vi.mock('@heroui/react', () => {
  const Select = (props: Record<string, unknown>): JSX.Element => {
    const label = props.label as string | undefined;
    const selectedKeys = (props.selectedKeys as string[] | undefined) ?? [];
    const onChange = props.onChange as ((e: unknown) => void) | undefined;
    return (
      <label>
        {label}
        <select
          aria-label={label}
          role="combobox"
          value={selectedKeys[0] ?? ''}
          onChange={(e): void => {
            if (onChange) onChange(e);
          }}
        >
          {props.children as JSX.Element}
        </select>
      </label>
    );
  };

  const SelectItem = (props: Record<string, unknown>): JSX.Element => {
    const value = props.value as string;
    return <option value={value}>{props.children as JSX.Element}</option>;
  };

  const DateRangePicker = (props: Record<string, unknown>): JSX.Element => {
    const label = props.label as string | undefined;
    const onChange = props.onChange as ((value: unknown) => void) | undefined;
    return (
      <div>
        {label ? <span>{label}</span> : null}
        <button
          type="button"
          onClick={(): void => {
            if (onChange) {
              onChange({
                start: { toString: (): string => '2023-01-01' },
                end: { toString: (): string => '2023-01-31' },
              });
          }}
        >
          Set Date Range
        </button>
        <button
          type="button"
          onClick={(): void => {
            if (onChange) onChange(null);
          }}
        >
          Clear Date Range
        </button>
      </div>
    );
  };

  const Button = (props: Record<string, unknown>): JSX.Element => {
    const isLoading = props.isLoading === true;
    const onPress = props.onPress as (() => void) | undefined;
    const children = props.children as JSX.Element | string | undefined;
    return (
      <button
        type="button"
        onClick={(): void => {
          if (onPress) onPress();
        }}
        disabled={isLoading}
      >
        {isLoading ? 'Exporting...' : children}
      </button>
    );
  };

  const Card = (props: Record<string, unknown>): JSX.Element => <div>{props.children as JSX.Element}</div>;
  const CardHeader = (props: Record<string, unknown>): JSX.Element => <div>{props.children as JSX.Element}</div>;
  const CardBody = (props: Record<string, unknown>): JSX.Element => <div>{props.children as JSX.Element}</div>;

  return {
    Select,
    SelectItem,
    DateRangePicker,
    Button,
    Card,
    CardHeader,
    CardBody,
  };

vi.mock('@/app/lib/export-utils', () => ({
  downloadFile: vi.fn(),
  generateCSV: vi.fn(),
  generateJSON: vi.fn(),
  getExportFilename: vi.fn(),
  getMimeType: vi.fn(),
}));


  const makeTransactions = (count: number): TTransaction[] => {
    const result = Array.from({ length: count }).map((_, idx) => ({
      id: String(idx + 1),
      amount: idx + 1,
      createdAt: `2023-01-${String(idx + 1).padStart(2, '0')}`,
    })) as unknown as TTransaction[];
    return result;
  };


    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Export Format' })).toBeInTheDocument();
    expect(screen.getByText('Date Range (Optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument();
  });


    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(onExport).not.toHaveBeenCalled();
      expect(generateCSV).toHaveBeenCalledTimes(1);
      expect(generateCSV).toHaveBeenCalledWith(transactions);
      expect(generateJSON).not.toHaveBeenCalled();
      expect(getExportFilename).toHaveBeenCalledWith('csv');
      expect(getMimeType).toHaveBeenCalledWith('csv');
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'transactions.csv', 'text/csv');
      expect(vi.mocked(toast).success).toHaveBeenCalledWith('Exported 2 transactions');
    });


    const select = screen.getByRole('combobox', { name: 'Export Format' });
    fireEvent.change(select, { target: { value: 'json' } });

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(generateJSON).toHaveBeenCalledTimes(1);
      expect(generateCSV).not.toHaveBeenCalled();
      expect(getExportFilename).toHaveBeenCalledWith('json');
      expect(getMimeType).toHaveBeenCalledWith('json');
      expect(downloadFile).toHaveBeenCalledWith('json-content', 'transactions.json', 'application/json');
      expect(vi.mocked(toast).success).toHaveBeenCalledWith('Exported 1 transaction');
    });


    fireEvent.click(screen.getByRole('button', { name: 'Set Date Range' }));
    expect(
      screen.getByText('Exporting transactions from 2023-01-01 to 2023-01-31'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear Date Range' }));
    expect(screen.getByText('Ready to export all 3 transactions')).toBeInTheDocument();
  });

      );

    vi.mocked(generateCSV).mockReturnValue('csv-content');
    vi.mocked(getExportFilename).mockReturnValue('transactions.csv');
    vi.mocked(getMimeType).mockReturnValue('text/csv');

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Set Date Range' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(screen.getByRole('button', { name: 'Exporting...' })).toBeInTheDocument();
    expect(onExport).toHaveBeenCalledTimes(1);

    const call = onExport.mock.calls[0];
    const startDate = call[0] as Date;
    const endDate = call[1] as Date;

    expect(startDate).toBeInstanceOf(Date);
    expect(endDate).toBeInstanceOf(Date);
    expect(startDate.toISOString().slice(0, 10)).toBe('2023-01-01');
    expect(endDate.toISOString().slice(0, 10)).toBe('2023-01-31');
    expect(endDate.getHours()).toBe(23);
    expect(endDate.getMinutes()).toBe(59);
    expect(endDate.getSeconds()).toBe(59);

    if (resolveFn) resolveFn(transactions);

    await waitFor((): void => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'transactions.csv', 'text/csv');
      expect(vi.mocked(toast).success).toHaveBeenCalledWith('Exported 2 transactions');
    });


    fireEvent.click(screen.getByRole('button', { name: 'Set Date Range' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(vi.mocked(toast).error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
      expect(generateCSV).not.toHaveBeenCalled();
      expect(generateJSON).not.toHaveBeenCalled();
    });


    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(vi.mocked(toast).error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
      expect(generateCSV).not.toHaveBeenCalled();
      expect(generateJSON).not.toHaveBeenCalled();
      expect(onExport).not.toHaveBeenCalled();
    });


    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation((): void => {});

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(vi.mocked(toast).error).toHaveBeenCalledWith('Failed to export transactions');
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(downloadFile).not.toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
