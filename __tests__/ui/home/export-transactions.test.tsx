import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from './export-transactions';
import type { TTransaction } from '@/app/lib/types';
import '@testing-library/jest-dom';

// Mock external dependencies
vi.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: () => <svg data-testid="download-icon" />,
}));
vi.mock('@heroui/react', () => ({
  Button: (props: Record<string, unknown>) => (
    <button
      type="button"
      onClick={props.onPress as () => void}
      disabled={props.isLoading as boolean}
      aria-busy={props.isLoading ? 'true' : 'false'}
      {...props}
    >
      {props.startContent}
      {props.children}
    </button>
  ),
  Card: (props: Record<string, unknown>) => <div data-testid="card">{props.children}</div>,
  CardBody: (props: Record<string, unknown>) => <div data-testid="card-body">{props.children}</div>,
  CardHeader: (props: Record<string, unknown>) => <div data-testid="card-header">{props.children}</div>,
  DateRangePicker: (props: Record<string, unknown>) => (
    <div>
      <label htmlFor="daterange">{props.label}</label>
      <input
        id="daterange"
        data-testid="daterange-input"
        type="text"
        onChange={() => {
          if (props.onChange) {
            props.onChange({
              start: { toString: () => '2024-01-01' },
              end: { toString: () => '2024-01-31' },
            });
          }
        }}
      />
    </div>
  ),
  Select: (props: Record<string, unknown>) => (
    <div>
      <label htmlFor="select">{props.label}</label>
      <select
        id="select"
        data-testid="format-select"
        value={props.selectedKeys ? props.selectedKeys[0] : ''}
        onChange={props.onChange as (e: React.ChangeEvent<HTMLSelectElement>) => void}
      >
        {props.children}
      </select>
    </div>
  ),
  SelectItem: (props: Record<string, unknown>) => (
    <option value={props.value} data-testid={`select-item-${props.value}`}>
      {props.children}
    </option>
  ),
}));

vi.mock('@internationalized/date', () => ({
  parseDate: (date: string) => ({ toString: () => date }),
}));

vi.mock('date-fns', () => ({
  format: (date: Date, _format: string) => {
    // Return ISO string for test simplicity
    return date.toISOString().slice(0, 10);
  },
  subMonths: (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() - months);
    return d;
  },
}));

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 24,
}));

vi.mock('@/app/lib/export-utils', () => ({
  generateCSV: vi.fn(() => 'csv-content'),
  generateJSON: vi.fn(() => 'json-content'),
  getExportFilename: vi.fn((format: string) => `export.${format}`),
  getMimeType: vi.fn((format: string) => (format === 'csv' ? 'text/csv' : 'application/json')),
  downloadFile: vi.fn(),
}));

const mockToast = require('react-hot-toast').default;
const {
  generateCSV,
  generateJSON,
  getExportFilename,
  getMimeType,
  downloadFile,
} = require('@/app/lib/export-utils');

const defaultTransactions: TTransaction[] = [
  { id: '1', amount: 100, date: '2024-01-01', description: 'Test 1' },
  { id: '2', amount: 200, date: '2024-01-02', description: 'Test 2' },
];

describe('ExportTransactions', () => {
  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

        onExport={vi.fn()}
      />
    );
    expect(screen.getByText('Export Transactions')).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(screen.getByLabelText('Date Range (Optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument();
    expect(screen.getByTestId('download-icon')).toBeInTheDocument();
  });

        onExport={vi.fn()}
      />
    );
    expect(screen.getByText('Ready to export all 1 transaction')).toBeInTheDocument();
  });

        onExport={vi.fn()}
      />
    );
    const select = screen.getByTestId('format-select') as HTMLSelectElement;
    expect(select.value).toBe('csv');
    fireEvent.change(select, { target: { value: 'json' } });
    expect(select.value).toBe('json');
  });

        onExport={vi.fn()}
      />
    );
    const input = screen.getByTestId('daterange-input');
    fireEvent.change(input);
    expect(
      screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31')
    ).toBeInTheDocument();
  });

        onExport={onExport}
      />
    );
    // Set date range
    fireEvent.change(screen.getByTestId('daterange-input'));
    // Click export
    const button = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(button);
    await waitFor(() => {
      expect(onExport).toHaveBeenCalledWith(
        new Date('2024-01-01'),
        expect.any(Date)
      );
    });
  });

        onExport={onExport}
      />
    );
    const button = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(button);
    await waitFor(() => {
      expect(generateCSV).toHaveBeenCalledWith(defaultTransactions);
      expect(downloadFile).toHaveBeenCalledWith(
        'csv-content',
        'export.csv',
        'text/csv'
      );
      expect(mockToast.success).toHaveBeenCalledWith('Exported 2 transactions');
    });
  });

        onExport={onExport}
      />
    );
    const select = screen.getByTestId('format-select');
    fireEvent.change(select, { target: { value: 'json' } });
    const button = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(button);
    await waitFor(() => {
      expect(generateJSON).toHaveBeenCalledWith(defaultTransactions);
      expect(downloadFile).toHaveBeenCalledWith(
        'json-content',
        'export.json',
        'application/json'
      );
      expect(mockToast.success).toHaveBeenCalledWith('Exported 2 transactions');
    });
  });

        onExport={onExport}
      />
    );
    // Set date range to trigger onExport
    fireEvent.change(screen.getByTestId('daterange-input'));
    const button = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('No transactions to export');
    });
  });

        onExport={onExport}
      />
    );
    const button = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to export transactions');
    });
  });

    );
    render(
      <ExportTransactions
        transactions={defaultTransactions}
        onExport={onExport}
      />
    );
    const button = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveTextContent('Exporting...');
    // Finish export
    resolvePromise();
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-busy', 'false');
      expect(button).toHaveTextContent('Export');
    });
  });

        onExport={vi.fn()}
      />
    );
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(screen.getByLabelText('Date Range (Optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });
});
