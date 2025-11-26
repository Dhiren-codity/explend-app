import { describe, test, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import { generateCSV, generateJSON, downloadFile, getExportFilename, getMimeType } from '@/app/lib/export-utils';

vi.mock('@heroui/react', () => {
  const React = require('react');
  const Button = ({ children, onPress, isLoading }: { children: React.ReactNode; onPress?: () => void; isLoading?: boolean }) =>
    React.createElement('button', { onClick: onPress, type: 'button' }, children);
  const Card = ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children);
  const CardBody = ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children);
  const CardHeader = ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children);
  const Select = ({
    label,
    selectedKeys,
    onChange,
    children,
  }: {
    label: string;
    selectedKeys?: string[];
    onChange?: (e: { target: { value: string } }) => void;
    children: React.ReactNode;
  }) =>
    React.createElement(
      'label',
      {},
      label,
      React.createElement(
        'select',
        {
          'aria-label': label,
          value: selectedKeys?.[0] ?? '',
          onChange: (e: React.ChangeEvent<HTMLSelectElement>): void =>
            onChange?.({ target: { value: e.target.value } }),
        },
        React.Children.toArray(children),
      ),
    );
  const SelectItem = ({ children, value }: { children: React.ReactNode; value: string }) =>
    React.createElement('option', { value }, children);
  const DateRangePicker = ({
    label,
    onChange,
  }: {
    label: string;
    onChange?: (value: { start: { toString: () => string }; end: { toString: () => string } } | null) => void;
  }) =>
    React.createElement(
      'div',
      {},
      React.createElement('span', {}, label),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: (): void =>
            onChange?.({
              start: { toString: () => '2024-01-01' },
              end: { toString: () => '2024-01-31' },
            }),
        },
        'Set Range',
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: (): void => onChange?.(null),
        },
        'Clear Range',
      ),
    );
  return { Button, Card, CardBody, CardHeader, DateRangePicker, Select, SelectItem };
});
});
vi.mock('@/app/lib/export-utils', () => ({
  generateCSV: vi.fn(() => 'csv-content'),
  generateJSON: vi.fn(() => 'json-content'),
  downloadFile: vi.fn(),
  getExportFilename: vi.fn((format: string) => (format === 'json' ? 'transactions.json' : 'transactions.csv')),
  getMimeType: vi.fn((format: string) => (format === 'json' ? 'application/json' : 'text/csv')),
}));

