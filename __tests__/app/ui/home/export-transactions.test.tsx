import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024-01-01'),
  subMonths: vi.fn(() => new Date('2023-12-01')),
}))

const toastSuccess = vi.fn()
const toastError = vi.fn()
vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccess,
    error: toastError,
  },
}))

vi.mock('@heroui/react', () => {
  const Select = ({ label, selectedKeys, onChange, children, className }: any) => {
    const value = Array.isArray(selectedKeys) ? selectedKeys[0] : selectedKeys
    return (
      <label>
        {label}
        <select aria-label={label} value={value} onChange={onChange} data-testid="export-format-select" className={className}>
          {children}
        </select>
      </label>
    )
  }

  const SelectItem = ({ value, children }: any) => {
    return (
      <option value={value} data-testid={`option-${value}`}>
        {children}
      </option>
    )
  }

  const DateRangePicker = ({ label, onChange, className, defaultValue }: any) => {
    const [start, setStart] = React.useState<string>(defaultValue?.start?.toString?.() ?? '')
    const [end, setEnd] = React.useState<string>(defaultValue?.end?.toString?.() ?? '')

    const maybeEmit = (s: string, e: string) => {
      if (s && e) {
        const mk = (v: string) => ({ toString: () => v })
        onChange?.({ start: mk(s), end: mk(e) })
      } else {
        onChange?.(null)
      }
    }

    return (
      <div className={className}>
        <div>{label}</div>
        <input
          type="date"
          aria-label="start-date"
          data-testid="start-date-input"
          value={start}
          onChange={(ev) => {
            const v = (ev.target as HTMLInputElement).value
            setStart(v)
            maybeEmit(v, end)
          }}
        />
        <input
          type="date"
          aria-label="end-date"
          data-testid="end-date-input"
          value={end}
          onChange={(ev) => {
            const v = (ev.target as HTMLInputElement).value
            setEnd(v)
            maybeEmit(start, v)
          }}
        />
      </div>
    )
  }

  const Button = ({ children, onPress, isLoading, className }: any) => {
    return (
      <button onClick={onPress} disabled={isLoading} className={className}>
        {children}
      </button>
    )
  }

  const Card = ({ children }: any) => <div>{children}</div>
  const CardHeader = ({ children }: any) => <div>{children}</div>
  const CardBody = ({ children, className }: any) => <div className={className}>{children}</div>

  return {
    Select,
    SelectItem,
    DateRangePicker,
    Button,
    Card,
    CardBody,
    CardHeader,
  }
})

vi.mock('@/app/lib/export-utils', () => {
  return {
    generateCSV: vi.fn(() => 'csv-content'),
    generateJSON: vi.fn(() => 'json-content'),
    downloadFile: vi.fn(),
    getExportFilename: vi.fn((fmt: string) => `export.${fmt}`),
    getMimeType: vi.fn((fmt: string) => `mime/${fmt}`),
  }
})

import ExportTransactions from '../../../../app/ui/home/export-transactions'
import { generateCSV, generateJSON, downloadFile, getExportFilename, getMimeType } from '@/app/lib/export-utils'
import toast from 'react-hot-toast'

