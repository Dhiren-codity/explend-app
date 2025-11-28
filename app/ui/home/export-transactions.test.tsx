import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import ExportTransactions from '@/app/ui/home/export-transactions'
import toast from 'react-hot-toast'
import {
  generateCSV,
  generateJSON,
  downloadFile,
  getExportFilename,
  getMimeType,
} from '@/app/lib/export-utils'

vi.mock('react-hot-toast', () => {
  const success = vi.fn()
  const error = vi.fn()
  return { default: { success, error } }
})

vi.mock('@/app/lib/export-utils', () => {
  return {
    generateCSV: vi.fn(() => 'csv-content'),
    generateJSON: vi.fn(() => 'json-content'),
    downloadFile: vi.fn(),
    getExportFilename: vi.fn((fmt: string) => `file.${fmt}`),
    getMimeType: vi.fn((fmt: string) =>
      fmt === 'csv' ? 'text/csv' : 'application/json',
    ),
  }
})

vi.mock('@heroui/react', () => {
  const React = require('react')
  const Select = ({ label, onChange, children, selectedKeys }: any) => {
    return (
      <label>
        {label}
        <select
          aria-label={label}
          onChange={onChange}
          value={selectedKeys?.[0] ?? ''}
        >
          {React.Children.map(children, (child: any) => {
            if (!React.isValidElement(child)) return null
            const { value, children: optionLabel } = child.props
            const optionValue = value ?? child.key
            return <option value={optionValue}>{optionLabel}</option>
          })}
        </select>
      </label>
    )
  }
  const SelectItem = (props: any) => React.createElement('option', props)
  const Button = ({ onPress, onClick, isLoading, children, ...rest }: any) => (
    <button {...rest} onClick={onPress ?? onClick} aria-busy={isLoading}>
      {children}
    </button>
  )
  const DateRangePicker = ({ label, onChange }: any) => {
    const [start, setStart] = React.useState('')
    const [end, setEnd] = React.useState('')
    return (
      <div>
        <span>{label}</span>
        <input
          aria-label={`${label} start`}
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          aria-label={`${label} end`}
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <button
          onClick={() =>
            onChange?.(
              start && end
                ? {
                    start: { toString: () => start },
                    end: { toString: () => end },
                  }
                : null,
            )
          }
        >
          Apply
        </button>
      </div>
    )
  }
  const Card = ({ children }: any) => <div>{children}</div>
  const CardBody = ({ children }: any) => <div>{children}</div>
  const CardHeader = ({ children }: any) => <div>{children}</div>
  return { Select, SelectItem, Button, DateRangePicker, Card, CardBody, CardHeader }
})

vi.mock('react-icons/pi', () => ({ PiDownloadSimpleFill: () => null }))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

