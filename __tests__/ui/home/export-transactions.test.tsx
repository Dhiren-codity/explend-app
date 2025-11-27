import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import toast from 'react-hot-toast';
import { downloadFile, generateCSV, generateJSON, getExportFilename, getMimeType } from '@/app/lib/export-utils';

vi.mock('react-hot-toast', () => {
  return {
    default: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: (): null => null,
}));

vi.mock('@heroui/react', () => {
  return {
    Button: ({ children, onPress, isLoading }: { children: React.ReactNode; onPress?: () => void; isLoading?: boolean }): JSX.Element => (
      <button type="button" aria-busy={isLoading === true} onClick={onPress}>
        {children}
      </button>
    ),
    Card: ({ children }: { children: React.ReactNode }): JSX.Element => <div>{children}</div>,
    CardBody: ({ children }: { children: React.ReactNode }): JSX.Element => <div>{children}</div>,
    CardHeader: ({ children }: { children: React.ReactNode }): JSX.Element => <div>{children}</div>,
    Select: ({ label, selectedKeys, onChange, children }: { label?: string; selectedKeys?: string[]; onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void; children?: React.ReactNode }): JSX.Element => (
      <label>
        {label}
        <select aria-label={label} value={selectedKeys?.[0] ?? ''} onChange={onChange}>
          {children}
        </select>
      </label>
    ),
    SelectItem: ({ children, value }: { children: React.ReactNode; value?: string }): JSX.Element => (
      <option value={value}>{children}</option>
    ),
    DateRangePicker: ({ label, onChange }: { label?: string; onChange?: (value: { start: { toString: () => string }; end: { toString: () => string } } | null) => void }): JSX.Element => (
      <div>
        <span>{label}</span>
        <button
          type="button"
          aria-label="Apply Date Range"
          onClick={(): void => {
            onChange?.({
              start: { toString: (): string => '2023-01-01' },
              end: { toString: (): string => '2023-01-31' },
            });
          }}
        >
          Apply Date Range
        </button>
        <button
          type="button"
          aria-label="Clear Date Range"
          onClick={(): void => {
            onChange?.(null);
          }}
        >
          Clear Date Range
        </button>
      </div>
    ),
  };
});

vi.mock('@internationalized/date', () => ({
  parseDate: (s: string): { toString: () => string } => ({ toString: (): string => String(s) }),
}));

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 16,
}));

vi.mock('@/app/lib/export-utils', () => ({
  downloadFile: vi.fn(),
  generateCSV: vi.fn(),
  generateJSON: vi.fn(),
  getExportFilename: vi.fn(),
  getMimeType: vi.fn(),
}));

