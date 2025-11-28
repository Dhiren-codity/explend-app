import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

// Mock toast
const toastSuccess = vi.fn()
const toastError = vi.fn()
vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccess,
    error: toastError,
  },
}))

// Mocks for export-utils
const generateCSVMock = vi.fn().mockReturnValue('csv-content')
const generateJSONMock = vi.fn().mockReturnValue('json-content')
const downloadFileMock = vi.fn()
const getExportFilenameMock = vi.fn().mockImplementation((fmt: string) => (fmt === 'csv' ? 'export.csv' : 'export.json'))
const getMimeTypeMock = vi.fn().mockImplementation((fmt: string) => (fmt === 'csv' ? 'text/csv' : 'application/json'))

vi.mock('@/app/lib/export-utils', () => ({
  generateCSV: generateCSVMock,
  generateJSON: generateJSONMock,
  downloadFile: downloadFileMock,
  getExportFilename: getExportFilenameMock,
  getMimeType: getMimeTypeMock,
}))

// Mock @heroui/react to simple primitives for deterministic testing
vi.mock('@heroui/react', () => {
  const React = require('react')
  return {
    Button: ({ children, onPress, isLoading, ...props }: any) => (
      <button type="button" onClick={onPress} aria-busy={isLoading} {...props}>
        {children}
      </button>
    ),
    Select: ({ label, onChange, children, ...props }: any) => (
      <label>
        {label}
        <select onChange={onChange} {...props}>
          {children}
        </select>
      </label>
    ),
    SelectItem: ({ children, value, ...props }: any) => (
      <option value={value} {...props}>
        {children}
      </option>
    ),
    DateRangePicker: ({ label, onChange }: any) => (
      <div>
        <span>{label}</span>
        <button type="button" aria-label="set-date-range" onClick={() => onChange?.({
          start: { toString: () => '2023-01-01' },
          end: { toString: () => '2023-01-31' },
        })}>
          Set Date Range
        </button>
        <button type="button" aria-label="clear-date-range" onClick={() => onChange?.(null)}>
          Clear Date Range
        </button>
      </div>
    ),
    Card: ({ children }: any) => <div>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardBody: ({ children }: any) => <div>{children}</div>,
  }
})

// Import component under test AFTER mocks
import ExportTransactions from '../../../../app/ui/home/export-transactions'

// Helpers
function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: any) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('ExportTransactions', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders essential UI and initial message', () => {
    const onExport = vi.fn()
    render(<ExportTransactions transactions={[]} onExport={onExport} />)

    expect(screen.getByText('Export Transactions')).toBeInTheDocument()
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument()
    expect(screen.getByText('Date Range (Optional)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByText('Ready to export all 0 transactions')).toBeInTheDocument()
  })

  it('shows toast error when no transactions to export', async () => {
    const onExport = vi.fn()
    render(<ExportTransactions transactions={[]} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(onExport).not.toHaveBeenCalled()
    expect(generateCSVMock).not.toHaveBeenCalled()
    expect(generateJSONMock).not.toHaveBeenCalled()
    expect(downloadFileMock).not.toHaveBeenCalled()
    expect(toastError).toHaveBeenCalledWith('No transactions to export')
  })

  it('exports CSV by default using provided transactions', async () => {
    const onExport = vi.fn()
    const txs = [{ id: 1, amount: 100 }] as any
    render(<ExportTransactions transactions={txs} onExport={onExport} />)

    // Initial message
    expect(screen.getByText('Ready to export all 1 transaction')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(onExport).not.toHaveBeenCalled()
    expect(generateCSVMock).toHaveBeenCalledTimes(1)
    expect(generateCSVMock).toHaveBeenCalledWith(txs)
    expect(generateJSONMock).not.toHaveBeenCalled()

    expect(getExportFilenameMock).toHaveBeenCalledWith('csv')
    expect(getMimeTypeMock).toHaveBeenCalledWith('csv')
    expect(downloadFileMock).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv')
    expect(toastSuccess).toHaveBeenCalledWith('Exported 1 transaction')
  })

  it('allows switching export format to JSON', async () => {
    const onExport = vi.fn()
    const txs = [{ id: 1 }, { id: 2 }] as any
    render(<ExportTransactions transactions={txs} onExport={onExport} />)

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'json' } })

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(onExport).not.toHaveBeenCalled()
    expect(generateCSVMock).not.toHaveBeenCalled()
    expect(generateJSONMock).toHaveBeenCalledTimes(1)
    expect(generateJSONMock).toHaveBeenCalledWith(txs)

    expect(getExportFilenameMock).toHaveBeenCalledWith('json')
    expect(getMimeTypeMock).toHaveBeenCalledWith('json')
    expect(downloadFileMock).toHaveBeenCalledWith('json-content', 'export.json', 'application/json')
    expect(toastSuccess).toHaveBeenCalledWith('Exported 2 transactions')
  })

  it('handles date range: calls onExport with correct dates, shows loading, then downloads', async () => {
    const deferred = createDeferred<any[]>()
    const onExport = vi.fn().mockReturnValue(deferred.promise)
    const initialTxs = [{ id: 9 }] as any
    render(<ExportTransactions transactions={initialTxs} onExport={onExport} />)

    // Set a date range via mocked DateRangePicker
    fireEvent.click(screen.getByRole('button', { name: 'Set Date Range' }))

    // Message reflects date range
    expect(screen.getByText('Exporting transactions from 2023-01-01 to 2023-01-31')).toBeInTheDocument()

    // Start export
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    // onExport called with start/end dates; end should be end-of-day
    expect(onExport).toHaveBeenCalledTimes(1)
    const [startDate, endDate] = onExport.mock.calls[0]

    expect(startDate).toBeInstanceOf(Date)
    expect(endDate).toBeInstanceOf(Date)
    // Check yyyy-mm-dd without time
    expect(startDate.getFullYear()).toBe(2023)
    expect(startDate.getMonth()).toBe(0) // January is 0
    expect(startDate.getDate()).toBe(1)
    // End date time adjusted to 23:59:59.999
    expect(endDate.getFullYear()).toBe(2023)
    expect(endDate.getMonth()).toBe(0)
    expect(endDate.getDate()).toBe(31)
    expect(endDate.getHours()).toBe(23)
    expect(endDate.getMinutes()).toBe(59)
    expect(endDate.getSeconds()).toBe(59)
    expect(endDate.getMilliseconds()).toBe(999)

    // While pending, button shows loading label
    expect(screen.getByRole('button', { name: 'Exporting...' })).toBeInTheDocument()

    // Resolve with a filtered set of transactions (e.g., 3)
    const returnedTxs = [{ id: 1 }, { id: 2 }, { id: 3 }] as any
    deferred.resolve(returnedTxs)

    await waitFor(() => {
      expect(generateCSVMock).toHaveBeenCalledWith(returnedTxs)
    })

    expect(downloadFileMock).toHaveBeenCalled()
    expect(toastSuccess).toHaveBeenCalledWith('Exported 3 transactions')

    // Loading finished
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    })
  })

  it('shows failure toast if generation fails', async () => {
    const onExport = vi.fn()
    const txs = [{ id: 1 }] as any
    generateCSVMock.mockImplementationOnce(() => {
      throw new Error('boom')
    })

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<ExportTransactions transactions={txs} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(toastError).toHaveBeenCalledWith('Failed to export transactions')
    expect(downloadFileMock).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })
})
