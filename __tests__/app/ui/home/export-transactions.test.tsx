import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import React from 'react'

vi.mock('@/config/constants/main', () => ({
  DEFAULT_ICON_SIZE: 16,
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/app/lib/export-utils', () => {
  return {
    downloadFile: vi.fn(),
    generateCSV: vi.fn().mockReturnValue('csv-content'),
    generateJSON: vi.fn().mockReturnValue('json-content'),
    getExportFilename: vi.fn().mockImplementation((format: string) => `export.${format}`),
    getMimeType: vi.fn().mockImplementation((format: string) =>
      format === 'csv' ? 'text/csv' : 'application/json'
    ),
  }
})

// Mock @heroui/react components with lightweight stand-ins
vi.mock('@heroui/react', () => {
  const React = require('react')
  return {
    Button: ({ children, onPress, isLoading, startContent, ...rest }: any) => (
      <button onClick={onPress} disabled={!!isLoading} aria-busy={!!isLoading} {...rest}>
        {isLoading ? children : <>{startContent}{children}</>}
      </button>
    ),
    Card: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
    CardHeader: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
    CardBody: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
    Select: ({ label, selectedKeys, onChange, children, ...rest }: any) => {
      return (
        <label>
          {label}
          <select
            aria-label={label}
            value={selectedKeys?.[0] ?? ''}
            onChange={(e) => onChange?.(e)}
            {...rest}
          >
            {React.Children.map(children, (child: any) => child)}
          </select>
        </label>
      )
    },
    SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
    DateRangePicker: ({ label, defaultValue, onChange, ...rest }: any) => {
      const [start, setStart] = React.useState(defaultValue ? defaultValue.start.toString() : '')
      const [end, setEnd] = React.useState(defaultValue ? defaultValue.end.toString() : '')
      const emit = (s: string, e: string) => {
        if (s && e) {
          onChange?.({
            start: { toString: () => s },
            end: { toString: () => e },
          })
        } else {
          onChange?.(null)
        }
      }
      return (
        <div {...rest}>
          <label>
            {label} start
            <input
              aria-label={`${label} start`}
              type="date"
              value={start}
              onChange={(e) => {
                setStart(e.target.value)
                emit(e.target.value, end)
              }}
            />
          </label>
          <label>
            {label} end
            <input
              aria-label={`${label} end`}
              type="date"
              value={end}
              onChange={(e) => {
                setEnd(e.target.value)
                emit(start, e.target.value)
              }}
            />
          </label>
        </div>
      )
    },
  }
})

import toast from 'react-hot-toast'
import * as exportUtils from '@/app/lib/export-utils'
import ExportTransactions from '../../../../app/ui/home/export-transactions'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function makeTransactions(n: number): any[] {
  return Array.from({ length: n }, (_, i) => ({ id: String(i + 1) }))
}

describe('ExportTransactions', () => {
  it('renders heading and default info text with pluralization', () => {
    render(<ExportTransactions transactions={makeTransactions(2)} onExport={vi.fn()} />)
    expect(screen.getByText('Export Transactions')).toBeTruthy()
    expect(screen.getByText('Ready to export all 2 transactions')).toBeTruthy()
    expect(screen.getByLabelText('Export Format')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Export' })).toBeTruthy()
  })

  it('exports existing transactions as CSV by default without calling onExport when no date range', async () => {
    const onExport = vi.fn()
    const transactions = makeTransactions(3)
    render(<ExportTransactions transactions={transactions} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(onExport).not.toHaveBeenCalled()
    expect(exportUtils.generateCSV).toHaveBeenCalledTimes(1)
    expect(exportUtils.generateCSV).toHaveBeenCalledWith(transactions)
    expect(exportUtils.getExportFilename).toHaveBeenCalledWith('csv')
    expect(exportUtils.getMimeType).toHaveBeenCalledWith('csv')
    expect(exportUtils.downloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv')
    expect((toast.success as any)).toHaveBeenCalledWith('Exported 3 transactions')
  })

  it('shows error toast when there are no transactions to export', () => {
    const onExport = vi.fn()
    render(<ExportTransactions transactions={[]} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(onExport).not.toHaveBeenCalled()
    expect(exportUtils.downloadFile).not.toHaveBeenCalled()
    expect((toast.error as any)).toHaveBeenCalledWith('No transactions to export')
  })

  it('switches to JSON format when selected and uses JSON utils', () => {
    const onExport = vi.fn()
    const transactions = makeTransactions(1)
    render(<ExportTransactions transactions={transactions} onExport={onExport} />)

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'json' } })

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    expect(exportUtils.generateJSON).toHaveBeenCalledTimes(1)
    expect(exportUtils.generateJSON).toHaveBeenCalledWith(transactions)
    expect(exportUtils.getExportFilename).toHaveBeenCalledWith('json')
    expect(exportUtils.getMimeType).toHaveBeenCalledWith('json')
    expect(exportUtils.downloadFile).toHaveBeenCalledWith('json-content', 'export.json', 'application/json')
    expect((toast.success as any)).toHaveBeenCalledWith('Exported 1 transaction')
  })

  it('uses date range, calls onExport with adjusted end-of-day and exports result', async () => {
    const returnedTx = makeTransactions(1)
    const onExport = vi.fn().mockImplementation(
      (start: Date, end: Date) =>
        new Promise<any[]>((resolve) => setTimeout(() => resolve(returnedTx), 20))
    )
    render(<ExportTransactions transactions={makeTransactions(5)} onExport={onExport} />)

    const startInput = screen.getByLabelText('Date Range (Optional) start') as HTMLInputElement
    const endInput = screen.getByLabelText('Date Range (Optional) end') as HTMLInputElement

    fireEvent.change(startInput, { target: { value: '2024-01-01' } })
    fireEvent.change(endInput, { target: { value: '2024-01-31' } })

    expect(screen.getByText('Exporting transactions from 2024-01-01 to 2024-01-31')).toBeTruthy()

    const exportButton = screen.getByRole('button', { name: 'Export' })
    fireEvent.click(exportButton)

    const loadingButton = screen.getByRole('button', { name: 'Exporting...' }) as HTMLButtonElement
    expect(loadingButton.disabled).toBe(true)

    expect(onExport).toHaveBeenCalledTimes(1)
    const [startArg, endArg] = onExport.mock.calls[0]
    expect(startArg).toBeInstanceOf(Date)
    expect(endArg).toBeInstanceOf(Date)
    expect((endArg as Date).getHours()).toBe(23)
    expect((endArg as Date).getMinutes()).toBe(59)
    expect((endArg as Date).getSeconds()).toBe(59)
    expect((endArg as Date).getMilliseconds()).toBe(999)

    await waitFor(() => {
      expect(exportUtils.generateCSV).toHaveBeenCalledWith(returnedTx)
    })
    expect(exportUtils.downloadFile).toHaveBeenCalled()
    expect((toast.success as any)).toHaveBeenCalledWith('Exported 1 transaction')

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: 'Export' }) as HTMLButtonElement
      expect(btn.disabled).toBe(false)
    })
  })

  it('handles export errors and shows failure toast', async () => {
    const onExport = vi.fn()
    ;(exportUtils.generateCSV as any).mockImplementationOnce(() => {
      throw new Error('boom')
    })
    render(<ExportTransactions transactions={makeTransactions(2)} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect((toast.error as any)).toHaveBeenCalledWith('Failed to export transactions')
    })
    expect(exportUtils.downloadFile).not.toHaveBeenCalled()
  })
})