describe('ExportTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  const sampleTransactions = [
    { id: '1', date: '2024-01-01', description: 'A', amount: 100, currency: 'USD' },
    { id: '2', date: '2024-01-02', description: 'B', amount: 200, currency: 'USD' },
  ]

  it('renders basic UI and default message', () => {
    render(<ExportTransactions transactions={sampleTransactions} onExport={vi.fn()} />)

    expect(screen.getByText('Export Transactions')).toBeInTheDocument()
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument()
    expect(screen.getByText('Date Range (Optional)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()

    expect(
      screen.getByText('Ready to export all 2 transactions'),
    ).toBeInTheDocument()
  })

  it('exports CSV without date range using provided transactions', async () => {
    const onExport = vi.fn()
    vi.mocked(generateCSV).mockReturnValueOnce('my-csv')
    vi.mocked(getExportFilename).mockReturnValueOnce('file.csv')
    vi.mocked(getMimeType).mockReturnValueOnce('text/csv')

    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(downloadFile).toHaveBeenCalledTimes(1)
    })

    expect(onExport).not.toHaveBeenCalled()
    expect(generateCSV).toHaveBeenCalledWith(sampleTransactions)
    expect(generateJSON).not.toHaveBeenCalled()
    expect(getExportFilename).toHaveBeenCalledWith('csv')
    expect(getMimeType).toHaveBeenCalledWith('csv')
    expect(downloadFile).toHaveBeenCalledWith('my-csv', 'file.csv', 'text/csv')
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    })
  })

  it('switches format to JSON and exports JSON', async () => {
    const onExport = vi.fn()
    vi.mocked(generateJSON).mockReturnValueOnce('my-json')
    vi.mocked(getExportFilename).mockReturnValueOnce('file.json')
    vi.mocked(getMimeType).mockReturnValueOnce('application/json')

    render(<ExportTransactions transactions={[sampleTransactions[0]]} onExport={onExport} />)

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'json' } })

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(downloadFile).toHaveBeenCalledTimes(1)
    })

    expect(generateCSV).not.toHaveBeenCalled()
    expect(generateJSON).toHaveBeenCalledWith([sampleTransactions[0]])
    expect(getExportFilename).toHaveBeenCalledWith('json')
    expect(getMimeType).toHaveBeenCalledWith('json')
    expect(downloadFile).toHaveBeenCalledWith('my-json', 'file.json', 'application/json')
    expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction')
  })

  it('sets a date range, calls onExport with adjusted end-of-day, and exports returned data', async () => {
    const returned = [{ id: '3', date: '2024-01-15', description: 'C', amount: 300, currency: 'USD' }]
    const onExport = vi.fn().mockResolvedValueOnce(returned)
    vi.mocked(generateCSV).mockReturnValueOnce('csv-with-range')
    vi.mocked(getExportFilename).mockReturnValueOnce('range.csv')
    vi.mocked(getMimeType).mockReturnValueOnce('text/csv')

    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    const startInput = screen.getByTestId('start-date-input') as HTMLInputElement
    const endInput = screen.getByTestId('end-date-input') as HTMLInputElement

    fireEvent.change(startInput, { target: { value: '2024-01-01' } })
    fireEvent.change(endInput, { target: { value: '2024-01-31' } })

    expect(
      screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
    })

    const [startDateArg, endDateArg] = onExport.mock.calls[0]
    expect(startDateArg).toBeInstanceOf(Date)
    expect(endDateArg).toBeInstanceOf(Date)

    // Start date should reflect 2024-01-01 (date check to avoid TZ issues on time)
    expect(startDateArg.getFullYear()).toBe(2024)
    expect(startDateArg.getMonth()).toBe(0) // Jan
    expect(startDateArg.getDate()).toBe(1)

    // End date should be adjusted to 23:59:59.999 local time
    expect(endDateArg.getHours()).toBe(23)
    expect(endDateArg.getMinutes()).toBe(59)
    expect(endDateArg.getSeconds()).toBe(59)
    expect(endDateArg.getMilliseconds()).toBe(999)

    await waitFor(() => {
      expect(downloadFile).toHaveBeenCalledTimes(1)
    })

    expect(generateCSV).toHaveBeenCalledWith(returned)
    expect(downloadFile).toHaveBeenCalledWith('csv-with-range', 'range.csv', 'text/csv')
    expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction')
  })

  it('shows error toast and does not download when onExport returns empty array for date range', async () => {
    const onExport = vi.fn().mockResolvedValueOnce([])
    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    const startInput = screen.getByTestId('start-date-input') as HTMLInputElement
    const endInput = screen.getByTestId('end-date-input') as HTMLInputElement

    fireEvent.change(startInput, { target: { value: '2024-02-01' } })
    fireEvent.change(endInput, { target: { value: '2024-02-10' } })

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
    })

    expect(toast.error).toHaveBeenCalledWith('No transactions to export')
    expect(downloadFile).not.toHaveBeenCalled()
    expect(generateCSV).not.toHaveBeenCalled()
    expect(generateJSON).not.toHaveBeenCalled()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    })
  })

  it('handles errors during export and shows failure toast', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onExport = vi.fn()
    vi.mocked(generateCSV).mockImplementationOnce(() => {
      throw new Error('boom')
    })

    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions')
    })

    expect(downloadFile).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})
