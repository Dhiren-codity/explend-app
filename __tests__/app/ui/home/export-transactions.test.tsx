import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024-01-01'),
  subMonths: vi.fn(() => new Date('2023-12-01')),
}))

vi.mock('@heroui/react', async (importOriginal) => {
  const actual: any = await importOriginal()
  const Select = ({ label, selectedKeys, onSelectionChange, onChange, children }: any) => {
    const value = selectedKeys ? Array.from(selectedKeys)[0] : ''
    return (
      <label>
        {label}
        <select
          aria-label={label}
          value={value ?? ''}
          onChange={(e) => {
            onChange?.(e)
            onSelectionChange?.(new Set([e.target.value]))
          }}
        >
          {children}
        </select>
      </label>
    )
  }
  const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>
  const Button = ({ children, onPress, isLoading, ...props }: any) => (
    <button type="button" onClick={onPress} aria-busy={isLoading} {...props}>
      {isLoading ? 'Exporting...' : children}
    </button>
  )
  const Card = ({ children }: any) => <div>{children}</div>
  const CardHeader = ({ children }: any) => <div>{children}</div>
  const CardBody = ({ children }: any) => <div>{children}</div>
  const DateRangePicker = ({ label, onChange }: any) => (
    <div>
      <span>{label}</span>
      <button
        type="button"
        onClick={() =>
          onChange?.({
            start: { toString: () => '2024-01-01' },
            end: { toString: () => '2024-01-31' },
          })
        }
      >
        Set Date Range
      </button>
      <button type="button" onClick={() => onChange?.(null)}>Clear Date Range</button>
    </div>
  )
  return { ...actual, Select, SelectItem, Button, Card, CardHeader, CardBody, DateRangePicker }
})

vi.mock('react-hot-toast', async (importOriginal) => {
  const actual: any = await importOriginal()
  const toastFn: any = vi.fn()
  toastFn.success = vi.fn()
  toastFn.error = vi.fn()
  return { ...actual, default: toastFn }
})

vi.mock('react-icons/pi', async (importOriginal) => {
  const actual: any = await importOriginal()
  return { ...actual, PiDownloadSimpleFill: () => null }
})

vi.mock('@internationalized/date', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    parseDate: (s: string) => ({ toString: () => s }),
  }
})

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 24,
}))

vi.mock('@/app/lib/export-utils', () => {
  return {
    generateCSV: vi.fn(() => 'csv-content'),
    generateJSON: vi.fn(() => 'json-content'),
    getExportFilename: vi.fn((fmt: string) => `file.${fmt}`),
    getMimeType: vi.fn((fmt: string) => (fmt === 'csv' ? 'text/csv' : 'application/json')),
    downloadFile: vi.fn(),
  }
})

import toast from 'react-hot-toast'
import {
  generateCSV,
  generateJSON,
  getExportFilename,
  getMimeType,
  downloadFile,
} from '@/app/lib/export-utils'

import ExportTransactions from '../../../../app/ui/home/export-transactions'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('ExportTransactions', () => {
  const sampleTransactions = [{ id: '1' }, { id: '2' }]

  it('renders heading and default status text', () => {
    render(
      <ExportTransactions transactions={sampleTransactions} onExport={vi.fn()} />
    )

    expect(screen.getByText('Export Transactions')).toBeInTheDocument()
    expect(
      screen.getByText('Ready to export all 2 transactions')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
  })

  it('exports CSV by default without date range', async () => {
    render(
      <ExportTransactions transactions={sampleTransactions} onExport={vi.fn()} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(generateCSV).toHaveBeenCalledWith(sampleTransactions)
      expect(generateJSON).not.toHaveBeenCalled()
      expect(getExportFilename).toHaveBeenCalledWith('csv')
      expect(getMimeType).toHaveBeenCalledWith('csv')
      expect(downloadFile).toHaveBeenCalledWith('csv-content', 'file.csv', 'text/csv')
      expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions')
    })
  })

  it('switches to JSON format and exports', async () => {
    render(
      <ExportTransactions transactions={sampleTransactions} onExport={vi.fn()} />
    )

    const select = screen.getByLabelText('Export Format')
    fireEvent.change(select, { target: { value: 'json' } })

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(generateJSON).toHaveBeenCalledWith(sampleTransactions)
      expect(generateCSV).not.toHaveBeenCalled()
      expect(getExportFilename).toHaveBeenCalledWith('json')
      expect(getMimeType).toHaveBeenCalledWith('json')
      expect(downloadFile).toHaveBeenCalledWith('json-content', 'file.json', 'application/json')
      expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions')
    })
  })

  it('sets date range, calls onExport with start/end dates, and exports filtered result', async () => {
    const onExport = vi.fn().mockResolvedValue([{ id: '1' }])

    render(
      <ExportTransactions transactions={sampleTransactions} onExport={onExport} />
    )

    fireEvent.click(screen.getByRole('button', { name: /set date range/i }))

    expect(
      screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
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
    })

    await waitFor(() => {
      expect(generateCSV).toHaveBeenCalledWith([{ id: '1' }])
      expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction')
      expect(downloadFile).toHaveBeenCalled()
    })
  })

  it('shows error toast when onExport returns empty list', async () => {
    const onExport = vi.fn().mockResolvedValue([])

    render(
      <ExportTransactions transactions={sampleTransactions} onExport={onExport} />
    )

    fireEvent.click(screen.getByRole('button', { name: /set date range/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
      expect(toast.error).toHaveBeenCalledWith('No transactions to export')
      expect(downloadFile).not.toHaveBeenCalled()
      expect(generateCSV).not.toHaveBeenCalled()
      expect(generateJSON).not.toHaveBeenCalled()
    })
  })

  it('shows error toast when there are no transactions and no date range', async () => {
    render(
      <ExportTransactions transactions={[]} onExport={vi.fn()} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export')
      expect(downloadFile).not.toHaveBeenCalled()
    })
  })

  it('handles unexpected errors and shows failure toast', async () => {
    ;(generateCSV as any).mockImplementationOnce(() => {
      throw new Error('boom')
    })

    render(
      <ExportTransactions transactions={sampleTransactions} onExport={vi.fn()} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions')
      expect(downloadFile).not.toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    })
  })
})