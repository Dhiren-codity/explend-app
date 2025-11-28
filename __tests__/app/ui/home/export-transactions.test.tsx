import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import React from 'react'

vi.mock('@heroui/react', () => {
  const React = require('react')
  const Button = ({ children, onPress, isLoading, ...rest }: any) => (
    <button onClick={onPress} disabled={!!isLoading} {...rest}>
      {children}
    </button>
  )
  const Card = ({ children, ...rest }: any) => <div {...rest}>{children}</div>
  const CardBody = ({ children, ...rest }: any) => <div {...rest}>{children}</div>
  const CardHeader = ({ children, ...rest }: any) => <div {...rest}>{children}</div>
  const Select = ({ label, selectedKeys, onChange, children, ...rest }: any) => {
    const options = React.Children.toArray(children) as any[]
    const value = selectedKeys?.[0] ?? ''
    return (
      <label>
        {label}
        <select aria-label={label} value={value} onChange={onChange} {...rest}>
          {options.map((child: any) => {
            const val = child?.props?.value ?? child?.key
            return (
              <option key={val} value={val}>
                {child?.props?.children}
              </option>
            )
          })}
        </select>
      </label>
    )
  }
  const SelectItem = ({ children, ...rest }: any) => <option {...rest}>{children}</option>
  const DateRangePicker = ({ label, onChange, ...rest }: any) => (
    <div {...rest}>
      <span>{label}</span>
      <button type="button" aria-label="Set range Jan 2024" onClick={() => onChange?.({
        start: { toString: () => '2024-01-01' },
        end: { toString: () => '2024-01-31' },
      })}>
        Set Range Jan
      </button>
      <button type="button" aria-label="Clear range" onClick={() => onChange?.(null)}>
        Clear Range
      </button>
    </div>
  )
  return {
    Button,
    Card,
    CardBody,
    CardHeader,
    DateRangePicker,
    Select,
    SelectItem,
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

vi.mock('@/app/lib/export-utils', () => {
  return {
    generateCSV: vi.fn(() => 'MOCK_CSV'),
    generateJSON: vi.fn(() => 'MOCK_JSON'),
    getExportFilename: vi.fn((fmt: 'csv' | 'json') => (fmt === 'csv' ? 'transactions.csv' : 'transactions.json')),
    getMimeType: vi.fn((fmt: 'csv' | 'json') => (fmt === 'csv' ? 'text/csv' : 'application/json')),
    downloadFile: vi.fn(),
  }
})

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 16,
}))

import ExportTransactions from '../../../../app/ui/home/export-transactions'
import toast from 'react-hot-toast'
import {
  generateCSV,
  generateJSON,
  getExportFilename,
  getMimeType,
  downloadFile,
} from '@/app/lib/export-utils'

describe('ExportTransactions', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  const sampleTx = (overrides?: any) => ({
    id: 't1',
    date: '2024-01-15T10:00:00Z',
    amount: 100,
    description: 'Test',
    ...overrides,
  })

  it('renders heading, controls, and default status text', () => {
    render(
      <ExportTransactions
        transactions={[sampleTx(), sampleTx({ id: 't2' })] as any}
        onExport={vi.fn()}
      />,
    )

    expect(screen.getByText('Export Transactions')).toBeInTheDocument()
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument()
    expect(screen.getByText('Date Range (Optional)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    expect(
      screen.getByText('Ready to export all 2 transactions'),
    ).toBeInTheDocument()
  })

  it('exports CSV by default using provided transactions and shows success toast', async () => {
    const onExport = vi.fn()
    vi.mocked(generateCSV).mockReturnValue('csv-content')
    vi.mocked(getExportFilename).mockReturnValue('export.csv')
    vi.mocked(getMimeType).mockReturnValue('text/csv')

    const transactions = [sampleTx(), sampleTx({ id: 't2' })] as any

    render(<ExportTransactions transactions={transactions} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(downloadFile).toHaveBeenCalledTimes(1)
    })

    expect(onExport).not.toHaveBeenCalled()
    expect(generateCSV).toHaveBeenCalledWith(transactions)
    expect(getExportFilename).toHaveBeenCalledWith('csv')
    expect(getMimeType).toHaveBeenCalledWith('csv')
    expect(downloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv')
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled()
    })
  })

  it('calls onExport with selected date range and adjusts end date to end-of-day', async () => {
    const filtered = [sampleTx({ id: 'fx1' })] as any
    const onExport = vi.fn().mockResolvedValue(filtered)
    vi.mocked(generateCSV).mockReturnValue('csv-with-filter')
    vi.mocked(getExportFilename).mockReturnValue('filtered.csv')
    vi.mocked(getMimeType).mockReturnValue('text/csv')

    render(<ExportTransactions transactions={[sampleTx()] as any} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Set range Jan 2024' }))

    expect(
      screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
    })

    const [startArg, endArg] = onExport.mock.calls[0] as [Date, Date]
    expect(startArg).toBeInstanceOf(Date)
    expect(endArg).toBeInstanceOf(Date)
    // Start should be start of day by default Date ctor; we only need to ensure date matches
    expect(startArg.toISOString().slice(0, 10)).toBe('2024-01-01')
    // End should be adjusted to end of the day local time
    expect(endArg.getHours()).toBe(23)
    expect(endArg.getMinutes()).toBe(59)
    expect(endArg.getSeconds()).toBe(59)
    expect(endArg.getMilliseconds()).toBe(999)

    expect(generateCSV).toHaveBeenCalledWith(filtered)
    expect(downloadFile).toHaveBeenCalledWith('csv-with-filter', 'filtered.csv', 'text/csv')
    expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction')
  })

  it('switches to JSON format and uses JSON-related utils', async () => {
    const onExport = vi.fn()
    const transactions = [sampleTx()] as any
    vi.mocked(generateJSON).mockReturnValue('json-content')
    vi.mocked(getExportFilename).mockReturnValue('export.json')
    vi.mocked(getMimeType).mockReturnValue('application/json')

    render(<ExportTransactions transactions={transactions} onExport={onExport} />)

    fireEvent.change(screen.getByLabelText('Export Format'), { target: { value: 'json' } })
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(downloadFile).toHaveBeenCalledTimes(1)
    })

    expect(onExport).not.toHaveBeenCalled()
    expect(generateCSV).not.toHaveBeenCalled()
    expect(generateJSON).toHaveBeenCalledWith(transactions)
    expect(getExportFilename).toHaveBeenCalledWith('json')
    expect(getMimeType).toHaveBeenCalledWith('json')
    expect(downloadFile).toHaveBeenCalledWith('json-content', 'export.json', 'application/json')
    expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction')
  })

  it('shows error toast when there are no transactions to export', async () => {
    const onExport = vi.fn()

    render(<ExportTransactions transactions={[]} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export')
    })
    expect(downloadFile).not.toHaveBeenCalled()
    expect(onExport).not.toHaveBeenCalled()
  })

  it('handles unexpected errors and shows failure toast', async () => {
    const onExport = vi.fn()
    vi.mocked(generateCSV).mockImplementation(() => {
      throw new Error('boom')
    })
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<ExportTransactions transactions={[sampleTx()] as any} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions')
    })
    expect(downloadFile).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })
})