describe('ExportTransactions', (): void => {
  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });




  test('renders default UI with CSV selected and info text for total transactions', (): void => {
    const onExport = vi.fn(async (): Promise<unknown[]> => []);
    const transactions = [{ id: '1' }, { id: '2' }] as unknown as unknown[];

    render(<ExportTransactions transactions={transactions as unknown as never[]} onExport={onExport as unknown as never} />);

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement;
    expect(select.value).toBe('csv');

    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument();
  });

  test('exports CSV without date range using provided transactions', async (): Promise<void> => {
    const toast = (await import('react-hot-toast')).default as { success: (m: string) => void; error: (m: string) => void };
    vi.mocked(generateCSV).mockReturnValue('csv-content');
    vi.mocked(getExportFilename).mockReturnValue('transactions.csv');
    vi.mocked(getMimeType).mockReturnValue('text/csv');

    const transactions = [{ id: '1' }, { id: '2' }] as unknown as unknown[];
    const onExport = vi.fn(async (): Promise<unknown[]> => {
      return [];
    });

    render(<ExportTransactions transactions={transactions as unknown as never[]} onExport={onExport as unknown as never} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(generateCSV).toHaveBeenCalledTimes(1);
      expect(generateCSV).toHaveBeenCalledWith(transactions);
      expect(generateJSON).not.toHaveBeenCalled();
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'transactions.csv', 'text/csv');
      expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
    });

    expect(onExport).not.toHaveBeenCalled();
  });

  test('allows selecting date range and calls onExport with full-day end; shows loading state', async (): Promise<void> => {
    const toast = (await import('react-hot-toast')).default as { success: (m: string) => void; error: (m: string) => void };
    vi.mocked(generateCSV).mockReturnValue('filtered-csv');

    const returned = [{ id: 'only' }] as unknown as unknown[];
    let capturedStart: Date | null = null;
    let capturedEnd: Date | null = null;

    const onExport = vi.fn(async (start?: Date, end?: Date): Promise<unknown[]> => {
      capturedStart = start ?? null;
      capturedEnd = end ?? null;
      await new Promise((r): void => {
        setTimeout(r, 10);
      });
      return returned;
    });

    const transactions = [{ id: '1' }, { id: '2' }] as unknown as unknown[];

    render(<ExportTransactions transactions={transactions as unknown as never[]} onExport={onExport as unknown as never} />);

    fireEvent.click(screen.getByRole('button', { name: 'Set Range' }));

    expect(screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(await screen.findByRole('button', { name: 'Exporting...' })).toBeInTheDocument();

    await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
      expect(capturedStart).toBeInstanceOf(Date);
      expect(capturedEnd).toBeInstanceOf(Date);
      if (capturedEnd) {
        expect(capturedEnd.getHours()).toBe(23);
        expect(capturedEnd.getMinutes()).toBe(59);
        expect(capturedEnd.getSeconds()).toBe(59);
        expect(capturedEnd.getMilliseconds()).toBe(999);
      }
      expect(generateCSV).toHaveBeenCalledWith(returned);
      expect(downloadFile).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction');
    });

    await waitFor((): void => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });
  });

  test('switches to JSON format and exports JSON', async (): Promise<void> => {
    const toast = (await import('react-hot-toast')).default as { success: (m: string) => void; error: (m: string) => void };
    vi.mocked(generateJSON).mockReturnValue('json-content');
    vi.mocked(getExportFilename).mockReturnValue('transactions.json');
    vi.mocked(getMimeType).mockReturnValue('application/json');

    const transactions = [{ id: '1' }, { id: '2' }] as unknown as unknown[];
    const onExport = vi.fn(async (): Promise<unknown[]> => []);

    render(<ExportTransactions transactions={transactions as unknown as never[]} onExport={onExport as unknown as never} />);

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'json' } });
    expect(select.value).toBe('json');

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(generateJSON).toHaveBeenCalledTimes(1);
      expect(generateJSON).toHaveBeenCalledWith(transactions);
      expect(generateCSV).not.toHaveBeenCalled();
      expect(downloadFile).toHaveBeenCalledWith('json-content', 'transactions.json', 'application/json');
      expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
    });
  });

  test('shows error toast when there are no transactions to export (no date range)', async (): Promise<void> => {
    const toast = (await import('react-hot-toast')).default as { success: (m: string) => void; error: (m: string) => void };

    const transactions: unknown[] = [];
    const onExport = vi.fn(async (): Promise<unknown[]> => []);

    render(<ExportTransactions transactions={transactions as unknown as never[]} onExport={onExport as unknown as never} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
      expect(generateCSV).not.toHaveBeenCalled();
      expect(generateJSON).not.toHaveBeenCalled();
      expect(onExport).not.toHaveBeenCalled();
    });

    expect(screen.getByText('Ready to export all 0 transactions')).toBeInTheDocument();
  });

  test('shows error toast when onExport returns empty for selected date range', async (): Promise<void> => {
    const toast = (await import('react-hot-toast')).default as { success: (m: string) => void; error: (m: string) => void };

    const onExport = vi.fn(async (): Promise<unknown[]> => []);
    const transactions = [{ id: '1' }] as unknown as unknown[];

    render(<ExportTransactions transactions={transactions as unknown as never[]} onExport={onExport as unknown as never} />);

    fireEvent.click(screen.getByRole('button', { name: 'Set Range' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
      expect(downloadFile).not.toHaveBeenCalled();
      expect(generateCSV).not.toHaveBeenCalled();
      expect(generateJSON).not.toHaveBeenCalled();
    });
  });

  test('handles errors during export and shows failure toast', async (): Promise<void> => {
    const toast = (await import('react-hot-toast')).default as { success: (m: string) => void; error: (m: string) => void };
    const errorSpy = vi.spyOn(console, 'error').mockImplementation((): void => {});

    vi.mocked(generateCSV).mockImplementation((): string => {
      throw new Error('boom');
    });

    const transactions = [{ id: '1' }] as unknown as unknown[];
    const onExport = vi.fn(async (): Promise<unknown[]> => []);

    render(<ExportTransactions transactions={transactions as unknown as never[]} onExport={onExport as unknown as never} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor((): void => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions');
      expect(errorSpy).toHaveBeenCalled();
      expect(downloadFile).not.toHaveBeenCalled();
    });

    errorSpy.mockRestore();
  });

  test('renders accessible labels and controls', (): void => {
    const onExport = vi.fn(async (): Promise<unknown[]> => []);
    const transactions = [{ id: '1' }] as unknown as unknown[];

    render(<ExportTransactions transactions={transactions as unknown as never[]} onExport={onExport as unknown as never} />);

    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(screen.getByText('Date Range (Optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set Range' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear Range' })).toBeInTheDocument();
  });
});