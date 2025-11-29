import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mocks
const toastMock = {
  success: vi.fn(),
  error: vi.fn(),
}

vi.mock('react-hot-toast', () => ({
  default: toastMock,
}))

vi.mock('react-icons/pi', () => ({
  PiDownloadSimpleFill: () => React.createElement('svg', { 'data-testid': 'download-icon' }),
}))

vi.mock('@internationalized/date', () => ({
  parseDate: vi.fn(() => ({ toString: () => '2024-01-01' })),
}))

vi.mock('date-fns', () => ({
  format: vi.fn((date: Date, fmt: string) => '2024-01-01'),
  subMonths: vi.fn((date: Date, n: number) => new Date('2023-12-01')),
}))

// Minimal mock of @heroui/react components
vi.mock('@heroui/react', async () => {
  const React = await import('react')
  const Select = ({ label, selectedKeys, onChange, children }: any) => {
    const value = selectedKeys?.[0]
    return (
      <label>
        <span>{label}</span>
        <select aria-label={label} value={value} onChange={onChange}>
          {React.Children.map(children, (child: any) => {
            if (!child) return null
            const optValue = child.props.value ?? child.props['key']
            return (
              <option key={optValue} value={optValue}>
                {child.props.children}
              </option>
            )
          })}
        </select>
      </label>
    )
  }
  const SelectItem = ({ children }: any) => children ?? null

  const DateRangePicker = ({ label, onChange }: any) => {
    const [start, setStart] = React.useState('')
    const [end, setEnd] = React.useState('')

    const maybeNotify = (nextStart: string, nextEnd: string) => {
      if (nextStart && nextEnd) {
        onChange?.({
          start: { toString: () => nextStart },
          end: { toString: () => nextEnd },
        })
      }
    }

    return (
      <div>
        <label>
          <span>{label} start</span>
          <input
            aria-label={`${label} start`}
            type="date"
            value={start}
            onChange={(e) => {
              const v = e.target.value
              setStart(v)
              maybeNotify(v, end)
            }}
          />
        </label>
        <label>
          <span>{label} end</span>
          <input
            aria-label={`${label} end`}
            type="date"
            value={end}
            onChange={(e) => {
              const v = e.target.value
              setEnd(v)
              maybeNotify(start, v)
            }}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setStart('')
            setEnd('')
            onChange?.(null)
          }}
        >
          Clear Date Range
        </button>
      </div>
    )
  }

  const Button = ({ children, onPress, isLoading, startContent }: any) => (
    <button onClick={onPress} disabled={!!isLoading}>
      {startContent}
      {children}
    </button>
  )
  const Card = ({ children }: any) => <div data-testid="card">{children}</div>
  const CardHeader = ({ children }: any) => <div>{children}</div>
  const CardBody = ({ children }: any) => <div>{children}</div>

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

// Mock export-utils
const generateCSVMock = vi.fn(() => 'CSV_CONTENT')
const generateJSONMock = vi.fn(() => 'JSON_CONTENT')
const getExportFilenameMock = vi.fn((fmt: string) => (fmt === 'json' ? 'export.json' : 'export.csv'))
const getMimeTypeMock = vi.fn((fmt: string) => (fmt === 'json' ? 'application/json' : 'text/csv'))
const downloadFileMock = vi.fn()

vi.mock('../../../../app/lib/export-utils', () => ({
  generateCSV: generateCSVMock,
  generateJSON: generateJSONMock,
  getExportFilename: getExportFilenameMock,
  getMimeType: getMimeTypeMock,
  downloadFile: downloadFileMock,
}))

import ExportTransactions from '@/app/ui/home/export-transactions'