describe('ExportTransactions', () => {
  it('renders heading and default message with pluralization', () => {
    const onExport = vi.fn()
    render(
      <ExportTransactions
        transactions={[{ id: '1' }, { id: '2' }] as any}
        onExport={onExport}
      />,
    )

    expect(
      screen.getByText('Export Transactions'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Ready to export all 2 transactions'),
    ).toBeInTheDocument()
  })

  it('renders singular message when there is only one transaction', () => {
    const onExport = vi.fn()
    render(
      <ExportTransactions
        transactions={[{ id: '1' }] as any}
        onExport={onExport}
      />,
    )

    expect(
      screen.getByText('Ready to export all 1 transaction'),
    ).toBeInTheDocument()
  })

  it('exports CSV by default without date range', async () => {
    const onExport = vi.fn()
    const txs = [{ id: '1' }, { id: '2' }] as any

    render(<ExportTransactions transactions={txs} onExport={onExport} />)

    const exportBtn = screen.getByRole('button', { name: 'Export' })
    fireEvent.click(exportBtn)

    expect(onExport).not.toHaveBeenCalled()
    expect(generateCSV).toHaveBeenCalledTimes(1)
    expect(generateCSV).toHaveBeenCalledWith(txs)

    expect(getExportFilename).toHaveBeenCalledWith('csv')
    expect(getMimeType).toHaveBeenCalledWith('csv')
    expect(downloadFile).toHaveBeenCalledWith(
      'csv-content',
      'file.csv',
      'text/csv',
    )
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions')
  })

  it('switching format to JSON uses JSON utilities', async () => {
    const onExport = vi.fn()
    const txs = [{ id: '1' }] as any

    render(<ExportTransactions transactions={txs} onExport={onExport} />)

    const select = screen.getByLabelText('Export Format') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'json' } })

    const exportBtn = screen.getByRole('button', { name: 'Export' })
    fireEvent.click(exportBtn)

    expect(onExport).not.toHaveBeenCalled()
    expect(generateJSON).toHaveBeenCalledTimes(1)
    expect(generateJSON).toHaveBeenCalledWith(txs)
    expect(generateCSV).not.toHaveBeenCalled()

    expect(getExportFilename).toHaveBeenCalledWith('json')
    expect(getMimeType).toHaveBeenCalledWith('json')
    expect(downloadFile).toHaveBeenCalledWith(
      'json-content',
      'file.json',
      'application/json',
    )
    expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction')
  })

  it('sets date range, calls onExport with start/end and exports returned rows', async () => {
    const returned = [{ id: 'A' }, { id: 'B' }] as any
    const onExport = vi.fn().mockResolvedValue(returned)

    render(
      <ExportTransactions transactions={[{ id: '1' }] as any} onExport={onExport} />,
    )

    const startInput = screen.getByLabelText('Date Range (Optional) start')
    const endInput = screen.getByLabelText('Date Range (Optional) end')
    fireEvent.change(startInput, { target: { value: '2023-01-01' } })
    fireEvent.change(endInput, { target: { value: '2023-01-31' } })

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(
      screen.getByText(
        'Exporting transactions from 2023-01-01 to 2023-01-31',
      ),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
      expect(downloadFile).toHaveBeenCalled()
    })

    const [startDateArg, endDateArg] = onExport.mock.calls[0]
    expect(startDateArg).toBeInstanceOf(Date)
    expect(endDateArg).toBeInstanceOf(Date)

    expect(endDateArg.getHours()).toBe(23)
    expect(endDateArg.getMinutes()).toBe(59)
    expect(endDateArg.getSeconds()).toBe(59)
    expect(endDateArg.getMilliseconds()).toBe(999)

    expect(generateCSV).toHaveBeenCalledWith(returned)
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions')
  })

  it('shows toast error when there are no transactions to export and does not download', async () => {
    const onExport = vi.fn().mockResolvedValue([])

    render(
      <ExportTransactions transactions={[{ id: '1' }] as any} onExport={onExport} />,
    )

    const startInput = screen.getByLabelText('Date Range (Optional) start')
    const endInput = screen.getByLabelText('Date Range (Optional) end')
    fireEvent.change(startInput, { target: { value: '2023-02-01' } })
    fireEvent.change(endInput, { target: { value: '2023-02-02' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
    })

    expect(toast.error).toHaveBeenCalledWith('No transactions to export')
    expect(downloadFile).not.toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('handles export errors gracefully and logs error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onExport = vi.fn().mockRejectedValue(new Error('Network'))

    render(
      <ExportTransactions transactions={[{ id: '1' }] as any} onExport={onExport} />,
    )

    const startInput = screen.getByLabelText('Date Range (Optional) start')
    const endInput = screen.getByLabelText('Date Range (Optional) end')
    fireEvent.change(startInput, { target: { value: '2023-03-01' } })
    fireEvent.change(endInput, { target: { value: '2023-03-10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions')
    })

    expect(downloadFile).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('shows loading state during async export', async () => {
    const onExport = vi.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve([{ id: 'x' }]), 20)
        }),
    )

    render(
      <ExportTransactions transactions={[{ id: '1' }] as any} onExport={onExport} />,
    )

    const startInput = screen.getByLabelText('Date Range (Optional) start')
    const endInput = screen.getByLabelText('Date Range (Optional) end')
    fireEvent.change(startInput, { target: { value: '2023-04-01' } })
    fireEvent.change(endInput, { target: { value: '2023-04-05' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    const exportBtn = screen.getByRole('button', { name: 'Export' })
    fireEvent.click(exportBtn)

    expect(exportBtn).toHaveTextContent('Exporting...')

    await waitFor(() => {
      expect(exportBtn).toHaveTextContent('Export')
    })
  })
})
