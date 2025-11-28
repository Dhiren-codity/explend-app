import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'

const toastSuccess = vi.fn()
const toastError = vi.fn()

const downloadFileMock = vi.fn()
const generateCSVMock = vi.fn().mockReturnValue('csv-content')
const generateJSONMock = vi.fn().mockReturnValue('json-content')
const getExportFilenameMock = vi.fn().mockReturnValue('export.csv')
const getMimeTypeMock = vi.fn().mockReturnValue('text/csv')

vi.mock('react-icons/pi', () => {
  const React = require('react')
  return {
    PiDownloadSimpleFill: (props: any) => React.createElement('svg', { 'data-testid': 'pi-icon', ...props }),
  }
})

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccess,
    error: toastError,
  },
}))

vi.mock('@heroui/react', () => {
  const React = require('react')
  const Button = ({ children, onPress, isLoading, startContent, ...props }: any) => (
    <button onClick={onPress} disabled={isLoading} {...props}>
      {startContent}
      {children}
    </button>
  )
  const Card = ({ children, ...props }: any) => <div {...props}>{children}</div>
  const CardBody = ({ children, ...props }: any) => <div {...props}>{children}</div>
  const CardHeader = ({ children, ...props }: any) => <div {...props}>{children}</div>
  const Select = ({ label, selectedKeys, onChange, children, ...props }: any) => {
    const value = selectedKeys?.[0] ?? ''
    return (
      <label>
        {label}
        <select aria-label={label} value={value} onChange={onChange} {...props}>
          {children}
        </select>
      </label>
    )
  }
  const SelectItem = ({ children, value }: any) => <option value={value}>{children}</option>
  const DateRangePicker = ({ label, onChange, ...props }: any) => (
    <div {...props}>
      <span>{label}</span>
      <button type="button" onClick={() => onChange?.({ start: { toString: () => '2024-01-01' }, end: { toString: () => '2024-01-31' } })}>
        Set Date Range
      </button>
      <button type="button" onClick={() => onChange?.(null)}>Clear Date Range</button>
    </div>
  )
  return { Button, Card, CardBody, CardHeader, DateRangePicker, Select, SelectItem }
})

vi.mock('@/app/lib/export-utils', () => ({
  downloadFile: downloadFileMock,
  generateCSV: generateCSVMock,
  generateJSON: generateJSONMock,
  getExportFilename: getExportFilenameMock,
  getMimeType: getMimeTypeMock,
}))

import ExportTransactions from '../../../../app/ui/home/export-transactions'

describe('ExportTransactions', () => {
  beforeEach(() => {
    toastSuccess.mockReset()
    toastError.mockReset()
    downloadFileMock.mockReset()
    generateCSVMock.mockReset().mockReturnValue('csv-content')
    generateJSONMock.mockReset().mockReturnValue('json-content')
    getExportFilenameMock.mockReset().mockReturnValue('export.csv')
    getMimeTypeMock.mockReset().mockReturnValue('text/csv')
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  const sampleTxs = [
    { id: '1', date: '2024-01-01', amount: 100 } as any,
    { id: '2', date: '2024-01-02', amount: 200 } as any,
  ]

  it('renders header and default summary message with pluralization', () => {
    render(<ExportTransactions transactions={sampleTxs} onExport={vi.fn()} />)

    expect(screen.getByText('Export Transactions')).toBeInTheDocument()
    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument()
  })

  it('exports CSV with all transactions when no date range is set', () => {
    const onExport = vi.fn()

    render(<ExportTransactions transactions={sampleTxs} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(onExport).not.toHaveBeenCalled()
    expect(generateCSVMock).toHaveBeenCalledTimes(1)
    expect(generateCSVMock).toHaveBeenCalledWith(sampleTxs)
    expect(generateJSONMock).not.toHaveBeenCalled()

    expect(getExportFilenameMock).toHaveBeenCalledTimes(1)
    expect(getMimeTypeMock).toHaveBeenCalledTimes(1)
    expect(downloadFileMock).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv')

    expect(toastSuccess).toHaveBeenCalledWith('Exported 2 transactions')
    expect(toastError).not.toHaveBeenCalled()
  })

  it('changes format to JSON, applies date range, calls onExport and exports JSON for returned data', () => {
    const rangeTxs = [{ id: '3', date: '2024-01-15', amount: 300 } as any]
    const onExport = vi.fn().mockResolvedValue(rangeTxs)

    // Adjust mocks for JSON
    getExportFilenameMock.mockReturnValueOnce('export.json')
    getMimeTypeMock.mockReturnValueOnce('application/json')

    render(<ExportTransactions transactions={sampleTxs} onExport={onExport} />)

    // Change format to JSON
    const select = screen.getByLabelText('Export Format') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'json' } })
    expect(select.value).toBe('json')

    // Set date range
    fireEvent.click(screen.getByRole('button', { name: 'Set Date Range' }))

    // Verify UI text updates to reflect date range
    expect(screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31')).toBeInTheDocument()

    // Export
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    // onExport called with start and end dates; end should be set to 23:59:59.999 local time
    expect(onExport).toHaveBeenCalledTimes(1)
    const [startDateArg, endDateArg] = onExport.mock.calls[0]
    expect(startDateArg).toBeInstanceOf(Date)
    expect(endDateArg).toBeInstanceOf(Date)
    // Check end-of-day adjustment
    expect((endDateArg as Date).getHours()).toBe(23)
    expect((endDateArg as Date).getMinutes()).toBe(59)
    expect((endDateArg as Date).getSeconds()).toBe(59)
    expect((endDateArg as Date).getMilliseconds()).toBe(999)

    // Ensure JSON path used
    expect(generateJSONMock).toHaveBeenCalledTimes(1)
    expect(generateJSONMock).toHaveBeenCalledWith(rangeTxs)
    expect(generateCSVMock).not.toHaveBeenCalled()

    expect(downloadFileMock).toHaveBeenCalledWith('json-content', 'export.json', 'application/json')
    expect(toastSuccess).toHaveBeenCalledWith('Exported 1 transaction')
  })

  it('shows error toast and does not export when onExport returns empty array for selected range', async () => {
    const onExport = vi.fn().mockResolvedValue([])

    render(<ExportTransactions transactions={sampleTxs} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Set Date Range' }))

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(onExport).toHaveBeenCalledTimes(1)
    expect(toastError).toHaveBeenCalledWith('No transactions to export')
    expect(downloadFileMock).not.toHaveBeenCalled()
    expect(generateCSVMock).not.toHaveBeenCalled()
    expect(generateJSONMock).not.toHaveBeenCalled()
  })

  it('handles unexpected errors by showing failure toast and logging error', () => {
    const onExport = vi.fn()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Cause generateCSV to throw
    generateCSVMock.mockImplementationOnce(() => {
      throw new Error('boom')
    })

    render(<ExportTransactions transactions={sampleTxs} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(toastError).toHaveBeenCalledWith('Failed to export transactions')
    expect(consoleSpy).toHaveBeenCalled()

    expect(downloadFileMock).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('shows singular form in summary when single transaction', () => {
    render(<ExportTransactions transactions={[sampleTxs[0]]} onExport={vi.fn()} />)
    expect(screen.getByText('Ready to export all 1 transaction')).toBeInTheDocument()
  })
})
