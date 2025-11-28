import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// Mocks
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))
vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 16,
}))
const mockDownloadFile = vi.fn()
const mockGenerateCSV = vi.fn().mockReturnValue('csv-content')
const mockGenerateJSON = vi.fn().mockReturnValue('json-content')
const mockGetExportFilename = vi.fn((format: string) => `export.${format}`)
const mockGetMimeType = vi.fn((format: string) =>
  format === 'csv' ? 'text/csv' : 'application/json',
)
vi.mock('@/app/lib/export-utils', () => ({
  downloadFile: mockDownloadFile,
  generateCSV: mockGenerateCSV,
  generateJSON: mockGenerateJSON,
  getExportFilename: mockGetExportFilename,
  getMimeType: mockGetMimeType,
}))
// Minimal stubs for @heroui/react components
vi.mock('@heroui/react', () => {
  const React = require('react')
  return {
    Button: ({ onPress, isLoading, children, ...rest }: any) => (
      <button type="button" onClick={onPress} aria-label="Export" {...rest}>
        {children}
      </button>
    ),
    Select: ({ label, selectedKeys, onChange, children, className }: any) => (
      <label>
        {label}
        <select
          data-testid="format-select"
          aria-label={label}
          value={selectedKeys?.[0]}
          onChange={onChange}
          className={className}
        >
          {children}
        </select>
      </label>
    ),
    SelectItem: ({ value, children }: any) => (
      <option value={value}>{children}</option>
    ),
    Card: ({ children }: any) => <div data-testid="card">{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardBody: ({ children }: any) => <div>{children}</div>,
    DateRangePicker: ({ label, onChange, className }: any) => {
      // Emits a fixed range on click; consumers can click to set range in tests
      const value = {
        start: { toString: () => '2023-01-01' },
        end: { toString: () => '2023-01-31' },
      }
      return (
        <div className={className}>
          <button
            type="button"
            aria-label={label}
            onClick={() => onChange?.(value)}
          >
            {label}
          </button>
        </div>
      )
    },
  }
})

import ExportTransactions from '../../../../app/ui/home/export-transactions'
import toast from 'react-hot-toast'

describe('ExportTransactions', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  const sampleTransactions = [
    { id: 't1', date: '2023-02-01', amount: 100 } as any,
    { id: 't2', date: '2023-02-02', amount: 200 } as any,
  ]

  it('renders heading and default status message with pluralization', () => {
    render(
      <ExportTransactions
        transactions={sampleTransactions}
        onExport={vi.fn().mockResolvedValue(sampleTransactions)}
      />,
    )

    expect(
      screen.getByText('Export Transactions'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Ready to export all 2 transactions'),
    ).toBeInTheDocument()

    // Default format is csv
    const select = screen.getByTestId('format-select') as HTMLSelectElement
    expect(select.value).toBe('csv')
  })

  it('exports all transactions as CSV by default', async () => {
    render(
      <ExportTransactions
        transactions={sampleTransactions}
        onExport={vi.fn().mockResolvedValue(sampleTransactions)}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(mockGenerateCSV).toHaveBeenCalledWith(sampleTransactions)
    expect(mockGetExportFilename).toHaveBeenCalledWith('csv')
    expect(mockGetMimeType).toHaveBeenCalledWith('csv')

    expect(mockDownloadFile).toHaveBeenCalledWith(
      'csv-content',
      'export.csv',
      'text/csv',
    )

    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions')
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('switches to JSON format and exports correctly', async () => {
    render(
      <ExportTransactions
        transactions={sampleTransactions}
        onExport={vi.fn().mockResolvedValue(sampleTransactions)}
      />,
    )

    const select = screen.getByTestId('format-select') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'json' } })

    expect(select.value).toBe('json')

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(mockGenerateJSON).toHaveBeenCalledWith(sampleTransactions)
    expect(mockGenerateCSV).not.toHaveBeenCalled()
    expect(mockGetExportFilename).toHaveBeenCalledWith('json')
    expect(mockGetMimeType).toHaveBeenCalledWith('json')
    expect(mockDownloadFile).toHaveBeenCalledWith(
      'json-content',
      'export.json',
      'application/json',
    )
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions')
  })

  it('uses date range and calls onExport with normalized end-of-day, then exports returned data', async () => {
    const returned = [{ id: 'only', date: '2023-01-15', amount: 1 } as any]
    const onExport = vi.fn().mockResolvedValue(returned)

    render(
      <ExportTransactions
        transactions={sampleTransactions}
        onExport={onExport}
      />,
    )

    // Set a date range via stubbed DateRangePicker
    fireEvent.click(
      screen.getByRole('button', { name: 'Date Range (Optional)' }),
    )

    expect(
      screen.getByText(
        'Exporting transactions from 2023-01-01 to 2023-01-31',
      ),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => expect(onExport).toHaveBeenCalledTimes(1))
    const [startDate, endDate] = onExport.mock.calls[0] as unknown as [
      Date,
      Date,
    ]

    // Start date correctness
    expect(startDate.getFullYear()).toBe(2023)
    expect(startDate.getMonth()).toBe(0) // January is 0
    expect(startDate.getDate()).toBe(1)

    // End date normalized to end of day
    expect(endDate.getFullYear()).toBe(2023)
    expect(endDate.getMonth()).toBe(0)
    expect(endDate.getDate()).toBe(31)
    expect(endDate.getHours()).toBe(23)
    expect(endDate.getMinutes()).toBe(59)
    expect(endDate.getSeconds()).toBe(59)
    expect(endDate.getMilliseconds()).toBe(999)

    expect(mockGenerateCSV).toHaveBeenCalledWith(returned)
    expect(mockDownloadFile).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction')
  })

  it('shows error toast and does not download when onExport returns empty array', async () => {
    const onExport = vi.fn().mockResolvedValue([])

    render(
      <ExportTransactions transactions={sampleTransactions} onExport={onExport} />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Date Range (Optional)' }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('No transactions to export'),
    )

    expect(mockDownloadFile).not.toHaveBeenCalled()
    expect(mockGenerateCSV).not.toHaveBeenCalled()
    expect(mockGenerateJSON).not.toHaveBeenCalled()
  })

  it('handles unexpected errors by showing failure toast', async () => {
    mockGenerateCSV.mockImplementationOnce(() => {
      throw new Error('boom')
    })

    render(
      <ExportTransactions
        transactions={sampleTransactions}
        onExport={vi.fn().mockResolvedValue(sampleTransactions)}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions'),
    )
  })

  it('shows loading state while awaiting onExport and reverts after completion', async () => {
    let resolveFn: (rows: any[]) => void
    const onExport = vi
      .fn()
      .mockImplementation(
        () =>
          new Promise<any[]>((resolve) => {
            resolveFn = resolve
          }),
      )

    render(
      <ExportTransactions transactions={sampleTransactions} onExport={onExport} />,
    )

    // Select a date range to trigger async path
    fireEvent.click(
      screen.getByRole('button', { name: 'Date Range (Optional)' }),
    )

    // Click export -> loading should appear
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    // Button shows 'Exporting...'
    expect(screen.getByText('Exporting...')).toBeInTheDocument()

    // Resolve onExport
    resolveFn!([{ id: 'x' } as any])

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction')
    })

    // Button returns to normal label
    expect(screen.getByText('Export')).toBeInTheDocument()
  })
})
