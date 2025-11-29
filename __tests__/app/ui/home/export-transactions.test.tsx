import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024-01-31'),
  subMonths: vi.fn(() => new Date('2023-12-31T00:00:00.000Z')),
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@heroui/react', () => {
  const React = require('react')
  const Button = ({ children, onPress, isLoading }: any) => (
    <button onClick={onPress} disabled={isLoading}>{isLoading ? 'Exporting...' : children}</button>
  )
  const Card = ({ children }: any) => <div>{children}</div>
  const CardBody = ({ children }: any) => <div>{children}</div>
  const CardHeader = ({ children }: any) => <div>{children}</div>
  const Select = ({ label, selectedKeys, onChange, children }: any) => (
    <label>
      <span>{label}</span>
      <select
        aria-label={label}
        data-testid="export-format"
        defaultValue={selectedKeys?.[0]}
        onChange={(e) => onChange?.({ target: { value: (e.target as HTMLSelectElement).value } })}
      >
        {children}
      </select>
    </label>
  )
  const SelectItem = ({ children, value, key: keyProp }: any) => (
    <option value={value ?? keyProp}>{children}</option>
  )
  const DateRangePicker = ({ label, onChange }: any) => {
    const ReactLocal = React as typeof React
    const [start, setStart] = ReactLocal.useState('')
    const [end, setEnd] = ReactLocal.useState('')
    return (
      <div>
        <span>{label}</span>
        <input aria-label="start" placeholder="start" value={start} onChange={(e) => setStart((e.target as HTMLInputElement).value)} />
        <input aria-label="end" placeholder="end" value={end} onChange={(e) => setEnd((e.target as HTMLInputElement).value)} />
        <button onClick={() => onChange?.({ start: { toString: () => start }, end: { toString: () => end } })}>
          Apply Range
        </button>
      </div>
    )
  }
  return { Button, Card, CardBody, CardHeader, Select, SelectItem, DateRangePicker }
})

vi.mock('../../../../app/lib/export-utils', () => ({
  downloadFile: vi.fn(),
  generateCSV: vi.fn(() => 'csv-data'),
  generateJSON: vi.fn(() => 'json-data'),
  getExportFilename: vi.fn((fmt: string) => (fmt === 'csv' ? 'export.csv' : 'export.json')),
  getMimeType: vi.fn((fmt: string) => (fmt === 'csv' ? 'text/csv' : 'application/json')),
}))

import ExportTransactions from '../../../../app/ui/home/export-transactions'
import toast from 'react-hot-toast'
import * as utils from '../../../../app/lib/export-utils'

describe('ExportTransactions', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders heading and default info with transaction count', () => {
    const transactions = [{ id: '1' }, { id: '2' }] as any[]
    const onExport = vi.fn()

    render(<ExportTransactions transactions={transactions} onExport={onExport} />)

    expect(screen.getByText('Export Transactions')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    expect(
      screen.getByText('Ready to export all 2 transactions')
    ).toBeInTheDocument()
  })

  it('exports CSV using provided transactions when no date range is set', async () => {
    const transactions = [{ id: '1' }, { id: '2' }] as any[]
    const onExport = vi.fn()

    render(<ExportTransactions transactions={transactions} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(utils.generateCSV).toHaveBeenCalledWith(transactions)
    })
    expect(utils.generateJSON).not.toHaveBeenCalled()
    expect(utils.getExportFilename).toHaveBeenCalledWith('csv')
    expect(utils.getMimeType).toHaveBeenCalledWith('csv')
    expect(utils.downloadFile).toHaveBeenCalledWith('csv-data', 'export.csv', 'text/csv')
    expect(onExport).not.toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Exported 2 transactions')
  })

  it('applies date range, fetches via onExport, and exports JSON when format changed', async () => {
    const initialTransactions = [{ id: '1' }, { id: '2' }] as any[]
    const fetched = [{ id: '3' }] as any[]
    const onExport = vi.fn().mockResolvedValue(fetched)

    render(<ExportTransactions transactions={initialTransactions} onExport={onExport} />)

    // Change format to JSON
    const select = screen.getByTestId('export-format') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'json' } })

    // Set date range and apply
    fireEvent.change(screen.getByLabelText('start'), { target: { value: '2024-05-01' } })
    fireEvent.change(screen.getByLabelText('end'), { target: { value: '2024-05-31' } })
    fireEvent.click(screen.getByText('Apply Range'))

    // Verify info text reflects date range
    expect(
      screen.getByText('Exporting transactions from 2024-05-01 to 2024-05-31')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
    })

    const [startArg, endArg] = onExport.mock.calls[0]
    expect(startArg).toBeInstanceOf(Date)
    expect(endArg).toBeInstanceOf(Date)
    // Start date should match the provided start
    expect((startArg as Date).toISOString().slice(0, 10)).toBe('2024-05-01')
    // End date should be end of day
    const end = endArg as Date
    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
    expect(end.getSeconds()).toBe(59)
    expect(end.getMilliseconds()).toBe(999)

    expect(utils.generateJSON).toHaveBeenCalledWith(fetched)
    expect(utils.generateCSV).not.toHaveBeenCalled()
    expect(utils.getExportFilename).toHaveBeenCalledWith('json')
    expect(utils.getMimeType).toHaveBeenCalledWith('json')
    expect(utils.downloadFile).toHaveBeenCalledWith('json-data', 'export.json', 'application/json')
    expect(toast.success).toHaveBeenCalledWith('Exported 1 transaction')
  })

  it('shows error toast when onExport returns empty array for selected date range', async () => {
    const initialTransactions = [{ id: '1' }] as any[]
    const onExport = vi.fn().mockResolvedValue([])

    render(<ExportTransactions transactions={initialTransactions} onExport={onExport} />)

    fireEvent.change(screen.getByLabelText('start'), { target: { value: '2024-06-01' } })
    fireEvent.change(screen.getByLabelText('end'), { target: { value: '2024-06-15' } })
    fireEvent.click(screen.getByText('Apply Range'))

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No transactions to export')
    })

    expect(utils.generateCSV).not.toHaveBeenCalled()
    expect(utils.generateJSON).not.toHaveBeenCalled()
    expect(utils.downloadFile).not.toHaveBeenCalled()
  })

  it('handles export failure and shows error toast', async () => {
    const transactions = [{ id: '1' }, { id: '2' }] as any[]
    const onExport = vi.fn()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    ;(utils.downloadFile as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error('boom')
    })

    render(<ExportTransactions transactions={transactions} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to export transactions')
    })
    expect(errorSpy).toHaveBeenCalled()

    // Button should return to non-loading state
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()

    errorSpy.mockRestore()
  })
})
