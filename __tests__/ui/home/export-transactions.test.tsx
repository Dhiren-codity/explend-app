import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import type { TTransaction } from '@/app/lib/types';
import toast from 'react-hot-toast';
import { downloadFile, generateCSV, generateJSON, getExportFilename, getMimeType } from '@/app/lib/export-utils';

vi.mock('@/app/lib/export-utils', () => ({
  downloadFile: vi.fn(),
  generateCSV: vi.fn(),
  generateJSON: vi.fn(),
  getExportFilename: vi.fn(),
  getMimeType: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@internationalized/date', () => ({
  parseDate: (s: string) => ({ toString: (): string => s }),
}));

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: (): JSX.Element => <span data-testid="mock-icon" />,
}));

vi.mock('@heroui/react', () => {
  const DateRangePicker = ({
    label,
    onChange,
    defaultValue,
  }: {
    label: string;
    className?: string;
    defaultValue?: { start: { toString(): string }; end: { toString(): string } };
    onChange?: (value: { start: { toString(): string }; end: { toString(): string } } | null) => void;
  }): JSX.Element => {
    const [start, setStart] = React.useState<string>(defaultValue ? defaultValue.start.toString() : '');
    const [end, setEnd] = React.useState<string>(defaultValue ? defaultValue.end.toString() : '');

    React.useEffect((): void => {
      setStart(defaultValue ? defaultValue.start.toString() : '');
      setEnd(defaultValue ? defaultValue.end.toString() : '');
    }, [defaultValue?.start?.toString?.(), defaultValue?.end?.toString?.()]);

    const maybeEmit = (nextStart: string, nextEnd: string): void => {
      if (!onChange) return;
      if (nextStart && nextEnd) {
        onChange({
          start: { toString: (): string => nextStart },
          end: { toString: (): string => nextEnd },
        });

    return (
      <div>
        <label>
          <span>{label}</span>
          <input
            aria-label={`${label} Start`}
            type="date"
            value={start}
            onChange={(e): void => {
              setStart(e.target.value);
              maybeEmit(e.target.value, end);
            }}
          />
          <input
            aria-label={`${label} End`}
            type="date"
            value={end}
            onChange={(e): void => {
              setEnd(e.target.value);
              maybeEmit(start, e.target.value);
            }}
          />
          <button
            type="button"
            onClick={(): void => {
              if (onChange) onChange(null);
              setStart('');
              setEnd('');
            }}
          >
            Clear
          </button>
        </label>
      </div>
    );
  };

  const SelectItem = ({ value, children }: { value?: string; children: React.ReactNode }): JSX.Element => {
    return <option value={value}>{children}</option>;
  };

  const Select = ({
    label,
    selectedKeys,
    onChange,
    children,
  }: {
    label: string;
    selectedKeys?: readonly string[] | string[];
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    className?: string;
    children: React.ReactNode;
  }): JSX.Element => {
    const selected = Array.isArray(selectedKeys) && selectedKeys.length > 0 ? selectedKeys[0] : '';
    return (
      <label>
        <span>{label}</span>
        <select aria-label={label} value={selected} onChange={onChange}>
          {children}
        </select>
      </label>
    );
  };

  const Button = ({
    onPress,
    isLoading,
    children,
  }: {
    onPress?: () => void;
    isLoading?: boolean;
    startContent?: React.ReactNode;
    color?: string;
    className?: string;
    children: React.ReactNode;
  }): JSX.Element => {
    return (
      <button type="button" onClick={onPress} disabled={!!isLoading}>
        {children}
      </button>
    );
  };

  const Card = ({ children }: { children: React.ReactNode }): JSX.Element => <div>{children}</div>;
  const CardBody = ({ children }: { children: React.ReactNode }): JSX.Element => <div>{children}</div>;
  const CardHeader = ({ children }: { children: React.ReactNode }): JSX.Element => <div>{children}</div>;

  return {
    DateRangePicker,
    Select,
    SelectItem,
    Button,
    Card,
    CardBody,
    CardHeader,
  };


  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  beforeEach((): void => {
    vi.mocked(getExportFilename).mockReturnValue('export.csv');
    vi.mocked(getMimeType).mockReturnValue('text/csv');
    vi.mocked(generateCSV).mockReturnValue('csv-content');
    vi.mocked(generateJSON).mockReturnValue('json-content');
  });

      { id: '2' } as unknown as TTransaction,
    ];
    const onExport = vi.fn<[_start?: Date | undefined, _end?: Date | undefined], Promise<TTransaction[]>>();

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(screen.getByLabelText('Date Range (Optional) Start')).toBeInTheDocument();
    expect(screen.getByLabelText('Date Range (Optional) End')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument();
  });

      { id: '2' } as unknown as TTransaction,
    ];
    const onExport = vi.fn<[_start?: Date | undefined, _end?: Date | undefined], Promise<TTransaction[]>>();

    vi.mocked(getExportFilename).mockReturnValue('file.csv');
    vi.mocked(getMimeType).mockReturnValue('text/csv');
    vi.mocked(generateCSV).mockReturnValue('csv-data');

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor((): void => {
      expect(downloadFile).toHaveBeenCalledWith('csv-data', 'file.csv', 'text/csv');
    });

    expect(generateCSV).toHaveBeenCalledTimes(1);
    expect(generateCSV).toHaveBeenCalledWith(transactions);
    expect(generateJSON).not.toHaveBeenCalled();
    expect(onExport).not.toHaveBeenCalled();
    expect(toastMock.success).toHaveBeenCalledWith('Exported 2 transactions');
  });

    const onExport = vi.fn<[_start?: Date | undefined, _end?: Date | undefined], Promise<TTransaction[]>>();

    vi.mocked(getExportFilename).mockReturnValue('data.json');
    vi.mocked(getMimeType).mockReturnValue('application/json');
    vi.mocked(generateJSON).mockReturnValue('json-data');

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    const formatSelect = screen.getByLabelText('Export Format');
    fireEvent.change(formatSelect, { target: { value: 'json' } });

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor((): void => {
      expect(downloadFile).toHaveBeenCalledWith('json-data', 'data.json', 'application/json');
    });

    expect(generateJSON).toHaveBeenCalledTimes(1);
    expect(generateJSON).toHaveBeenCalledWith(transactions);
    expect(generateCSV).not.toHaveBeenCalled();
    expect(onExport).not.toHaveBeenCalled();
    expect(toastMock.success).toHaveBeenCalledWith('Exported 1 transaction');
  });

      { id: '2' } as unknown as TTransaction,
      { id: '3' } as unknown as TTransaction,
    ];
    const returnedTransactions: TTransaction[] = [
      { id: '2' } as unknown as TTransaction,
      { id: '3' } as unknown as TTransaction,
    ];

    const onExport = vi.fn<[Date | undefined, Date | undefined], Promise<TTransaction[]>>(
      (start?: Date, end?: Date): Promise<TTransaction[]> => {
        expect(start).toBeInstanceOf(Date);
        expect(end).toBeInstanceOf(Date);
        const endDate = end as Date;
        expect(endDate.getHours()).toBe(23);
        expect(endDate.getMinutes()).toBe(59);
        expect(endDate.getSeconds()).toBe(59);
        expect(endDate.getMilliseconds()).toBe(999);
        return Promise.resolve(returnedTransactions);
      },
    );

    vi.mocked(getExportFilename).mockReturnValue('export.csv');
    vi.mocked(getMimeType).mockReturnValue('text/csv');
    vi.mocked(generateCSV).mockReturnValue('filtered-csv');

    render(<ExportTransactions transactions={initialTransactions} onExport={onExport} />);

    fireEvent.change(screen.getByLabelText('Date Range (Optional) Start'), { target: { value: '2024-05-01' } });
    fireEvent.change(screen.getByLabelText('Date Range (Optional) End'), { target: { value: '2024-05-31' } });

    await await waitFor((): void => {
      expect(screen.getByText('Exporting transactions from 2024-05-01 to 2024-05-31')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
      expect(generateCSV).toHaveBeenCalledWith(returnedTransactions);
      expect(downloadFile).toHaveBeenCalledWith('filtered-csv', 'export.csv', 'text/csv');
      expect(toastMock.success).toHaveBeenCalledWith('Exported 2 transactions');
    });


    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor((): void => {
      expect(toastMock.error).toHaveBeenCalledWith('No transactions to export');
    });

    expect(downloadFile).not.toHaveBeenCalled();
    expect(onExport).not.toHaveBeenCalled();
  });

    const onExport = vi.fn<[Date | undefined, Date | undefined], Promise<TTransaction[]>>(
      (): Promise<TTransaction[]> => Promise.reject(new Error('boom')),
    );

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    fireEvent.change(screen.getByLabelText('Date Range (Optional) Start'), { target: { value: '2024-06-01' } });
    fireEvent.change(screen.getByLabelText('Date Range (Optional) End'), { target: { value: '2024-06-30' } });

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor((): void => {
      expect(toastMock.error).toHaveBeenCalledWith('Failed to export transactions');
    });

    await await waitFor((): void => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });

    expect(downloadFile).not.toHaveBeenCalled();
  });


    let resolveFn: ((value: TTransaction[] | PromiseLike<TTransaction[]>) => void) | null = null;
    const pending = new Promise<TTransaction[]>((resolve) => {
      resolveFn = resolve;
    });

    const onExport = vi.fn<[Date | undefined, Date | undefined], Promise<TTransaction[]>>(
      (): Promise<TTransaction[]> => pending,
    );

    render(<ExportTransactions transactions={transactions} onExport={onExport} />);

    fireEvent.change(screen.getByLabelText('Date Range (Optional) Start'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Date Range (Optional) End'), { target: { value: '2024-01-31' } });

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(screen.getByRole('button', { name: 'Exporting...' })).toBeInTheDocument();

    (resolveFn as (value: TTransaction[]) => void)([{ id: '2' } as unknown as TTransaction]);

    await await waitFor((): void => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });

    expect(onExport).toHaveBeenCalledTimes(1);
    expect(toastMock.success).toHaveBeenCalledWith('Exported 1 transaction');
  });
