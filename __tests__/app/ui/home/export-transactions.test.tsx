import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fireEvent, waitFor, cleanup } from '@testing-library/react'
import React from 'react'
import ExportTransactions from '../../../../app/ui/home/export-transactions'

vi.mock('@heroui/react', () => {
  const React = require('react')
  const Button = ({ children, onPress, isLoading, ...props }: any) => (
    <button onClick={onPress} aria-busy={!!isLoading} {...props}>
      {children}
    </button>
  )
  const Card = ({ children }: any) => <div data-testid="card">{children}</div>
  const CardBody = ({ children, className }: any) => (
    <div data-testid="card-body" className={className}>
      {children}
    </div>
  )
  const CardHeader = ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  )

  const Select = ({ label, selectedKeys, onChange, children, className }: any) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={selectedKeys?.[0]}
        onChange={onChange}
        className={className}
      >
        {children}
      </select>
    </label>
  )
  const SelectItem = ({ children, value, key: k }: any) => (
    <option value={value ?? k}>{children}</option>
  )

  const DateRangePicker = ({ label, onChange, className }: any) => (
    <label>
      {label}
      <input
        aria-label={label}
        className={className}
        placeholder="start|end"
        onChange={(e: any) => {
          const val = e.target.value
          if (!val) {
            onChange?.(null)
            return
          }
          const [start, end] = val.split('|')
          onChange?.({
            start: { toString: () => start },
            end: { toString: () => end },
          })
        }}
      />
    </label>
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

const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
vi.mock('react-hot-toast', () => {
  const toast = {
    success: mockToastSuccess,
    error: mockToastError,
  }
  return { default: toast }
})

const mockGenerateCSV = vi.fn(() => 'csv-content')
const mockGenerateJSON = vi.fn(() => 'json-content')
const mockDownloadFile = vi.fn()
const mockGetExportFilename = vi.fn((f: string) => (f === 'csv' ? 'export.csv' : 'export.json'))
const mockGetMimeType = vi.fn((f: string) => (f === 'csv' ? 'text/csv' : 'application/json'))

vi.mock('@/app/lib/export-utils', () => {
  return {
    generateCSV: mockGenerateCSV,
    generateJSON: mockGenerateJSON,
    downloadFile: mockDownloadFile,
    getExportFilename: mockGetExportFilename,
    getMimeType: mockGetMimeType,
  }
})

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 16,
}))

type Tx = {
  id: string
  date?: string
  amount?: number
  [key: string]: any
}

