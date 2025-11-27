import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import toast from 'react-hot-toast';
import {
import '@testing-library/jest-dom';
  downloadFile,
  generateCSV,
  generateJSON,
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

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 16,
}));

vi.mock('@heroui/react', () => {
  let latestStart = '';
  let latestEnd = '';

  return {
    Button: ({
      children,
      onPress,
      isLoading,
      className,
      'aria-label': ariaLabel,
    }: {
      children: unknown;
      onPress?: () => void;
      isLoading?: boolean;
      className?: string;
      'aria-label'?: string;
    }) => (
      <button
        type="button"
        aria-label={ariaLabel}
        className={className}
        onClick={onPress}
        disabled={!!isLoading}
      >
        {children}
      </button>
    ),
    Card: ({ children }: { children: unknown }) => <div data-testid="card">{children}</div>,
    CardHeader: ({ children }: { children: unknown }) => <div data-testid="card-header">{children}</div>,
    CardBody: ({ children, className }: { children: unknown; className?: string }) => (
      <div data-testid="card-body" className={className}>
        {children}
      </div>
    ),
    Select: ({
      label,
      selectedKeys,
      onChange,
      className,
      children,
    }: {
      label?: string;
      selectedKeys?: string[];
      onChange?: (e: unknown) => void;
      className?: string;
      children?: unknown;
    }) => {
      const id = 'select-mock';
      return (
        <div className={className}>
          {label ? <label htmlFor={id}>{label}</label> : null}
          <select
            id={id}
            aria-label={label}
            value={selectedKeys && selectedKeys.length > 0 ? selectedKeys[0] : ''}
            onChange={(e) =>
              onChange?.({
                target: { value: (e as unknown as { target: { value: string } }).target.value },
              })
            }
          >
            {children}
          </select>
        </div>
      );
    },
    SelectItem: ({
      value,
      children,
    }: {
      value: string;
      children?: unknown;
    }) => (
      <option value={value}>{children as string}</option>
    ),
    DateRangePicker: ({
      label,
      onChange,
      className,
    }: {
      label?: string;
      onChange?: (value: unknown) => void;
      className?: string;
    }) => (
      <div className={className}>
        {label ? <label>{label}</label> : null}
        <input
          placeholder="Start date"
          aria-label="start-date"
          onChange={(e) => {
            latestStart = (e as unknown as { currentTarget: { value: string } }).currentTarget.value;
            if (latestStart && latestEnd) {
              onChange?.({
                start: { toString: () => latestStart },
                end: { toString: () => latestEnd },
              });
            } else {
              onChange?.(null);
            }
          }}
        />
        <input
          placeholder="End date"
          aria-label="end-date"
          onChange={(e) => {
            latestEnd = (e as unknown as { currentTarget: { value: string } }).currentTarget.value;
            if (latestStart && latestEnd) {
              onChange?.({
                start: { toString: () => latestStart },
                end: { toString: () => latestEnd },
              });
            } else {
              onChange?.(null);
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (latestStart && latestEnd) {
              onChange?.({
                start: { toString: () => latestStart },
                end: { toString: () => latestEnd },
              });
            } else {
              onChange?.(null);
            }
          }}
        >
          Apply Range
        </button>
        <button
          type="button"
          onClick={() => {
            latestStart = '';
            latestEnd = '';
            onChange?.(null);
          }}
        >
          Clear Range
        </button>
      </div>
    ),
  };

vi.mock('@/app/lib/export-utils', () => ({
  downloadFile: vi.fn(),
  generateCSV: vi.fn(),
  generateJSON: vi.fn(),
  getExportFilename: vi.fn(),
  getMimeType: vi.fn(),
}));


  const makeTx = (id: string): Record<string, unknown> => ({ id, amount: 100, date: '2024-01-01' });

  const renderComponent = (
    transactions: Array<Record<string, unknown>>,
    onExportMock: (_start?: Date, _end?: Date) => Promise<Array<Record<string, unknown>>>
  ): void => {
    render(
      <ExportTransactions
        transactions={transactions as unknown as never[]}
        onExport={onExportMock as unknown as (_s?: Date, _e?: Date) => Promise<never[]>}
      />
    );
  };

  test('renders header, format select, and default helper text', (): void => {
    const transactions = [makeTx('1'), makeTx('2')];
    const onExportMock = vi.fn().mockResolvedValue(transactions);

    renderComponent(transactions, onExportMock);

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('csv');

    expect(
      screen.getByText('Ready to export all 2 transactions')
    ).toBeInTheDocument();

    // Button accessibility
    const button = screen.getByRole('button', { name: 'Export' });
    expect(button).toBeInTheDocument();
  });

    expect(select.value).toBe('json');

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(generateJSON).toHaveBeenCalledTimes(1);
      expect(generateCSV).not.toHaveBeenCalled();
      expect(downloadFile).toHaveBeenCalledWith(
        'json-content',
        'transactions.json',
        'application/json'
      );
      expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
    });

    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(onExportMock).not.toHaveBeenCalled();
      expect(generateCSV).toHaveBeenCalledTimes(1);
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'transactions.csv', 'text/csv');
      expect(toast.success).toHaveBeenCalledWith('Exported 3 transactions');
    });

    fireEvent.change(endInput, { target: { value: '2024-01-20' } });

    // Ensure helper text updates to reflect date range
    await waitFor(() => {
      expect(
        screen.getByText('Exporting transactions from 2024-01-10 to 2024-01-20')
      ).toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(onExportMock).toHaveBeenCalledTimes(1);
    });

    const [startArg, endArg] = onExportMock.mock.calls[0] as [Date, Date];
    expect(startArg).toBeInstanceOf(Date);
    expect(endArg).toBeInstanceOf(Date);
    expect(startArg.toISOString().slice(0, 10)).toBe('2024-01-10');

    // End date time should be set to 23:59:59.999 local time; check components
    expect(endArg.getHours()).toBe(23);
    expect(endArg.getMinutes()).toBe(59);
    expect(endArg.getSeconds()).toBe(59);
    expect(endArg.getMilliseconds()).toBe(999);

    // Should export the returned transactions (length 1)
    await waitFor(() => {
      expect(generateCSV).toHaveBeenCalledWith(returnedTransactions as unknown as never[]);
      expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction');
    });

    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
    });

    fireEvent.change(endInput, { target: { value: '2024-02-02' } });

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(onExportMock).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
    });

    fireEvent.click(buttonBefore);

    // While loading
    await waitFor(() => {
      expect(screen.getByText('Exporting...')).toBeInTheDocument();
    });

    // After loading completes
    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'transactions.csv', 'text/csv');
    });


    const onExportMock = vi.fn().mockResolvedValue(transactions);

    renderComponent(transactions, onExportMock);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions');
    });

    // Button should reset
    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

  test('helper text uses pluralization correctly for single transaction', (): void => {
    const transactions = [makeTx('1')];
    const onExportMock = vi.fn().mockResolvedValue(transactions);

    renderComponent(transactions, onExportMock);

    expect(
      screen.getByText('Ready to export all 1 transaction')
    ).toBeInTheDocument();
  });
