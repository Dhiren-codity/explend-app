import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ExportTransactions from '@/app/ui/home/export-transactions';
import toast from 'react-hot-toast';
import { downloadFile, generateCSV, generateJSON, getExportFilename, getMimeType } from '@/app/lib/export-utils';
import type { ReactNode } from 'react';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 24,
}));

vi.mock('@internationalized/date', () => ({
  parseDate: (s: string): { toString: () => string } => ({ toString: () => s }),
}));

vi.mock('date-fns', () => ({
  format: (_date: Date, _fmt: string): string => '2024-01-01',
  subMonths: (date: Date, _months: number): Date => date,
}));

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: (): null => null,
}));

vi.mock('@heroui/react', () => {
  type CalendarLike = { toString: () => string };
  type RangeValue = { start: CalendarLike; end: CalendarLike } | null;

  type SelectProps = {
    label?: string;
    selectedKeys?: string[];
    onChange?: (e: { target: { value: string } }) => void;
    children?: ReactNode;
    className?: string;
  };

  type SelectItemProps = {
    value?: string;
    children?: ReactNode;
  };

  type ButtonProps = {
    children?: ReactNode;
    onPress?: () => void;
    isLoading?: boolean;
    className?: string;
    color?: string;
    startContent?: ReactNode | null;
  };

  type SimpleProps = {
    children?: ReactNode;
    className?: string;
  };

  type DateRangePickerProps = {
    label?: string;
    defaultValue?: unknown;
    onChange?: (value: RangeValue) => void;
    className?: string;
  };

  const Select = (props: SelectProps): JSX.Element => {
    const { label, selectedKeys, onChange, children } = props;
    const value = Array.isArray(selectedKeys) ? selectedKeys[0] : '';
    return (
      <label>
        {label}
        <select aria-label={label} value={value} onChange={onChange}>
          {Array.isArray((children as unknown) as unknown[])
            ? (children as ReactNode[])
                .filter(Boolean)
                .map((child: ReactNode, index: number) => {
                  if (!child || typeof child !== 'object' || !('props' in (child as Record<string, unknown>))) {
                    return null;
                  }
                  const element = child as unknown as { props: SelectItemProps };
                  const keyVal = element.props.value ?? String(index);
                  return (
                    <option key={keyVal} value={keyVal}>
                      {element.props.children as ReactNode}
                    </option>
                  );
                })
            : null}
        </select>
      </label>
    );
  };

  const SelectItem = (_props: SelectItemProps): null => null;

  const Button = (props: ButtonProps): JSX.Element => {
    const { children, onPress, className } = props;
    return (
      <button type="button" className={className} onClick={onPress}>
        {children as ReactNode}
      </button>
    );
  };

  const DateRangePicker = (props: DateRangePickerProps): JSX.Element => {
    const { label, onChange } = props;
    return (
      <div>
        {label ? <span>{label}</span> : null}
        <button type="button" onClick={(): void => onChange?.({ start: { toString: () => '2024-01-01' }, end: { toString: () => '2024-01-31' } })}>
          Set Range
        </button>
        <button type="button" onClick={(): void => onChange?.(null)}>
          Clear Range
        </button>
      </div>
    );
  };

  const Card = (props: SimpleProps): JSX.Element => <div>{props.children as ReactNode}</div>;
  const CardHeader = (props: SimpleProps): JSX.Element => <div>{props.children as ReactNode}</div>;
  const CardBody = (props: SimpleProps): JSX.Element => <div>{props.children as ReactNode}</div>;

  return {
    Button,
    Card,
    CardBody,
    CardHeader,
    DateRangePicker,
    Select,
    SelectItem,
  };

vi.mock('@/app/lib/export-utils', () => ({
  generateCSV: vi.fn((): string => 'csv-content'),
  generateJSON: vi.fn((): string => 'json-content'),
  getExportFilename: vi.fn((fmt: 'csv' | 'json'): string => (fmt === 'csv' ? 'transactions.csv' : 'transactions.json')),
  getMimeType: vi.fn((fmt: 'csv' | 'json'): string => (fmt === 'csv' ? 'text/csv' : 'application/json')),
  downloadFile: vi.fn(),
}));


    const createTransactions = (count: number): Array<Record<string, unknown>> => {
      return Array.from({ length: count }, (_: unknown, i: number) => ({
        id: i + 1,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        amount: i + 0.99,
        description: `Transaction ${i + 1}`,
      }));
    };






      const button = screen.getByRole('button', { name: 'Export' });
      fireEvent.click(button);

      await await waitFor((): void => {


      const select = screen.getByLabelText('Export Format') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'json' } });

      const button = screen.getByRole('button', { name: 'Export' });
      fireEvent.click(button);

      await await waitFor((): void => {


      fireEvent.click(screen.getByRole('button', { name: 'Set Range' }));

      fireEvent.click(screen.getByRole('button', { name: 'Export' }));

      await await waitFor((): void => {

      const firstCall = onExport.mock.calls[0] as [Date, Date];
      const startArg = firstCall[0];
      const endArg = firstCall[1];


      await await waitFor((): void => {


      fireEvent.click(screen.getByRole('button', { name: 'Export' }));

      await await waitFor((): void => {


      fireEvent.click(screen.getByRole('button', { name: 'Set Range' }));
      fireEvent.click(screen.getByRole('button', { name: 'Export' }));

      await await waitFor((): void => {

