import React, { ComponentType } from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from './export-transactions';
import toast from 'react-hot-toast';
import { downloadFile, generateCSV, generateJSON, getExportFilename, getMimeType } from '@/app/lib/export-utils';
import '@testing-library/jest-dom';

vi.mock('@heroui/react', () => {
  const ReactLib = require('react');
  type PropsRecord = Record<string, unknown>;

  const Card = ({ children }: PropsRecord): JSX.Element =>
    ReactLib.createElement('div', { 'data-testid': 'Card' }, children);

  const CardHeader = ({ children }: PropsRecord): JSX.Element =>
    ReactLib.createElement('div', { 'data-testid': 'CardHeader' }, children);

  const CardBody = ({ children, className }: PropsRecord): JSX.Element =>
    ReactLib.createElement('div', { 'data-testid': 'CardBody', className: className as string }, children);

  const Select = ({
    label,
    selectedKeys,
    onChange,
    children,
    className,
  }: PropsRecord & { label?: string }): JSX.Element => {
      Array.isArray(selectedKeys) && selectedKeys.length > 0 ? String(selectedKeys[0]) : '';
    const handleChange = (e: unknown): void => {
      if (typeof onChange === 'function') {
        (onChange as (v: unknown) => void)(e);
      }
    };
    return ReactLib.createElement(
      'div',
      { className: className as string },
      ReactLib.createElement('label', {}, [
        label ? ReactLib.createElement('span', { key: 'l' }, String(label)) : null,
        ReactLib.createElement(
          'select',
          {
            key: 's',
            'aria-label': label ? String(label) : 'select',
            value,
            onChange: handleChange,
          },
          children,
        ),
      ]),
    );
  };

  const SelectItem = ({
    children,
    value,
  }: PropsRecord & { value?: string }): JSX.Element =>
    ReactLib.createElement('option', { value: value as string }, children);

  const DateRangePicker = ({
    label,
    onChange,
    className,
  }: PropsRecord & { label?: string }): JSX.Element => {
    const applyRange = (): void => {
      if (typeof onChange === 'function') {
        (onChange as (v: unknown) => void)({
          start: { toString: () => '2024-01-01' },
          end: { toString: () => '2024-01-31' },
        });
      }
    };
    const clearRange = (): void => {
      if (typeof onChange === 'function') {
        (onChange as (v: unknown) => void)(null);
      }
    };
    return ReactLib.createElement(
      'div',
      { className: className as string },
          ? ReactLib.createElement(
              'span',
              { key: 'label', 'aria-label': String(label) },
              String(label),
            )
          : null,
        ReactLib.createElement(
          'button',
          { key: 'apply', type: 'button', onClick: applyRange },
          'Apply Mock Range',
        ),
        ReactLib.createElement(
          'button',
          { key: 'clear', type: 'button', onClick: clearRange },
          'Clear Range',
        ),
      ],
    );
  };

  const Button = ({
    children,
    onPress,
    isLoading,
    startContent,
    className,
  }: PropsRecord): JSX.Element =>
    ReactLib.createElement(
      'button',
      {
        className: className as string,
        onClick: onPress as () => void,
        disabled: Boolean(isLoading),
        'aria-busy': Boolean(isLoading),
      },
      [startContent as JSX.Element, children as JSX.Element],
    );

  return {
    Card,
    CardHeader,
    CardBody,
    Select,
    SelectItem,
    DateRangePicker,
    Button,
  };
});