describe('ExportTransactions component', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    ;(console.error as any).mockRestore?.()
  })

  const sampleTransactions = [
    { id: 't1', amount: 100, date: '2024-01-01' },
    { id: 't2', amount: 200, date: '2024-01-02' },
  ]

  it('renders UI elements and summary for all transactions', () => {
    const onExport = vi.fn()
    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    expect(screen.getByRole('heading', { name: /Export Transactions/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Export Format')).toBeInTheDocument()
    expect(screen.getByLabelText('Date Range (Optional) start')).toBeInTheDocument()
    expect(screen.getByLabelText('Date Range (Optional) end')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument()

    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument()
  })

  it('exports CSV by default without calling onExport when no date range is selected', async () => {
    const onExport = vi.fn()
    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: /Export/i }))

    expect(onExport).not.toHaveBeenCalled()
    expect(generateCSVMock).toHaveBeenCalledTimes(1)
    expect(generateCSVMock).toHaveBeenCalledWith(sampleTransactions)
    expect(generateJSONMock).not.toHaveBeenCalled()

    expect(getExportFilenameMock).toHaveBeenCalledWith('csv')
    expect(getMimeTypeMock).toHaveBeenCalledWith('csv')
    expect(downloadFileMock).toHaveBeenCalledWith('CSV_CONTENT', 'export.csv', 'text/csv')

    expect(toastMock.success).toHaveBeenCalledWith('Exported 2 transactions')
    expect(toastMock.error).not.toHaveBeenCalled()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export/i })).toBeEnabled()
    })
  })

  it('switches format to JSON and exports JSON', () => {
    const onExport = vi.fn()
    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'json' } })

    fireEvent.click(screen.getByRole('button', { name: /Export/i }))

    expect(onExport).not.toHaveBeenCalled()
    expect(generateJSONMock).toHaveBeenCalledTimes(1)
    expect(generateJSONMock).toHaveBeenCalledWith(sampleTransactions)
    expect(generateCSVMock).not.toHaveBeenCalled()

    expect(getExportFilenameMock).toHaveBeenCalledWith('json')
    expect(getMimeTypeMock).toHaveBeenCalledWith('json')
    expect(downloadFileMock).toHaveBeenCalledWith('JSON_CONTENT', 'export.json', 'application/json')

    expect(toastMock.success).toHaveBeenCalledWith('Exported 2 transactions')
  })

  it('applies date range and calls onExport with start and end dates (end at 23:59:59.999)', async () => {
    const returned = [{ id: 't3', amount: 50, date: '2024-01-15' }]
    const onExport = vi.fn().mockResolvedValue(returned)
    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    const startInput = screen.getByLabelText('Date Range (Optional) start')
    const endInput = screen.getByLabelText('Date Range (Optional) end')

    fireEvent.change(startInput, { target: { value: '2024-01-01' } })
    fireEvent.change(endInput, { target: { value: '2024-01-31' } })

    expect(
      screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Export/i }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
    })

    const [startArg, endArg] = onExport.mock.calls[0]
    expect(startArg).toBeInstanceOf(Date)
    expect(endArg).toBeInstanceOf(Date)

    expect(startArg.getFullYear()).toBe(2024)
    expect(startArg.getMonth()).toBe(0)
    expect(startArg.getDate()).toBe(1)
    // start time should be default 00:00:00.000 local time
    expect(startArg.getHours()).toBe(0)
    expect(startArg.getMinutes()).toBe(0)

    expect(endArg.getFullYear()).toBe(2024)
    expect(endArg.getMonth()).toBe(0)
    expect(endArg.getDate()).toBe(31)
    expect(endArg.getHours()).toBe(23)
    expect(endArg.getMinutes()).toBe(59)
    expect(endArg.getSeconds()).toBe(59)
    expect(endArg.getMilliseconds()).toBe(999)

    expect(generateCSVMock).toHaveBeenCalledWith(returned)
    expect(toastMock.success).toHaveBeenCalledWith('Exported 1 transaction')
  })

  it('shows error toast when there are no transactions to export', async () => {
    const onExport = vi.fn()
    render(<ExportTransactions transactions={[]} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: /Export/i }))

    expect(toastMock.error).toHaveBeenCalledWith('No transactions to export')
    expect(downloadFileMock).not.toHaveBeenCalled()
    expect(toastMock.success).not.toHaveBeenCalled()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export/i })).toBeEnabled()
    })
  })

  it('shows error toast on failure during export', async () => {
    const onExport = vi.fn()
    downloadFileMock.mockImplementationOnce(() => {
      throw new Error('download failed')
    })
    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: /Export/i }))

    expect(toastMock.error).toHaveBeenCalledWith('Failed to export transactions')
  })

  it('when date range set and onExport returns empty, shows "No transactions to export"', async () => {
    const onExport = vi.fn().mockResolvedValue([])
    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    const startInput = screen.getByLabelText('Date Range (Optional) start')
    const endInput = screen.getByLabelText('Date Range (Optional) end')

    fireEvent.change(startInput, { target: { value: '2024-02-01' } })
    fireEvent.change(endInput, { target: { value: '2024-02-28' } })

    fireEvent.click(screen.getByRole('button', { name: /Export/i }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
    })

    expect(toastMock.error).toHaveBeenCalledWith('No transactions to export')
    expect(downloadFileMock).not.toHaveBeenCalled()
    expect(toastMock.success).not.toHaveBeenCalled()
  })
})
