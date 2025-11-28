import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExportTransactions from './export-transactions'
import '@testing-library/jest-dom';

vi.mock('@heroui/react', () => {
  const React = require('react')
  return {
    Button: ({ children, onPress, isLoading, ...props }: any) => {
      return (
        <button onClick={onPress} aria-busy={isLoading} {...props}>
          {isLoading ? 'Exporting...' : children}
        </button>
      )
    },
    Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    CardBody: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Select: ({ label, onChange, selectedKeys, children, className }: any) => {
      const value = selectedKeys && selectedKeys.length > 0 ? selectedKeys[0] : ''
      return (
        <label>
          {label}
          <select aria-label={label} value={value} onChange={onChange} className={className}>
            {children}
          </select>
        </label>
      )
    },
    SelectItem: ({ children, value, key }: any) => <option value={value ?? key}>{children}</option>,
    DateRangePicker: ({ label, onChange, className }: any) => {
      return (
        <div className={className}>
          <p>{label}</p>
          
            onClick={() =>
              onChange({
                start: { toString: () => '2024-01-01' },
                end: { toString: () => '2024-01-31' },
              })
            }
          >
          </button>
          <button type="button" onClick={() => onChange && onChange(null)} aria-label="clear-range">
          </button>
        </div>
      )
    },
  }
})

vi.mock('react-hot-toast', () => {
  return {
    default: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }
})

vi.mock('date-fns', () => {
  return {
    format: (date: Date, fmt: string) => '2024-02-01',
    subMonths: (date: Date, n: number) => date,
  }
})

vi.mock('@internationalized/date', () => {
  return {
    parseDate: (s: string) => ({ toString: () => s }),
  }
})

vi.mock('react-icons/pi', () => {
  return {
    PiDownloadSimpleFill: () => null,
  }
})

vi.mock('@/config/constants/main', () => {
  return {
    DEFAULT_ICON_SIZE: 16,
  }
})

vi.mock('@/app/lib/export-utils', () => {
  return {
    generateCSV: vi.fn(() => 'csv-content'),
    generateJSON: vi.fn(() => 'json-content'),
    getExportFilename: vi.fn((fmt: 'csv' | 'json') => (fmt === 'csv' ? 'export.csv' : 'export.json')),
    getMimeType: vi.fn((fmt: 'csv' | 'json') => (fmt === 'csv' ? 'text/csv' : 'application/json')),
    downloadFile: vi.fn(),
  }
})

import toast from 'react-hot-toast'
import {
  generateCSV,
  generateJSON,
  downloadFile,
  getExportFilename,
  getMimeType,
} from '@/app/lib/export-utils'

describe('ExportTransactions', () => {
  const transactions = [{ id: '1' }, { id: '2' }] as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders heading and default status', async () => {
    const onExport = vi.fn(async () => transactions)
    render(<ExportTransactions transactions={transactions} onExport={onExport} />)
    expect(screen.getByText('Export Transactions')).toBeInTheDocument()
    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
  })

  test('exports CSV by default using provided transactions', async () => {
    const onExport = vi.fn(async () => transactions)
    render(<ExportTransactions transactions={transactions} onExport={onExport} />)

    await userEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(generateCSV).toHaveBeenCalledWith(transactions)
    expect(generateJSON).not.toHaveBeenCalled()
    expect(getExportFilename).toHaveBeenCalledWith('csv')
    expect(getMimeType).toHaveBeenCalledWith('csv')
    expect(downloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv')
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions')
  })

  test('exports JSON when selected', async () => {
    const onExport = vi.fn(async () => transactions)
    render(<ExportTransactions transactions={transactions} onExport={onExport} />)

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'json' } })

    await userEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(generateJSON).toHaveBeenCalledWith(transactions)
    expect(generateCSV).not.toHaveBeenCalled()
    expect(getExportFilename).toHaveBeenCalledWith('json')
    expect(getMimeType).toHaveBeenCalledWith('json')
    expect(downloadFile).toHaveBeenCalledWith('json-content', 'export.json', 'application/json')
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions')
  })

  test('sets date range and calls onExport with start and end of day, uses returned transactions', async () => {
    const returned = [{ id: '99' }] as any
    const onExport = vi.fn(async (start?: Date, end?: Date) => {
      return returned
    })
    render(<ExportTransactions transactions={transactions} onExport={onExport} />)

    await userEvent.click(screen.getByRole('button', { name: 'set-range' }))

    expect(screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(onExport).toHaveBeenCalledTimes(1)
    const [startArg, endArg] = onExport.mock.calls[0]
    expect(startArg).toBeInstanceOf(Date)
    expect(endArg).toBeInstanceOf(Date)
    if (endArg instanceof Date) {
      expect(endArg.getHours()).toBe(23)
      expect(endArg.getMinutes()).toBe(59)
      expect(endArg.getSeconds()).toBe(59)
      expect(endArg.getMilliseconds()).toBe(999)
    }
    expect(generateCSV).toHaveBeenCalledWith(returned)
    expect(downloadFile).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction')
  })

  test('shows error toast when no transactions to export (no range)', async () => {
    const onExport = vi.fn(async () => [])
    render(<ExportTransactions transactions={[]} onExport={onExport} />)

    await userEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(toast.error).toHaveBeenCalledWith('No transactions to export')
    expect(downloadFile).not.toHaveBeenCalled()
  })

  test('shows error toast when no transactions returned for selected range', async () => {
    const onExport = vi.fn(async () => [])
    render(<ExportTransactions transactions={transactions} onExport={onExport} />)

    await userEvent.click(screen.getByRole('button', { name: 'set-range' }))
    await userEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(onExport).toHaveBeenCalledTimes(1)
    expect(toast.error).toHaveBeenCalledWith('No transactions to export')
    expect(downloadFile).not.toHaveBeenCalled()
  })

  test('handles export error and resets loading state', async () => {
    const onExport = vi.fn(async () => transactions)
    ;(downloadFile as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error('boom')
    })
    render(<ExportTransactions transactions={transactions} onExport={onExport} />)

    await userEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(toast.error).toHaveBeenCalledWith('Failed to export transactions')
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
  })
})
