import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: () => null,
}))

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 20,
}))

// Lightweight mocks for @heroui/react components used in the component
vi.mock('@heroui/react', () => {
  const React = require('react')
  const Button = ({ children, onPress, isLoading }: any) => (
    <button onClick={onPress} aria-busy={isLoading}>
      {children}
    </button>
  )

  const Card = ({ children }: any) => <div data-testid="card">{children}</div>
  const CardHeader = ({ children }: any) => <div data-testid="card-header">{children}</div>
  const CardBody = ({ children, className }: any) => (
    <div data-testid="card-body" className={className}>
      {children}
    </div>
  )

  const SelectItem = ({ children, value }: any) => <option value={value}>{children}</option>

  const Select = ({ label, selectedKeys, onChange, children, className }: any) => {
    const id = `select-${label?.toString().replace(/\s+/g, '-').toLowerCase()}`
    return (
      <div className={className}>
        {label && <label htmlFor={id}>{label}</label>}
        <select
          id={id}
          aria-label={label}
          data-testid="mock-select"
          value={selectedKeys?.[0]}
          onChange={(e) => onChange?.(e)}
        >
          {children}
        </select>
      </div>
    )
  }

  // DateRangePicker mock provides buttons to set or clear a fixed date range
  const DateRangePicker = ({ label, onChange, className }: any) => {
    const setRange = () =>
      onChange?.({
        start: { toString: () => '2024-01-01' },
        end: { toString: () => '2024-01-31' },
      })
    const clearRange = () => onChange?.(null)
    return (
      <div className={className}>
        <span>{label}</span>
        <button type="button" onClick={setRange}>
          Set Range
        </button>
        <button type="button" onClick={clearRange}>
          Clear Range
        </button>
      </div>
    )
  }

  return {
    Button,
    Card,
    CardHeader,
    CardBody,
    Select,
    SelectItem,
    DateRangePicker,
  }
})

// Mock export utils
const generateCSVMock = vi.fn()
const generateJSONMock = vi.fn()
const getExportFilenameMock = vi.fn()
const getMimeTypeMock = vi.fn()
const downloadFileMock = vi.fn()

vi.mock('@/app/lib/export-utils', () => ({
  generateCSV: (...args: any[]) => generateCSVMock(...args),
  generateJSON: (...args: any[]) => generateJSONMock(...args),
  getExportFilename: (...args: any[]) => getExportFilenameMock(...args),
  getMimeType: (...args: any[]) => getMimeTypeMock(...args),
  downloadFile: (...args: any[]) => downloadFileMock(...args),
}))

// Mock react-hot-toast
const toastSuccessMock = vi.fn()
const toastErrorMock = vi.fn()
vi.mock('react-hot-toast', () => ({
  default: {
    success: (...args: any[]) => toastSuccessMock(...args),
    error: (...args: any[]) => toastErrorMock(...args),
  },
}))

import ExportTransactions from '../../../../app/ui/home/export-transactions'