describe('Tests', (): void => {

  describe('ExportTransactions', (): void => {
      cleanup();
      vi.clearAllMocks();
    });


      expect(screen.getByText('Export Transactions')).toBeInTheDocument();

      const exportFormatSelect = screen.getByRole('combobox', { name: 'Export Format' });
      expect(exportFormatSelect).toBeInTheDocument();

      expect(screen.getByText('Date Range (Optional)')).toBeInTheDocument();

      const exportButton = screen.getByRole('button', { name: 'Export' });
      expect(exportButton).toBeInTheDocument();

      expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument();
    });

      expect(screen.getByText('Ready to export all 1 transaction')).toBeInTheDocument();
    });

      const exportButton = screen.getByRole('button', { name: 'Export' });
      fireEvent.click(exportButton);

      await await waitFor((): void => {
        expect(generateCSV).toHaveBeenCalledTimes(1);
        expect(generateJSON).not.toHaveBeenCalled();
        expect(getExportFilename).toHaveBeenCalledWith('csv');
        expect(getMimeType).toHaveBeenCalledWith('csv');
        expect(downloadFile).toHaveBeenCalledWith('csv-content', 'file.csv', 'text/csv');
        expect(onExport).not.toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
      });
    });

      const formatSelect = screen.getByRole('combobox', { name: 'Export Format' });
      fireEvent.change(formatSelect, { target: { value: 'json' } });

      const exportButton = screen.getByRole('button', { name: 'Export' });
      fireEvent.click(exportButton);

      await await waitFor((): void => {
        expect(generateJSON).toHaveBeenCalledTimes(1);
        expect(generateCSV).not.toHaveBeenCalled();
        expect(getExportFilename).toHaveBeenCalledWith('json');
        expect(getMimeType).toHaveBeenCalledWith('json');
        expect(downloadFile).toHaveBeenCalledWith('json-content', 'file.json', 'application/json');
        expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
      });
    });

      expect(screen.getByText('Ready to export all 1 transaction')).toBeInTheDocument();

      const applyButton = screen.getByRole('button', { name: 'Apply Date Range' });
      fireEvent.click(applyButton);

      expect(screen.getByText('Exporting transactions from 2023-01-01 to 2023-01-31')).toBeInTheDocument();

      const clearButton = screen.getByRole('button', { name: 'Clear Date Range' });
      fireEvent.click(clearButton);

      expect(screen.getByText('Ready to export all 1 transaction')).toBeInTheDocument();
    });
      const onExport = vi.fn<[_start?: Date, _end?: Date], Promise<unknown[]>>().mockResolvedValue(returned);

      render(<ExportTransactions transactions={[{ id: '1' }, { id: '2' } as Record<string, unknown>]} onExport={onExport} />);

      fireEvent.click(screen.getByRole('button', { name: 'Apply Date Range' }));

      const exportButton = screen.getByRole('button', { name: 'Export' });
      fireEvent.click(exportButton);

      await await waitFor((): void => {
        expect(onExport).toHaveBeenCalledTimes(1);
        const call = onExport.mock.calls[0];
        const startArg = call[0] as Date | undefined;
        const endArg = call[1] as Date | undefined;

        expect(startArg).toBeInstanceOf(Date);
        expect(endArg).toBeInstanceOf(Date);

        expect(startArg?.getFullYear()).toBe(2023);
        expect(startArg?.getMonth()).toBe(0);
        expect(startArg?.getDate()).toBe(1);

        expect(endArg?.getFullYear()).toBe(2023);
        expect(endArg?.getMonth()).toBe(0);
        expect(endArg?.getDate()).toBe(31);
        expect(endArg?.getHours()).toBe(23);
        expect(endArg?.getMinutes()).toBe(59);
        expect(endArg?.getSeconds()).toBe(59);
        expect(endArg?.getMilliseconds()).toBe(999);

        expect(generateCSV).toHaveBeenCalledWith(returned);
        expect(downloadFile).toHaveBeenCalledWith('csv-content-range', 'file.csv', 'text/csv');
        expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions');
      });
    });

      const exportButton = screen.getByRole('button', { name: 'Export' });
      fireEvent.click(exportButton);

      await await waitFor((): void => {
        expect(toast.error).toHaveBeenCalledWith('No transactions to export');
        expect(downloadFile).not.toHaveBeenCalled();
        expect(generateCSV).not.toHaveBeenCalled();
        expect(generateJSON).not.toHaveBeenCalled();
      });
    });

      fireEvent.click(screen.getByRole('button', { name: 'Apply Date Range' }));
      fireEvent.click(screen.getByRole('button', { name: 'Export' }));

      await await waitFor((): void => {
        expect(onExport).toHaveBeenCalledTimes(1);
        expect(toast.error).toHaveBeenCalledWith('No transactions to export');
        expect(downloadFile).not.toHaveBeenCalled();
        expect(generateCSV).not.toHaveBeenCalled();
        expect(generateJSON).not.toHaveBeenCalled();
      });
    });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation((): void => {});

      render(<ExportTransactions transactions={[{ id: '1' } as Record<string, unknown>]} onExport={async (): Promise<unknown[]> => []} />);

      const exportButton = screen.getByRole('button', { name: 'Export' });
      fireEvent.click(exportButton);

      await await waitFor((): void => {
        expect(toast.error).toHaveBeenCalledWith('Failed to export transactions');
        expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
});
