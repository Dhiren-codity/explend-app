import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React, { useEffect, useState } from 'react'

// Mock toast
const toastSuccess = vi.fn()
const toastError = vi.fn()
vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccess,
    error: toastError,
  },
}))

// Mock export utils
const generateCSV = vi.fn(() => 'csv-content')
const generateJSON = vi.fn(() => 'json-content')
const downloadFile = vi.fn()
const getExportFilename = vi.fn((format: string) => (format === 'json' ? 'export.json' : 'export.csv'))
const getMimeType = vi.fn((format: string) => (format === 'json' ? 'application/json' : 'text/csv'))

vi.mock('@/app/lib/export-utils', () => ({
  generateCSV,
  generateJSON,
  downloadFile,
  getExportFilename,
  getMimeType,
}))

// Mock @heroui/react with basic HTML equivalents
vi.mock('@heroui/react', async () => {
  const React = await import('react')
  type SelectProps = {
    label?: string
    selectedKeys?: string[]
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
    className?: string
    children?: React.ReactNode
  }
  const Select = ({ label, selectedKeys, onChange, className, children }: SelectProps) => {
    const options = React.Children.toArray(children).map((child: any, idx) => {
      const value = child?.props?.value ?? (typeof child?.key === 'string' ? child.key : String(idx))
      const content = child?.props?.children ?? String(value)
      return (
        <option key={String(value)} value={String(value)}>
          {content}
        </option>
      )
    })
    const id = `select-${label?.replace(/\s+/g, '-').toLowerCase() || Math.random().toString(36)}`
    return (
      <div className={className}>
        {label && <label htmlFor={id}>{label}</label>}
        <select aria-label={label} id={id} value={selectedKeys?.[0] ?? ''} onChange={onChange} data-testid="heroui-select">
          {options}
        </select>
      </div>
    )
  }
  const SelectItem = ({ children }: { children: React.ReactNode }) => <>{children}</>

  type DateRangePickerProps = {
    label?: string
    defaultValue?: { start: { toString(): string }; end: { toString(): string } }
    onChange?: (value: { start: { toString(): string }; end: { toString(): string } } | null) => void
    className?: string
  }

  const DateRangePicker = ({ label, defaultValue, onChange, className }: DateRangePickerProps) => {
    const [start, setStart] = React.useState(defaultValue?.start?.toString() ?? '')
    const [end, setEnd] = React.useState(defaultValue?.end?.toString() ?? '')

    useEffect(() => {
      if (defaultValue) {
        setStart(defaultValue.start?.toString() ?? '')
        setEnd(defaultValue.end?.toString() ?? '')
      }
    }, [defaultValue?.start, defaultValue?.end])

    useEffect(() => {
      if (onChange) {
        if (start && end) {
          onChange({
            start: { toString: () => start },
            end: { toString: () => end },
          })
        } else {
          onChange(null)
        }
      }
    }, [start, end])

    const startId = `drp-start-${label?.replace(/\s+/g, '-').toLowerCase() || Math.random().toString(36)}`
    const endId = `drp-end-${label?.replace(/\s+/g, '-').toLowerCase() || Math.random().toString(36)}`

    return (
      <div className={className}>
        {label && <div>{label}</div>}
        <label htmlFor={startId}>{label ? `${label} Start` : 'Start'}</label>
        <input
          id={startId}
          aria-label={label ? `${label} Start` : 'Start'}
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <label htmlFor={endId}>{label ? `${label} End` : 'End'}</label>
        <input id={endId} aria-label={label ? `${label} End` : 'End'} type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>
    )
  }

  const Button = ({
    children,
    onPress,
    isLoading,
    startContent,
    color,
    className,
  }: {
    children: React.ReactNode
    onPress?: () => void
    isLoading?: boolean
    startContent?: React.ReactNode
    color?: string
    className?: string
  }) => (
    <button
      type="button"
      onClick={onPress}
      disabled={!!isLoading}
      aria-busy={!!isLoading}
      data-color={color}
      className={className}
    >
      {!isLoading && startContent}
      {children}
    </button>
  )

  const Card = ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>
  const CardHeader = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  const CardBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  )

  return {
    Select,
    SelectItem,
    DateRangePicker,
    Button,
    Card,
    CardHeader,
    CardBody,
  }
})

// Import component under test
import ExportTransactions from '../../../../app/ui/home/export-transactions'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function deferred<T>() {
  let resolve: (value: T | PromiseLike<T>) => void
  let reject: (reason?: any) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  // @ts-expect-error - initialized above
  return { promise, resolve, reject }
}