describe('ExportTransactions', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  const sampleTransactions: Tx[] = [
    { id: '1', date: '2024-01-01T00:00:00.000Z', amount: 10 },
    { id: '2', date: '2024-01-02T00:00:00.000Z', amount: 20 },
  ]

  const renderComponent = (props?: Partial<React.ComponentProps<typeof ExportTransactions>>) => {
    const defaultOnExport = vi.fn().mockResolvedValue(sampleTransactions)
    return render(
      <ExportTransactions
        transactions={sampleTransactions}
        onExport={defaultOnExport}
        {...props}
      />
    )
  }

  it('renders heading, controls, and default status text', () => {
    renderComponent()

    expect(screen.getByText('Export Transactions')).toBeInTheDocument()
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument()
    expect(screen.getByLabelText('Date Range (Optional)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    expect(
      screen.getByText('Ready to export all 2 transactions')
    ).toBeInTheDocument()
  })

  it('exports CSV by default without date range using provided transactions', async () => {
    const onExport = vi.fn().mockResolvedValue(sampleTransactions)
    renderComponent({ onExport })

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(mockGenerateCSV).toHaveBeenCalledTimes(1)
    })

    expect(onExport).not.toHaveBeenCalled()
    expect(mockGenerateCSV).toHaveBeenCalledWith(sampleTransactions)
    expect(mockGenerateJSON).not.toHaveBeenCalled()
    expect(mockGetExportFilename).toHaveBeenCalledWith('csv')
    expect(mockGetMimeType).toHaveBeenCalledWith('csv')
    expect(mockDownloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv')
    expect(mockToastSuccess).toHaveBeenCalledWith('Exported 2 transactions')

    // button returns to non-loading state
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
  })

  it('allows selecting JSON format and uses JSON utilities', async () => {
    renderComponent()
    const select = screen.getByLabelText('Export Format') as HTMLSelectElement

    fireEvent.change(select, { target: { value: 'json' } })
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(mockGenerateJSON).toHaveBeenCalledTimes(1)
    })

    expect(mockGenerateCSV).not.toHaveBeenCalled()
    expect(mockGetExportFilename).toHaveBeenCalledWith('json')
    expect(mockGetMimeType).toHaveBeenCalledWith('json')
    expect(mockDownloadFile).toHaveBeenCalledWith('json-content', 'export.json', 'application/json')
    expect(mockToastSuccess).toHaveBeenCalledWith('Exported 2 transactions')
  })

  it('when date range is set, calls onExport with start and end-of-day end date and exports returned data', async () => {
    const returned = [{ id: 'x' }]
    const onExport = vi.fn().mockResolvedValue(returned as any)
    renderComponent({ onExport })

    const rangeInput = screen.getByLabelText('Date Range (Optional)') as HTMLInputElement
    fireEvent.change(rangeInput, { target: { value: '2024-01-01|2024-01-31' } })

    expect(
      screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
    })

    const [startArg, endArg] = onExport.mock.calls[0]
    expect(startArg).toBeInstanceOf(Date)
    expect(endArg).toBeInstanceOf(Date)
    // Verify dates
    const startIso = (startArg as Date).toISOString().slice(0, 10)
    expect(startIso).toBe('2024-01-01')
    const endIso = (endArg as Date).toISOString()
    expect(endIso.startsWith('2024-01-31T23:59:59.')).toBe(true)

    expect(mockGenerateCSV).toHaveBeenCalledWith(returned)
    expect(mockDownloadFile).toHaveBeenCalled()
    expect(mockToastSuccess).toHaveBeenCalledWith('Exported 1 transaction')
  })

  it('shows error when no transactions to export and does not generate/download', async () => {
    const onExport = vi.fn().mockResolvedValue([] as any)
    renderComponent({ onExport })

    const rangeInput = screen.getByLabelText('Date Range (Optional)') as HTMLInputElement
    fireEvent.change(rangeInput, { target: { value: '2024-02-01|2024-02-10' } })

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('No transactions to export')
    })

    expect(mockGenerateCSV).not.toHaveBeenCalled()
    expect(mockGenerateJSON).not.toHaveBeenCalled()
    expect(mockDownloadFile).not.toHaveBeenCalled()
    expect(mockToastSuccess).not.toHaveBeenCalled()
  })

  it('handles error path and shows failure toast', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGenerateCSV.mockImplementationOnce(() => {
      throw new Error('boom')
    })

    renderComponent()

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to export transactions')
    })

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('shows loading state while exporting and reverts after completion', async () => {
    let resolveFn: (v: any) => void = () => {}
    const onExport = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve
        })
    )

    renderComponent({ onExport })

    const rangeInput = screen.getByLabelText('Date Range (Optional)') as HTMLInputElement
    fireEvent.change(rangeInput, { target: { value: '2024-03-01|2024-03-05' } })

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    // While pending
    expect(screen.getByRole('button', { name: 'Exporting...' })).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')

    // Resolve export
    resolveFn([{ id: 'a' }])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    })
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'false')
    expect(mockToastSuccess).toHaveBeenCalledWith('Exported 1 transaction')
  })

  it('shows "No transactions to export" when transactions prop is empty without date range', async () => {
    const onExport = vi.fn().mockResolvedValue([])
    render(
      <ExportTransactions
        transactions={[]}
        onExport={onExport}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('No transactions to export')
    })

    expect(onExport).not.toHaveBeenCalled()
    expect(mockGenerateCSV).not.toHaveBeenCalled()
    expect(mockDownloadFile).not.toHaveBeenCalled()
  })
})