vi.mock('react-hot-toast', () => {
  return {
    default: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock('react-icons/pi', () => {
  const ReactLib = require('react');
  const PiDownloadSimpleFill = (_props: Record<string, unknown>): JSX.Element =>
    ReactLib.createElement('span', { 'data-testid': 'icon' });
  return { PiDownloadSimpleFill };
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

vi.mock('@/config/constants/main', () => {
  return {
    DEFAULT_ICON_SIZE: 16,
  };
});

type ExportComponentProps = {
  transactions: unknown[];
  onExport: (startDate?: Date, endDate?: Date) => Promise<unknown[]>;
};

describe('ExportTransactions', () => {
  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  const ExportComponent = ExportTransactions as unknown as ComponentType<ExportComponentProps>;

    { id: 't1', amount: 100, date: '2024-01-10' },
    { id: 't2', amount: 200, date: '2024-01-15' },
  ];

  test('renders correctly with default props and shows pluralized count: void', (): void => {
    const onExport = vi.fn(async (): Promise<unknown[]> => sampleTransactions);
    render(<ExportComponent transactions={sampleTransactions} onExport={onExport} />);

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(screen.getByText('Date Range (Optional)')).toBeInTheDocument();

    const exportButton = screen.getByRole('button', { name: 'Export' });
    expect(exportButton).toBeInTheDocument();

    expect(
      screen.getByText('Ready to export all 2 transactions'),
    ).toBeInTheDocument();
    expect(onExport).not.toHaveBeenCalled();
  });

  test('exports CSV by default and shows success toast: Promise<void>', async (): Promise<void> => {
    const onExport = vi.fn(async (): Promise<unknown[]> => sampleTransactions);

    vi.mocked(generateCSV).mockReturnValue('csv-content');
    vi.mocked(getExportFilename).mockReturnValue('transactions.csv');
    vi.mocked(getMimeType).mockReturnValue('text/csv');
    vi.mocked(downloadFile).mockImplementation((): void => {});

    render(<ExportComponent transactions={sampleTransactions} onExport={onExport} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(generateCSV).toHaveBeenCalledWith(sampleTransactions);
    });
    expect(generateJSON).not.toHaveBeenCalled();
    expect(getExportFilename).toHaveBeenCalledWith('csv');
    expect(getMimeType).toHaveBeenCalledWith('csv');
    expect(downloadFile).toHaveBeenCalledWith('csv-content', 'transactions.csv', 'text/csv');
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
  });

  test('switches to JSON format and exports JSON: Promise<void>', async (): Promise<void> => {
    const onExport = vi.fn(async (): Promise<unknown[]> => sampleTransactions);

    vi.mocked(generateJSON).mockReturnValue('json-content');
    vi.mocked(getExportFilename).mockReturnValue('transactions.json');
    vi.mocked(getMimeType).mockReturnValue('application/json');
    vi.mocked(downloadFile).mockImplementation((): void => {});

    render(<ExportComponent transactions={sampleTransactions} onExport={onExport} />);

    const formatSelect = screen.getByLabelText('Export Format') as HTMLSelectElement;
    fireEvent.change(formatSelect, { target: { value: 'json' } });

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(generateJSON).toHaveBeenCalledWith(sampleTransactions);
    });
    expect(generateCSV).not.toHaveBeenCalled();
    expect(getExportFilename).toHaveBeenCalledWith('json');
    expect(getMimeType).toHaveBeenCalledWith('json');
    expect(downloadFile).toHaveBeenCalledWith('json-content', 'transactions.json', 'application/json');
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
  });

  test('shows error toast when no transactions to export: Promise<void>', async (): Promise<void> => {
    const onExport = vi.fn(async (): Promise<unknown[]> => []);

    render(<ExportComponent transactions={[]} onExport={onExport} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export');
    });
    expect(downloadFile).not.toHaveBeenCalled();
    expect(onExport).not.toHaveBeenCalled();
  });

  test('selecting a date range calls onExport with adjusted end time and exports subset: Promise<void>', async (): Promise<void> => {
    const subset = [{ id: 't1', amount: 100, date: '2024-01-10' }];
    const onExport = vi.fn(async (_start?: Date, _end?: Date): Promise<unknown[]> => subset);

    vi.mocked(generateCSV).mockReturnValue('csv-content');
    vi.mocked(getExportFilename).mockReturnValue('transactions.csv');
    vi.mocked(getMimeType).mockReturnValue('text/csv');

    render(<ExportComponent transactions={sampleTransactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Apply Mock Range' }));

    expect(
      screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31'),
    ).toBeInTheDocument();

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1);
    });

    const callArgs = vi.mocked(onExport).mock.calls[0];
    const startArg = callArgs[0] as Date | undefined;
    const endArg = callArgs[1] as Date | undefined;

    expect(startArg).toBeInstanceOf(Date);
    expect(endArg).toBeInstanceOf(Date);
    expect(startArg?.toISOString().startsWith('2024-01-01')).toBe(true);
    expect(endArg?.getHours()).toBe(23);
    expect(endArg?.getMinutes()).toBe(59);
    expect(endArg?.getSeconds()).toBe(59);
    expect(endArg?.getMilliseconds()).toBe(999);

    await waitFor(() => {
      expect(generateCSV).toHaveBeenCalledWith(subset);
    });
    expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction');
  });

  test('clearing date range reverts to exporting all transactions: Promise<void>', async (): Promise<void> => {
    const onExport = vi.fn(async (): Promise<unknown[]> => sampleTransactions);
    vi.mocked(generateCSV).mockReturnValue('csv-content');
    vi.mocked(getExportFilename).mockReturnValue('transactions.csv');
    vi.mocked(getMimeType).mockReturnValue('text/csv');

    render(<ExportComponent transactions={sampleTransactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Apply Mock Range' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear Range' }));

    expect(
      screen.getByText('Ready to export all 2 transactions'),
    ).toBeInTheDocument();

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(generateCSV).toHaveBeenCalledWith(sampleTransactions);
    });
    expect(onExport).not.toHaveBeenCalled();
  });

  test('shows loading state while exporting and hides icon during loading: Promise<void>', async (): Promise<void> => {
    let resolveExport: (() => void) | null = null;
    const onExport = vi.fn((_s?: Date, _e?: Date) => {
      return new Promise<unknown[]>((resolve) => {
        resolveExport = () => resolve(sampleTransactions);
      });
    });

    vi.mocked(generateCSV).mockReturnValue('csv-content');
    vi.mocked(getExportFilename).mockReturnValue('transactions.csv');
    vi.mocked(getMimeType).mockReturnValue('text/csv');

    render(<ExportComponent transactions={sampleTransactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Apply Mock Range' }));

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    expect(exportButton).toHaveAttribute('aria-busy', 'true');
    expect(exportButton).toBeDisabled();
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    expect(screen.getByText('Exporting...')).toBeInTheDocument();

    resolveExport && resolveExport();

    await waitFor(() => {
      expect(exportButton).not.toBeDisabled();
    });
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });

  test('handles errors during export and shows error toast: Promise<void>', async (): Promise<void> => {
    const onExport = vi.fn(async (): Promise<unknown[]> => sampleTransactions);

    vi.mocked(generateCSV).mockImplementation((): string => {
      throw new Error('boom');
    });

    const errorSpy = vi.spyOn(console, 'error').mockImplementation((): void => {});

    render(<ExportComponent transactions={sampleTransactions} onExport={onExport} />);

    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions');
    });

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  test('renders singular text for one transaction: void', (): void => {
    const onExport = vi.fn(async (): Promise<unknown[]> => [{ id: 't1' }]);

    render(<ExportComponent transactions={[{ id: 't1' }]} onExport={onExport} />);

    expect(
      screen.getByText('Ready to export all 1 transaction'),
    ).toBeInTheDocument();
  });
});