describe('ExportTransactions', () => {
  it('renders header and default info', () => {
    render(<ExportTransactions transactions={[{ id: '1' }, { id: '2' }] as any} onExport={vi.fn()} />)
    expect(screen.getByText('Export Transactions')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument()
    const select = screen.getByLabelText('Export Format') as HTMLSelectElement
    expect(select.value).toBe('csv')
  })

  it('exports CSV by default without calling onExport when no date range', async () => {
    const onExport = vi.fn()
    render(<ExportTransactions transactions={[{ id: '1' }, { id: '2' }] as any} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(generateCSV).toHaveBeenCalledWith([{ id: '1' }, { id: '2' }])
    })
    expect(generateJSON).not.toHaveBeenCalled()
    expect(getExportFilename).toHaveBeenCalledWith('csv')
    expect(getMimeType).toHaveBeenCalledWith('csv')
    expect(downloadFile).toHaveBeenCalledWith('csv-content', 'export.csv', 'text/csv')
    expect(onExport).not.toHaveBeenCalled()
    expect(toastSuccess).toHaveBeenCalledWith('Exported 2 transactions')
  })

  it('switches format to JSON and exports JSON', async () => {
    render(<ExportTransactions transactions={[{ id: '1' }, { id: '2' }] as any} onExport={vi.fn()} />)
    const select = screen.getByLabelText('Export Format') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'json' } })

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(generateJSON).toHaveBeenCalledWith([{ id: '1' }, { id: '2' }])
    })
    expect(generateCSV).not.toHaveBeenCalled()
    expect(getExportFilename).toHaveBeenCalledWith('json')
    expect(getMimeType).toHaveBeenCalledWith('json')
    expect(downloadFile).toHaveBeenCalledWith('json-content', 'export.json', 'application/json')
    expect(toastSuccess).toHaveBeenCalledWith('Exported 2 transactions')
  })

  it('applies date range, calls onExport with dates, and uses returned transactions', async () => {
    const filtered = [{ id: '1' }]
    const onExport = vi.fn().mockResolvedValue(filtered as any)

    render(<ExportTransactions transactions={[{ id: '1' }, { id: '2' }] as any} onExport={onExport} />)

    const startInput = screen.getByLabelText('Date Range (Optional) Start') as HTMLInputElement
    const endInput = screen.getByLabelText('Date Range (Optional) End') as HTMLInputElement
    fireEvent.change(startInput, { target: { value: '2023-01-01' } })
    fireEvent.change(endInput, { target: { value: '2023-01-31' } })

    // Info text updates
    expect(await screen.findByText('Exporting transactions from 2023-01-01 to 2023-01-31')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
    })

    const [startArg, endArg] = onExport.mock.calls[0] as [Date, Date]
    expect(startArg).toBeInstanceOf(Date)
    expect(endArg).toBeInstanceOf(Date)
    expect(startArg.getFullYear()).toBe(2023)
    expect(startArg.getMonth()).toBe(0)
    expect(startArg.getDate()).toBe(1)
    expect(endArg.getHours()).toBe(23)
    expect(endArg.getMinutes()).toBe(59)
    expect(endArg.getSeconds()).toBe(59)
    expect(endArg.getMilliseconds()).toBe(999)

    await waitFor(() => {
      expect(generateCSV).toHaveBeenCalledWith(filtered)
    })
    expect(toastSuccess).toHaveBeenCalledWith('Exported 1 transaction')
  })

  it('shows error toast when no transactions to export', async () => {
    render(<ExportTransactions transactions={[]} onExport={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith('No transactions to export')
    })
    expect(downloadFile).not.toHaveBeenCalled()
    expect(generateCSV).not.toHaveBeenCalled()
    expect(generateJSON).not.toHaveBeenCalled()
  })

  it('handles export error and resets loading state', async () => {
    // Make CSV generation throw
    generateCSV.mockImplementationOnce(() => {
      throw new Error('boom')
    })

    render(<ExportTransactions transactions={[{ id: '1' }] as any} onExport={vi.fn()} />)
    const button = screen.getByRole('button', { name: 'Export' })

    fireEvent.click(button)

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith('Failed to export transactions')
    })

    // Not stuck in loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    })
  })

  it('disables button and shows loading while exporting (date range triggers async)', async () => {
    const def = deferred<any[]>()
    const onExport = vi.fn(() => def.promise)

    render(<ExportTransactions transactions={[{ id: '1' }, { id: '2' }] as any} onExport={onExport} />)

    const startInput = screen.getByLabelText('Date Range (Optional) Start') as HTMLInputElement
    const endInput = screen.getByLabelText('Date Range (Optional) End') as HTMLInputElement
    fireEvent.change(startInput, { target: { value: '2024-05-01' } })
    fireEvent.change(endInput, { target: { value: '2024-05-31' } })

    const button = screen.getByRole('button', { name: 'Export' })
    fireEvent.click(button)

    // While pending
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Exporting...' })).toBeDisabled()
    })

    // Resolve export
    def.resolve([{ id: '1' }] as any)

    await waitFor(() => {
      expect(downloadFile).toHaveBeenCalled()
    })

    // Back to idle
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled()
    })
  })
})
