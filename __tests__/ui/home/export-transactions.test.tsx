import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import toast from 'react-hot-toast';
import {
import '@testing-library/jest-dom';
  generateCSV,
  generateJSON,
  getExportFilename,
  getMimeType,
  downloadFile,
} from '@/app/lib/export-utils';

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 16,
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: () => null,
}));

vi.mock('@internationalized/date', () => ({
  parseDate: (s: string) => ({ toString: () => s }),
}));

vi.mock('@heroui/react', () => {
  const React = require('react');
  type SelectItemProps = { value?: string; children?: React.ReactNode };
  type SelectProps = {
    label?: string;
    selectedKeys?: string[];
    onChange?: (e: { target: { value: string } }) => void;
    children?: React.ReactNode;
    className?: string;
  };
  type ButtonProps = {
    color?: string;
    startContent?: React.ReactNode;
    onPress?: () => void;
    isLoading?: boolean;
    className?: string;
    children?: React.ReactNode;
  };
  type SimpleProps = { children?: React.ReactNode; className?: string };
  type DateRangePickerProps = {
    label?: string;
    className?: string;
    defaultValue?: unknown;
    onChange?: (value: unknown) => void;
  };

  const SelectItem = (_props: SelectItemProps): React.ReactElement | null => {
    return null;
  };

  const Select = (props: SelectProps): React.ReactElement => {
    const { label, selectedKeys, onChange, children } = props;
    const id = 'mock-select';
    const childArray = React.Children.toArray(children) as React.ReactElement<SelectItemProps>[];
    const options = childArray.map((child, idx) => {
      const value = (child.props && child.props.value) || '';
      const content = child.props && child.props.children;
      return React.createElement('option', { key: String(idx), value }, content as React.ReactNode);
    });
    return React.createElement(
      React.Fragment,
      null,
      React.createElement('label', { htmlFor: id }, label),
      React.createElement(
        'select',
        {
          id,
          'aria-label': label,
          value: selectedKeys && selectedKeys.length > 0 ? selectedKeys[0] : '',
          onChange,
        },
        options,
      ),
    );
  };

  const Button = (props: ButtonProps): React.ReactElement => {
    const { onPress, isLoading, children, startContent } = props;
    return React.createElement(
      'button',
      { type: 'button', onClick: onPress, disabled: !!isLoading },
      React.createElement(React.Fragment, null, startContent),
      children,
    );
  };

  const Card = (props: SimpleProps): React.ReactElement => {
    return React.createElement('div', null, props.children as React.ReactNode);
  };
  const CardBody = (props: SimpleProps): React.ReactElement => {
    return React.createElement('div', null, props.children as React.ReactNode);
  };
  const CardHeader = (props: SimpleProps): React.ReactElement => {
    return React.createElement('div', null, props.children as React.ReactNode);
  };

  const DateRangePicker = (props: DateRangePickerProps): React.ReactElement => {
    const { label, onChange } = props;
    const handleClick = (): void => {
      if (onChange) {
        onChange({
          start: { toString: () => '2024-01-01' },
          end: { toString: () => '2024-01-31' },
        });
      }
    };
    return React.createElement(
      'button',
      { type: 'button', onClick: handleClick },
      label ?? 'Date Range',
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
    generateCSV: vi.fn(() => 'csv-content'),
    generateJSON: vi.fn(() => 'json-content'),
    getExportFilename: vi.fn((fmt: string) => (fmt === 'json' ? 'export.json' : 'export.csv')),
    getMimeType: vi.fn((fmt: string) => (fmt === 'json' ? 'application/json' : 'text/csv')),
    downloadFile: vi.fn(),
  };
});

const createTransactions = (count: number): unknown[] =>
  Array.from({ length: count }, (_, i) => ({ id: i + 1 }));

describe('ExportTransactions', () => {
  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

    );

    expect(screen.getByRole('heading', { name: 'Export Transactions' })).toBeInTheDocument();
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByText('Ready to export all 3 transactions')).toBeInTheDocument();
  });


    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor((): void => {
      expect(onExport).not.toHaveBeenCalled();
      expect(generateCSV).toHaveBeenCalledTimes(1);
      expect(generateCSV).toHaveBeenCalledWith(transactions);
      expect(generateJSON).not.toHaveBeenCalled();
      expect(getExportFilename).toHaveBeenCalledWith('csv');
      expect(getMimeType).toHaveBeenCalledWith('csv');
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv');
      expect((toast as unknown as { success: unknown }).success).toHaveBeenCalledWith(
        'Exported 2 transactions',
      );
    });
  });


    const select = screen.getByLabelText('Export Format');
    fireEvent.change(select, { target: { value: 'json' } });

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor((): void => {
      expect(generateJSON).toHaveBeenCalledTimes(1);
      expect(generateCSV).not.toHaveBeenCalled();
      expect(getExportFilename).toHaveBeenCalledWith('json');
      expect(getMimeType).toHaveBeenCalledWith('json');
      expect(downloadFile).toHaveBeenCalledWith('json-content', 'export.json', 'application/json');
      expect((toast as unknown as { success: unknown }).success).toHaveBeenCalledWith(
        'Exported 1 transaction',
      );
    });
  });


    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor((): void => {
      expect(onExport).not.toHaveBeenCalled();
      expect(downloadFile).not.toHaveBeenCalled();
      expect(generateCSV).not.toHaveBeenCalled();
      expect(generateJSON).not.toHaveBeenCalled();
      expect((toast as unknown as { error: unknown }).error).toHaveBeenCalledWith(
        'No transactions to export',
      );
    });
  });


    fireEvent.click(screen.getByRole('button', { name: 'Date Range (Optional)' }));

    expect(
      screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
    });

    const [startArg, endArg] = onExport.mock.calls[0] as [Date, Date];
    expect(startArg).toBeInstanceOf(Date);
    expect(endArg).toBeInstanceOf(Date);
    expect(endArg.getHours()).toBe(23);
    expect(endArg.getMinutes()).toBe(59);
    expect(endArg.getSeconds()).toBe(59);
    expect(endArg.getMilliseconds()).toBe(999);

    await await waitFor((): void => {
      expect(downloadFile).toHaveBeenCalled();
      expect((toast as unknown as { success: unknown }).success).toHaveBeenCalledWith(
        'Exported 1 transaction',
      );
    });
  });


    fireEvent.click(screen.getByRole('button', { name: 'Date Range (Optional)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor((): void => {
      expect(onExport).toHaveBeenCalledTimes(1);
      expect(downloadFile).not.toHaveBeenCalled();
      expect((toast as unknown as { error: unknown }).error).toHaveBeenCalledWith(
        'No transactions to export',
      );
    });
  });

    (generateCSV as unknown as { mockImplementationOnce: (fn: () => string) => void }).mockImplementationOnce(
      () => {
        throw new Error('boom');
      },
    );

    render(<ExportTransactions transactions={createTransactions(2)} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await await waitFor((): void => {
      expect((toast as unknown as { error: unknown }).error).toHaveBeenCalledWith(
        'Failed to export transactions',
      );
      expect(errorSpy).toHaveBeenCalled();
    });

    errorSpy.mockRestore();
  });


    const onExport = vi.fn(async (): Promise<unknown[]> => deferred);

    render(<ExportTransactions transactions={createTransactions(3)} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: 'Date Range (Optional)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(screen.getByRole('button', { name: 'Exporting...' })).toBeInTheDocument();

    if (resolveFn) {
      resolveFn(createTransactions(2));
    }

    await await waitFor((): void => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });
  });
});