describe('ExportTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  const sampleTransactions = [
    { id: '1', amount: 100, date: '2024-01-02', description: 'A' },
    { id: '2', amount: 200, date: '2024-01-03', description: 'B' },
  ] as any

  it('renders heading and initial status for transactions count', () => {
    const onExport = vi.fn()
    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    expect(screen.getByText('Export Transactions')).toBeInTheDocument()
    expect(
      screen.getByText('Ready to export all 2 transactions'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    // Select should render with default 'csv'
    const select = screen.getByTestId('mock-select') as HTMLSelectElement
    expect(select.value).toBe('csv')
  })

  it('exports all transactions as CSV when no date range is set', async () => {
    const onExport = vi.fn()
    generateCSVMock.mockReturnValue('csv-content')
    getExportFilenameMock.mockReturnValue('export.csv')
    getMimeTypeMock.mockReturnValue('text/csv')

    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(generateCSVMock).toHaveBeenCalledTimes(1)
    })

    expect(onExport).not.toHaveBeenCalled()
    expect(generateCSVMock).toHaveBeenCalledWith(sampleTransactions)
    expect(getExportFilenameMock).toHaveBeenCalledWith('csv')
    expect(getMimeTypeMock).toHaveBeenCalledWith('csv')
    expect(downloadFileMock).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv')
    expect(toastSuccessMock).toHaveBeenCalledWith('Exported 2 transactions')
  })

  it('sets loading state during export and resets after', async () => {
    const onExport = vi.fn()
    generateCSVMock.mockImplementation(() => 'csv-content')
    getExportFilenameMock.mockReturnValue('export.csv')
    getMimeTypeMock.mockReturnValue('text/csv')

    render(<ExportTransactions transactions={[sampleTransactions[0]]} onExport={onExport} />)

    const button = screen.getByRole('button', { name: 'Export' })
    fireEvent.click(button)

    // Button text should reflect loading state as component sets children
    expect(await screen.findByText('Exporting...')).toBeInTheDocument()

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith('Exported 1 transaction')
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    })
  })

  it('sets a date range and uses onExport with end of day time', async () => {
    const apiResult = [{ id: '3', amount: 300, date: '2024-01-15', description: 'C' }] as any
    const onExport = vi.fn().mockResolvedValue(apiResult)
    generateCSVMock.mockReturnValue('csv-ranged')
    getExportFilenameMock.mockReturnValue('export.csv')
    getMimeTypeMock.mockReturnValue('text/csv')

    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    // Set date range using our mock DateRangePicker
    fireEvent.click(screen.getByText('Set Range'))

    // Verify status text updates
    expect(
      screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
    })

    const [start, end] = onExport.mock.calls[0]
    expect(start).toBeInstanceOf(Date)
    expect(end).toBeInstanceOf(Date)
    expect((start as Date).toISOString().startsWith('2024-01-01')).toBe(true)
    // Ensure end time is set to 23:59:59.999 local; to verify, check milliseconds since day's start
    const endDate = end as Date
    expect(endDate.getHours()).toBe(23)
    expect(endDate.getMinutes()).toBe(59)
    expect(endDate.getSeconds()).toBe(59)
    expect(endDate.getMilliseconds()).toBe(999)

    expect(generateCSVMock).toHaveBeenCalledWith(apiResult)
    expect(downloadFileMock).toHaveBeenCalled()
    expect(toastSuccessMock).toHaveBeenCalledWith('Exported 1 transaction')
  })

  it('shows error toast when exporting with no transactions', async () => {
    const onExport = vi.fn()

    render(<ExportTransactions transactions={[]} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('No transactions to export')
    })

    expect(downloadFileMock).not.toHaveBeenCalled()
    expect(onExport).not.toHaveBeenCalled()
  })

  it('shows error toast when date range is set but onExport returns empty', async () => {
    const onExport = vi.fn().mockResolvedValue([])
    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    fireEvent.click(screen.getByText('Set Range'))
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
      expect(toastErrorMock).toHaveBeenCalledWith('No transactions to export')
    })

    expect(downloadFileMock).not.toHaveBeenCalled()
  })

  it('switches export format to JSON and uses generateJSON and proper mime', async () => {
    const onExport = vi.fn()
    generateJSONMock.mockReturnValue('json-content')
    getExportFilenameMock.mockReturnValue('export.json')
    getMimeTypeMock.mockReturnValue('application/json')

    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    const select = screen.getByTestId('mock-select') as HTMLSelectElement
    // Change to json
    fireEvent.change(select, { target: { value: 'json' } })

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(generateJSONMock).toHaveBeenCalledWith(sampleTransactions)
    })

    expect(generateCSVMock).not.toHaveBeenCalled()
    expect(getExportFilenameMock).toHaveBeenCalledWith('json')
    expect(getMimeTypeMock).toHaveBeenCalledWith('json')
    expect(downloadFileMock).toHaveBeenCalledWith('json-content', 'export.json', 'application/json')
    expect(toastSuccessMock).toHaveBeenCalledWith('Exported 2 transactions')
  })

  it('handles errors during export and shows failure toast', async () => {
    const onExport = vi.fn()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    generateCSVMock.mockImplementation(() => {
      throw new Error('boom')
    })

    render(<ExportTransactions transactions={[sampleTransactions[0]]} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Failed to export transactions')
    })

    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})
