import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { useState } from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import toast from 'react-hot-toast'

// Mock date-fns per requirement
vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024-01-01'),
  subMonths: vi.fn(() => new Date('2023-12-01T00:00:00.000Z')),
}))

// Mock export utils
const generateCSV = vi.fn(() => 'csv-content')
const generateJSON = vi.fn(() => 'json-content')
const getExportFilename = vi.fn((fmt: string) => (fmt === 'csv' ? 'export.csv' : 'export.json'))
const getMimeType = vi.fn((fmt: string) => (fmt === 'csv' ? 'text/csv' : 'application/json'))
const downloadFile = vi.fn()

vi.mock('@/app/lib/export-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/lib/export-utils')>()
  return {
    ...actual,
    generateCSV,
    generateJSON,
    getExportFilename,
    getMimeType,
    downloadFile,
  }
})

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock @heroui/react controls to simple HTML equivalents
vi.mock('@heroui/react', async (importOriginal) => {
  const actual = await importOriginal<any>()
  const MockButton = ({ children, onPress, isLoading, ...rest }: any) => (
    <button onClick={onPress} aria-busy={isLoading ? 'true' : 'false'} {...rest}>
      {children}
    </button>
  )
  const MockCard = ({ children, ...rest }: any) => <div {...rest}>{children}</div>
  const MockCardHeader = ({ children, ...rest }: any) => <div {...rest}>{children}</div>
  const MockCardBody = ({ children, ...rest }: any) => <div {...rest}>{children}</div>

  const MockSelect = ({ label, selectedKeys, onChange, children, ...rest }: any) => (
    <label>
      {label}
      <select aria-label={label} value={selectedKeys?.[0] ?? ''} onChange={onChange} {...rest}>
        {children}
      </select>
    </label>
  )
  const MockSelectItem = (props: any) => {
    // Accepts key and value props; use value if provided, otherwise key
    const value = props.value ?? props.key
    return <option value={value}>{props.children}</option>
  }

  const MockDateRangePicker = ({ label, onChange, defaultValue, ...rest }: any) => {
    const [start, setStart] = useState(
      defaultValue?.start ? String(defaultValue.start) : '2024-01-01'
    )
    const [end, setEnd] = useState(defaultValue?.end ? String(defaultValue.end) : '2024-01-31')

    return (
      <div {...rest}>
        <div>{label}</div>
        <label>
          Start
          <input
            aria-label={`${label} start`}
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label>
          End
          <input
            aria-label={`${label} end`}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={() =>
            onChange?.({
              start: { toString: () => start },
              end: { toString: () => end },
            })
          }
        >
          Apply Range
        </button>
        <button type="button" onClick={() => onChange?.(null)}>
          Clear Range
        </button>
      </div>
    )
  }

  return {
    ...actual,
    Button: MockButton,
    Card: MockCard,
    CardHeader: MockCardHeader,
    CardBody: MockCardBody,
    Select: MockSelect,
    SelectItem: MockSelectItem,
    DateRangePicker: MockDateRangePicker,
  }
})

import ExportTransactions from '@/app/ui/home/export-transactions'

describe('ExportTransactions component', () => {
  const sampleTxs = [{ id: '1' }, { id: '2' }] as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders heading and initial info with pluralization', () => {
    render(<ExportTransactions transactions={sampleTxs} onExport={vi.fn()} />)

    expect(screen.getByText('Export Transactions')).toBeInTheDocument()
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
    expect(
      screen.getByText('Ready to export all 2 transactions')
    ).toBeInTheDocument()
  })

  it('renders initial info with singular', () => {
    render(<ExportTransactions transactions={[{ id: '1' } as any]} onExport={vi.fn()} />)

    expect(
      screen.getByText('Ready to export all 1 transaction')
    ).toBeInTheDocument()
  })

  it('exports all transactions as CSV by default', async () => {
    const onExport = vi.fn()
    render(<ExportTransactions transactions={sampleTxs} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(generateCSV).toHaveBeenCalledTimes(1)
    })

    expect(onExport).not.toHaveBeenCalled()
    expect(generateCSV).toHaveBeenCalledWith(sampleTxs)
    expect(generateJSON).not.toHaveBeenCalled()
    expect(downloadFile).toHaveBeenCalledWith(
      'csv-content',
      'export.csv',
      'text/csv'
    )
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions')
  })

  it('shows error toast when no transactions to export', async () => {
    const onExport = vi.fn()
    render(<ExportTransactions transactions={[]} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export')
    })
    expect(downloadFile).not.toHaveBeenCalled()
    expect(onExport).not.toHaveBeenCalled()
  })

  it('allows selecting JSON format and exporting with a date range (calls onExport with end-of-day)', async () => {
    const onExport = vi.fn().mockResolvedValue([{ id: '3' }] as any)

    render(<ExportTransactions transactions={sampleTxs} onExport={onExport} />)

    // Switch format to JSON
    const select = screen.getByLabelText('Export Format') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'json' } })
    expect(select.value).toBe('json')

    // Set date range
    fireEvent.change(screen.getByLabelText('Date Range (Optional) start'), {
      target: { value: '2024-05-10' },
    })
    fireEvent.change(screen.getByLabelText('Date Range (Optional) end'), {
      target: { value: '2024-05-15' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply Range' }))

    // Confirm info text updates
    expect(
      screen.getByText('Exporting transactions from 2024-05-10 to 2024-05-15')
    ).toBeInTheDocument()

    // Export
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
    })

    // Verify onExport args
    const [startArg, endArg] = onExport.mock.calls[0]
    expect(startArg).toBeInstanceOf(Date)
    expect(endArg).toBeInstanceOf(Date)
    expect((startArg as Date).getFullYear()).toBe(2024)
    expect((startArg as Date).getMonth()).toBe(4) // May (0-indexed)
    expect((startArg as Date).getDate()).toBe(10)

    // end date should be set to end-of-day
    const end = endArg as Date
    expect(end.getFullYear()).toBe(2024)
    expect(end.getMonth()).toBe(4)
    expect(end.getDate()).toBe(15)
    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
    expect(end.getSeconds()).toBe(59)
    expect(end.getMilliseconds()).toBe(999)

    // Should generate JSON and download
    await waitFor(() => {
      expect(generateJSON).toHaveBeenCalledWith([{ id: '3' }])
    })
    expect(downloadFile).toHaveBeenCalledWith(
      'json-content',
      'export.json',
      'application/json'
    )
    expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction')
  })

  it('shows error when onExport returns empty array for date range', async () => {
    const onExport = vi.fn().mockResolvedValue([])

    render(<ExportTransactions transactions={sampleTxs} onExport={onExport} />)

    // Apply a date range
    fireEvent.click(screen.getByRole('button', { name: 'Apply Range' }))

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export')
    })
    expect(downloadFile).not.toHaveBeenCalled()
  })

  it('handles unexpected error and shows failure toast', async () => {
    const onExport = vi.fn()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    // Make CSV generator throw
    generateCSV.mockImplementationOnce(() => {
      throw new Error('boom')
    })

    render(<ExportTransactions transactions={sampleTxs} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions')
    })
    expect(downloadFile).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})
