import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import React from 'react'

vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024-01-01'),
  subMonths: vi.fn(() => new Date()),
}))

vi.mock('react-hot-toast', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    default: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }
})

vi.mock('react-icons/pi', async (importOriginal) => {
  const actual = await importOriginal()
  return new Proxy(actual as object, {
    get(target, prop) {
      return (target as any)[prop] ?? (() => null)
    },
  })
})

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 20,
}))

vi.mock('@heroui/react', async (importOriginal) => {
  const actual = await importOriginal()
  const React = require('react')
  const SelectItem = ({ children, ...props }: any) => {
    const value = props.value ?? props.key ?? props['data-key'] ?? ''
    return <option value={value}>{children}</option>
  }
  const Select = ({ label, selectedKeys, onChange, onSelectionChange, children, className }: any) => {
    const getFirst = (val: any) =>
      Array.isArray(val) ? val[0] : val instanceof Set ? Array.from(val)[0] : val
    const value = getFirst(selectedKeys) ?? ''
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e)
      onSelectionChange?.(new Set([e.target.value]))
    }
    return (
      <label>
        {label}
        <select aria-label={label} value={value} onChange={handleChange} className={className}>
          {children}
        </select>
      </label>
    )
  }
  const Button = ({ children, onPress, onClick, isLoading, startContent, className }: any) => {
    const handleClick = () => {
      onPress?.()
      onClick?.()
    }
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={!!isLoading}
        aria-busy={!!isLoading}
        className={className}
      >
        {isLoading ? 'Exporting...' : (
          <>
            {startContent}
            {children}
          </>
        )}
      </button>
    )
  }
  const Card = ({ children }: any) => <div>{children}</div>
  const CardHeader = ({ children }: any) => <div>{children}</div>
  const CardBody = ({ children, className }: any) => <div className={className}>{children}</div>
  const DateRangePicker = ({ label, onChange, className }: any) => {
    const React = require('react')
    const [start, setStart] = React.useState('')
    const [end, setEnd] = React.useState('')
    return (
      <div className={className}>
        <span>{label}</span>
        <input
          aria-label="start-date"
          placeholder="start"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          aria-label="end-date"
          placeholder="end"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            if (start && end) {
              onChange?.({
                start: { toString: () => start, toDate: () => new Date(start) },
                end: { toString: () => end, toDate: () => new Date(end) },
              })
            } else {
              onChange?.(null)
            }
          }}
        >
          Apply Range
        </button>
      </div>
    )
  }
  return { ...actual, Button, Card, CardBody, CardHeader, DateRangePicker, Select, SelectItem }
})

vi.mock('@/app/lib/export-utils', () => {
  return {
    downloadFile: vi.fn(),
    generateCSV: vi.fn(() => 'csv-content'),
    generateJSON: vi.fn(() => 'json-content'),
    getExportFilename: vi.fn((format: 'csv' | 'json') => (format === 'csv' ? 'export.csv' : 'export.json')),
    getMimeType: vi.fn((format: 'csv' | 'json') => (format === 'csv' ? 'text/csv' : 'application/json')),
  }
})

import toast from 'react-hot-toast'
import {
  downloadFile,
  generateCSV,
  generateJSON,
  getExportFilename,
  getMimeType,
} from '@/app/lib/export-utils'
import ExportTransactions from '../../../../app/ui/home/export-transactions'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('ExportTransactions', () => {
  const sampleTransactions = [{ id: 't1' }, { id: 't2' }] as any

  it('renders heading and default info text with pluralization', () => {
    render(<ExportTransactions transactions={sampleTransactions} onExport={vi.fn()} />)

    expect(screen.getByText('Export Transactions')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Export' })).toBeTruthy()
    expect(screen.getByText('Ready to export all 2 transactions')).toBeTruthy()
  })

  it('renders singular when 1 transaction', () => {
    render(<ExportTransactions transactions={[{ id: 't1' }] as any} onExport={vi.fn()} />)
    expect(screen.getByText('Ready to export all 1 transaction')).toBeTruthy()
  })

  it('exports CSV using in-memory transactions when no date range is set', async () => {
    const onExport = vi.fn()

    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(onExport).not.toHaveBeenCalled()
      expect(generateCSV).toHaveBeenCalledWith(sampleTransactions)
      expect(generateJSON).not.toHaveBeenCalled()
      expect(getExportFilename).toHaveBeenCalledWith('csv')
      expect(getMimeType).toHaveBeenCalledWith('csv')
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv')
      expect((toast as any).success).toHaveBeenCalledWith('Exported 2 transactions')
    })
  })

  it('exports JSON when format is switched to json', async () => {
    const onExport = vi.fn()
    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'json' } })

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(generateJSON).toHaveBeenCalledWith(sampleTransactions)
      expect(generateCSV).not.toHaveBeenCalled()
      expect(getExportFilename).toHaveBeenCalledWith('json')
      expect(getMimeType).toHaveBeenCalledWith('json')
      expect(downloadFile).toHaveBeenCalledWith('json-content', 'export.json', 'application/json')
      expect((toast as any).success).toHaveBeenCalledWith('Exported 2 transactions')
    })
  })

  it('calls onExport with start and end of day and uses returned transactions', async () => {
    const returned = [{ id: 'x1' }] as any
    const onExport = vi.fn().mockResolvedValue(returned)

    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    const startInput = screen.getByLabelText('start-date')
    const endInput = screen.getByLabelText('end-date')
    fireEvent.change(startInput, { target: { value: '2024-05-01' } })
    fireEvent.change(endInput, { target: { value: '2024-05-03' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply Range' }))

    expect(screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-01')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
      const [startDate, endDate] = onExport.mock.calls[0]

      expect(startDate).toBeInstanceOf(Date)
      expect(endDate).toBeInstanceOf(Date)

      const sd = startDate as Date
      expect(sd.getFullYear()).toBe(2024)
      expect(sd.getMonth()).toBe(4)
      expect(sd.getDate()).toBe(1)
      expect(sd.getHours()).toBe(0)
      expect(sd.getMinutes()).toBe(0)

      const ed = endDate as Date
      expect(ed.getFullYear()).toBe(2024)
      expect(ed.getMonth()).toBe(4)
      expect(ed.getDate()).toBe(3)
      expect(ed.getHours()).toBe(23)
      expect(ed.getMinutes()).toBe(59)
      expect(ed.getSeconds()).toBe(59)
      expect(ed.getMilliseconds()).toBe(999)

      expect(generateCSV).toHaveBeenCalledWith(returned)
      expect(downloadFile).toHaveBeenCalled()
      expect((toast as any).success).toHaveBeenCalledWith('Exported 1 transaction')
    })
  })

  it('shows error toast when there are no transactions to export', async () => {
    const onExport = vi.fn()

    render(<ExportTransactions transactions={[]} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect((toast as any).error).toHaveBeenCalledWith('No transactions to export')
      expect(downloadFile).not.toHaveBeenCalled()
      expect(generateCSV).not.toHaveBeenCalled()
      expect(generateJSON).not.toHaveBeenCalled()
    })
  })

  it('handles export failure and shows error toast', async () => {
    const onExport = vi.fn().mockRejectedValue(new Error('boom'))

    render(<ExportTransactions transactions={sampleTransactions} onExport={onExport} />)

    fireEvent.change(screen.getByLabelText('start-date'), { target: { value: '2024-06-01' } })
    fireEvent.change(screen.getByLabelText('end-date'), { target: { value: '2024-06-10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply Range' }))

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect((toast as any).error).toHaveBeenCalledWith('Failed to export transactions')
      expect(downloadFile).not.toHaveBeenCalled()
    })
  })
})