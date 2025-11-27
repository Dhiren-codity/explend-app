import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import type { TTransaction } from '@/app/lib/types';
import '@testing-library/jest-dom';

// Mocks
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: () => <span data-testid="download-icon" />,
}));

vi.mock('@heroui/react', () => {
  const Select = (props: {
    label?: string;
    selectedKeys?: string[];
    onChange?: (e: { target: { value: string } }) => void;
    className?: string;
    children?: unknown;
  }): JSX.Element => {
    const selected = props.selectedKeys ? props.selectedKeys[0] : 'csv';
    return (
      <label>
        <span>{props.label}</span>
        <select
          aria-label={props.label}
          value={selected}
          onChange={(e) => props.onChange?.({ target: { value: (e.target as HTMLSelectElement).value } })}
        >
          <option value="csv">CSV (Spreadsheet)</option>
          <option value="json">JSON (Data)</option>
        </select>
      </label>
    );
  };

  const SelectItem = (_props: Record<string, unknown>): JSX.Element | null => null;

  const Button = (props: {
    color?: string;
    startContent?: unknown;
    onPress?: () => void;
    isLoading?: boolean;
    className?: string;
    children?: unknown;
  }): JSX.Element => {
    return (
      <button
        type="button"
        disabled={props.isLoading}
        onClick={() => props.onPress && props.onPress()}
      >
        {props.children as JSX.Element | string}
      </button>
    );
  };

  const Card = (props: { children?: unknown }): JSX.Element => <div>{props.children as JSX.Element}</div>;
  const CardHeader = (props: { children?: unknown }): JSX.Element => <div>{props.children as JSX.Element}</div>;
  const CardBody = (props: { children?: unknown; className?: string }): JSX.Element => <div>{props.children as JSX.Element}</div>;

  // Simple controlled DateRangePicker mock with two inputs and a clear button
  const DateRangePicker = (props: {
    label?: string;
    defaultValue?: unknown;
    className?: string;
    onChange?: (value: unknown) => void;
  }): JSX.Element => {
    let startVal = '';
    let endVal = '';

    const emitIfComplete = (): void => {
      if (startVal && endVal) {
        props.onChange?.({
          start: { toString: () => startVal },
          end: { toString: () => endVal },
        });
      }
    };

    return (
      <div>
        <label>
          <span>{props.label} Start</span>
          <input
            aria-label={`${props.label} start`}
            type="text"
            onChange={(e) => {
              startVal = (e.target as HTMLInputElement).value;
              emitIfComplete();
            }}
          />
        </label>
        <label>
          <span>{props.label} End</span>
          <input
            aria-label={`${props.label} end`}
            type="text"
            onChange={(e) => {
              endVal = (e.target as HTMLInputElement).value;
              emitIfComplete();
            }}
          />
        </label>
        <button
          type="button"
          aria-label="Clear date range"
          onClick={() => props.onChange?.(null)}
        >
          Clear
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

vi.mock('@/app/lib/export-utils', () => {
  return {
    downloadFile: vi.fn(),
    generateCSV: vi.fn(),
    generateJSON: vi.fn(),
    getExportFilename: vi.fn(),
    getMimeType: vi.fn(),
  };
});

import toast from 'react-hot-toast';
import {
  downloadFile,
  generateCSV,
  generateJSON,
  getExportFilename,
  getMimeType,
} from '@/app/lib/export-utils';

describe('ExportTransactions', () => {
  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  const makeTx = (id: string): TTransaction => ({ id } as unknown as TTransaction);

  const setupDefaultMocks = (): void => {
    vi.mocked(generateCSV).mockReturnValue('csv-content');
    vi.mocked(generateJSON).mockReturnValue('json-content');
    vi.mocked(getExportFilename).mockImplementation((fmt: unknown) =>
      fmt === 'json' ? 'export.json' : 'export.csv'
    );
    vi.mocked(getMimeType).mockImplementation((fmt: unknown) =>
      fmt === 'json' ? 'application/json' : 'text/csv'
    );
  };

  test('renders with default UI and status text: void', (): void => {
    setupDefaultMocks();
    const transactions = [makeTx('1'), makeTx('2')];

    render(<ExportTransactions transactions={transactions} onExport={async (): Promise<TTransaction[]> => transactions} />);

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(screen.getByLabelText('Date Range (Optional) start')).toBeInTheDocument();
    expect(screen.getByLabelText('Date Range (Optional) end')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument();
  });

  test('exports CSV by default and shows success toast: Promise<void>', async (): Promise<void> => {
    setupDefaultMocks();
    const transactions = [makeTx('1'), makeTx('2')];

    render(<ExportTransactions transactions={transactions} onExport={async (): Promise<TTransaction[]> => transactions} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(generateCSV).toHaveBeenCalledTimes(1);
    });

    expect(generateCSV).toHaveBeenCalledWith(transactions);
    expect(getExportFilename).toHaveBeenCalledWith('csv');
    expect(getMimeType).toHaveBeenCalledWith('csv');
    expect(downloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv');
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect((toast.success as unknown as vi.Mock).mock.calls[0][0] as string).toMatch(/Exported 2 transactions/);
  });

  test('selects JSON format and exports JSON: Promise<void>', async (): Promise<void> => {
    setupDefaultMocks();
    const transactions = [makeTx('1'), makeTx('2')];

    render(<ExportTransactions transactions={transactions} onExport={async (): Promise<TTransaction[]> => transactions} />);

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'json' } });

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(generateJSON).toHaveBeenCalledTimes(1);
    });

    expect(generateJSON).toHaveBeenCalledWith(transactions);
    expect(getExportFilename).toHaveBeenCalledWith('json');
    expect(getMimeType).toHaveBeenCalledWith('json');
    expect(downloadFile).toHaveBeenCalledWith('json-content', 'export.json', 'application/json');
  });

  test('shows error toast when there are no transactions to export: Promise<void>', async (): Promise<void> => {
    setupDefaultMocks();
    const transactions: TTransaction[] = [];

    const onExport = vi.fn(async (): Promise<TTransaction[]> => transactions);

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
    });

    expect(downloadFile).not.toHaveBeenCalled();
    expect(onExport).not.toHaveBeenCalled();
  });

  test('when date range is set, calls onExport with adjusted end time and exports filtered results: Promise<void>', async (): Promise<void> => {
    setupDefaultMocks();
    const transactionsAll = [makeTx('1'), makeTx('2')];
    const filtered = [makeTx('only')];

    const onExport = vi.fn(async (_start?: Date, _end?: Date): Promise<TTransaction[]> => filtered);

    render(<ExportTransactions transactions={transactionsAll} onExport={onExport} />);

    const startInput = screen.getByLabelText('Date Range (Optional) start');
    const endInput = screen.getByLabelText('Date Range (Optional) end');

    fireEvent.change(startInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endInput, { target: { value: '2024-01-31' } });

    // Status text should reflect date range
    await waitFor(() => {
      expect(screen.getByText(/Exporting transactions from 2024-01-01 to 2024-01-31/)).toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1);
    });

    const args = (onExport as unknown as vi.Mock).mock.calls[0] as [Date, Date];
    const startArg = args[0];
    const endArg = args[1];

    expect(startArg).toBeInstanceOf(Date);
    expect(endArg).toBeInstanceOf(Date);
    expect(startArg.toISOString().startsWith('2024-01-01')).toBe(true);
    expect(endArg.getHours()).toBe(23);
    expect(endArg.getMinutes()).toBe(59);
    expect(endArg.getSeconds()).toBe(59);
    expect(endArg.getMilliseconds()).toBe(999);

    expect(generateCSV).toHaveBeenCalledWith(filtered);
    expect(downloadFile).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  test('loading state shows "Exporting..." and disables button during export: Promise<void>', async (): Promise<void> => {
    setupDefaultMocks();
    const transactions = [makeTx('1')];

    const onExport = vi.fn(
      () =>
        new Promise<TTransaction[]>((resolve) => {
          setTimeout(() => resolve(transactions), 30);
        })
    );

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    // During loading
    await waitFor(() => {
      expect(screen.getByText('Exporting...')).toBeInTheDocument();
    });

    // After done
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });

    expect(onExport).not.toHaveBeenCalled(); // no date range set, so not called
    expect(generateCSV).toHaveBeenCalledWith(transactions);
    expect(downloadFile).toHaveBeenCalled();
  });

  test('handles export error and shows error toast: Promise<void>', async (): Promise<void> => {
    setupDefaultMocks();
    const transactions = [makeTx('1')];

    vi.mocked(generateCSV).mockImplementation(() => {
      throw new Error('boom');
    });

    const errorSpy = vi.spyOn(console, 'error').mockImplementation((): void => {});

    render(<ExportTransactions transactions={transactions} onExport={async (): Promise<TTransaction[]> => transactions} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions');
    });

    expect(errorSpy).toHaveBeenCalled();
    // Button should return to normal state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });

    errorSpy.mockRestore();
  });

  test('clearing date range resets status text: Promise<void>', async (): Promise<void> => {
    setupDefaultMocks();
    const transactions = [makeTx('1'), makeTx('2'), makeTx('3')];

    render(<ExportTransactions transactions={transactions} onExport={async (): Promise<TTransaction[]> => transactions} />);

    const startInput = screen.getByLabelText('Date Range (Optional) start');
    const endInput = screen.getByLabelText('Date Range (Optional) end');

    fireEvent.change(startInput, { target: { value: '2024-02-01' } });
    fireEvent.change(endInput, { target: { value: '2024-02-29' } });

    await waitFor(() => {
      expect(screen.getByText(/Exporting transactions from 2024-02-01 to 2024-02-29/)).toBeInTheDocument();
    });

    const clearBtn = screen.getByRole('button', { name: 'Clear date range' });
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(screen.getByText('Ready to export all 3 transactions')).toBeInTheDocument();
    });
  });
});