import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

vi.mock('@heroui/react', async () => {
  const React = await import('react')
  const { useState } = React
  return {
    Button: ({ children, onPress, isLoading, ...props }: any) => (
      <button type="button" aria-busy={!!isLoading} onClick={onPress} {...props}>
        {children}
      </button>
    ),
    Card: ({ children }: any) => <div data-testid="card">{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardBody: ({ children, className }: any) => <div className={className}>{children}</div>,
    Select: ({ label, selectedKeys, onChange, children, className }: any) => (
      <label className={className}>
        <span>{label}</span>
        <select aria-label={label} value={selectedKeys?.[0]} onChange={onChange}>
          {children}
        </select>
      </label>
    ),
    SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
    DateRangePicker: ({ label, onChange, className }: any) => {
      const [start, setStart] = useState('')
      const [end, setEnd] = useState('')
      return (
        <div className={className}>
          <span>{label}</span>
          <input aria-label="start-date" data-testid="dr-start" value={start} onChange={(e) => setStart((e.target as HTMLInputElement).value)} />
          <input aria-label="end-date" data-testid="dr-end" value={end} onChange={(e) => setEnd((e.target as HTMLInputElement).value)} />
          <button type="button" data-testid="apply-range" onClick={() => onChange && onChange({ start: { toString: () => start }, end: { toString: () => end } })}>
            Apply
          </button>
          <button type="button" data-testid="clear-range" onClick={() => onChange && onChange(null)}>
            Clear
          </button>
        </div>
      )
    },
  }
})

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: (props: any) => <svg data-testid="icon" {...props} />,
}))

vi.mock('react-hot-toast', () => {
  const success = vi.fn()
  const error = vi.fn()
  const toast = { success, error }
  return { default: toast, success, error }
})

vi.mock('@/app/lib/export-utils', () => {
  return {
    generateCSV: vi.fn(() => 'csv-content'),
    generateJSON: vi.fn(() => 'json-content'),
    getExportFilename: vi.fn((fmt: string) => `export.${fmt}`),
    getMimeType: vi.fn((fmt: string) => (fmt === 'csv' ? 'text/csv' : 'application/json')),
    downloadFile: vi.fn(),
  }
})

import ExportTransactions from '../../../../app/ui/home/export-transactions'
import toast from 'react-hot-toast'
import { generateCSV, generateJSON, getExportFilename, getMimeType, downloadFile } from '@/app/lib/export-utils'

describe('ExportTransactions', () => {
  const sampleTransactions = [
    { id: '1', amount: 100, date: '2025-01-01', description: 'A' },
    { id: '2', amount: 200, date: '2025-01-02', description: 'B' },
  ] as any

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('renders with default state', () => {
    const onExport = vi.fn().mockResolvedValue(sampleTransactions)
    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    expect(screen.getByText('Export Transactions')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument()

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement
    expect(select.value).toBe('csv')
  })

  it('exports CSV by default', async () => {
    const onExport = vi.fn().mockResolvedValue(sampleTransactions)
    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(generateCSV).toHaveBeenCalledWith(sampleTransactions)
    expect(getExportFilename).toHaveBeenCalledWith('csv')
    expect(getMimeType).toHaveBeenCalledWith('csv')
    expect(downloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv')
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions')
  })

  it('changes format to JSON and exports JSON', async () => {
    const onExport = vi.fn().mockResolvedValue(sampleTransactions)
    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'json' } })
    expect(select.value).toBe('json')

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(generateJSON).toHaveBeenCalledWith(sampleTransactions)
    expect(getExportFilename).toHaveBeenCalledWith('json')
    expect(getMimeType).toHaveBeenCalledWith('json')
    expect(downloadFile).toHaveBeenCalledWith('json-content', 'export.json', 'application/json')
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions')
  })

  it('applies date range, calls onExport with EOD end date, shows loading state, then downloads', async () => {
    vi.useFakeTimers()
    const delayed = new Promise<any[]>((resolve) => setTimeout(() => resolve(sampleTransactions), 50))
    const onExport = vi.fn().mockReturnValue(delayed)

    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    // Set date range in mocked DateRangePicker
    fireEvent.change(screen.getByTestId('dr-start'), { target: { value: '2024-01-01' } })
    fireEvent.change(screen.getByTestId('dr-end'), { target: { value: '2024-01-31' } })
    fireEvent.click(screen.getByTestId('apply-range'))

    expect(screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    // Loading state should show "Exporting..."
    expect(screen.getByRole('button', { name: 'Exporting...' })).toBeInTheDocument()

    // onExport called with proper dates
    expect(onExport).toHaveBeenCalledTimes(1)
    const [startArg, endArg] = onExport.mock.calls[0]
    expect(startArg).toBeInstanceOf(Date)
    expect(endArg).toBeInstanceOf(Date)
    expect(startArg.toISOString().slice(0, 10)).toBe('2024-01-01')
    expect(endArg.toISOString().slice(0, 10)).toBe('2024-01-31')
    expect(endArg.getHours()).toBe(23)
    expect(endArg.getMinutes()).toBe(59)
    expect(endArg.getSeconds()).toBe(59)
    expect(endArg.getMilliseconds()).toBe(999)

    // Resolve the promise
    vi.runAllTimers()
    await waitFor(() => {
      expect(downloadFile).toHaveBeenCalled()
    })

    // Button text returns to "Export"
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions')
  })

  it('shows error toast when no transactions to export (no date range)', async () => {
    const onExport = vi.fn()
    render(<ExportTransactions transactions={[]} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(toast.error).toHaveBeenCalledWith('No transactions to export')
    expect(downloadFile).not.toHaveBeenCalled()
    expect(generateCSV).not.toHaveBeenCalled()
    expect(generateJSON).not.toHaveBeenCalled()
  })

  it('shows error toast when date range yields no transactions', async () => {
    const onExport = vi.fn().mockResolvedValue([])

    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    fireEvent.change(screen.getByTestId('dr-start'), { target: { value: '2024-02-01' } })
    fireEvent.change(screen.getByTestId('dr-end'), { target: { value: '2024-02-10' } })
    fireEvent.click(screen.getByTestId('apply-range'))

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export')
    })
    expect(downloadFile).not.toHaveBeenCalled()
  })

  it('handles errors and shows failure toast', async () => {
    const onExport = vi.fn().mockResolvedValue(sampleTransactions)
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    ;(generateCSV as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error('boom')
    })

    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions')
    })
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })
})
