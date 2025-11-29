import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>()
  const { vi: viLocal } = await import('vitest')
  return {
    ...actual,
    format: viLocal.fn(() => '2024-01-31'),
    subMonths: viLocal.fn(() => new Date('2023-12-31T00:00:00.000Z')),
  }
})

vi.mock('react-hot-toast', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hot-toast')>()
  const { vi: viLocal } = await import('vitest')
  const mockedDefault: any = {
    success: viLocal.fn(),
    error: viLocal.fn(),
  }
  return {
    ...actual,
    default: mockedDefault,
  }
})

vi.mock('@heroui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@heroui/react')>()
  const ReactMod: any = await import('react')
  const ReactLocal = ReactMod.default ?? ReactMod

  const Button = ({ children, onPress, isLoading }: any) =>
    ReactLocal.createElement(
      'button',
      { onClick: onPress, disabled: isLoading },
      isLoading ? 'Exporting...' : children
    )

  const Card = ({ children }: any) => ReactLocal.createElement('div', null, children)
  const CardBody = ({ children }: any) => ReactLocal.createElement('div', null, children)
  const CardHeader = ({ children }: any) => ReactLocal.createElement('div', null, children)

  const Select = ({ label, selectedKeys, onChange, onSelectionChange, children }: any) => {
    let initial: any = undefined
    if (selectedKeys instanceof Set) {
      initial = Array.from(selectedKeys)[0]
    } else if (Array.isArray(selectedKeys)) {
      initial = selectedKeys[0]
    } else if (selectedKeys) {
      initial = selectedKeys
    }
    return ReactLocal.createElement(
      'label',
      null,
      ReactLocal.createElement('span', null, label),
      ReactLocal.createElement(
        'select',
        {
          'aria-label': label,
          'data-testid': 'export-format',
          defaultValue: initial,
          onChange: (e: any) => {
            const value = (e.target as HTMLSelectElement).value
            onChange?.({ target: { value } })
            onSelectionChange?.(new Set([value]))
          },
        },
        children
      )
    )
  }

  const SelectItem = ({ children, value }: any) =>
    ReactLocal.createElement('option', { value }, children)

  const DateRangePicker = ({ label, onChange }: any) => {
    const [start, setStart] = ReactLocal.useState('')
    const [end, setEnd] = ReactLocal.useState('')
    return ReactLocal.createElement(
      'div',
      null,
      ReactLocal.createElement('span', null, label),
      ReactLocal.createElement('input', {
        'aria-label': 'start',
        placeholder: 'start',
        value: start,
        onChange: (e: any) => setStart((e.target as HTMLInputElement).value),
      }),
      ReactLocal.createElement('input', {
        'aria-label': 'end',
        placeholder: 'end',
        value: end,
        onChange: (e: any) => setEnd((e.target as HTMLInputElement).value),
      }),
      ReactLocal.createElement(
        'button',
        {
          onClick: () =>
            onChange?.({
              start: { toString: () => start },
              end: { toString: () => end },
            }),
        },
        'Apply Range'
      )
    )
  }

  return {
    ...actual,
    Button,
    Card,
    CardBody,
    CardHeader,
    Select,
    SelectItem,
    DateRangePicker,
  }
})

vi.mock('../../../../app/lib/export-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../app/lib/export-utils')>()
  const { vi: viLocal } = await import('vitest')
  return {
    ...actual,
    downloadFile: viLocal.fn(),
    generateCSV: viLocal.fn(() => 'csv-data'),
    generateJSON: viLocal.fn(() => 'json-data'),
    getExportFilename: viLocal.fn((fmt: string) => (fmt === 'csv' ? 'export.csv' : 'export.json')),
    getMimeType: viLocal.fn((fmt: string) => (fmt === 'csv' ? 'text/csv' : 'application/json')),
  }
})

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
    expect(screen.getByText('Ready to export all 2 transactions')).toBeInTheDocument()
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

    const select = screen.getByTestId('export-format') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'json' } })

    fireEvent.change(screen.getByLabelText('start'), { target: { value: '2024-05-01' } })
    fireEvent.change(screen.getByLabelText('end'), { target: { value: '2024-05-31' } })
    fireEvent.click(screen.getByText('Apply Range'))

    expect(
      screen.getByText('Exporting transactions from 2024-05-01 to 2024-05-31')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1)
    })

    const [startArg, endArg] = (onExport as any).mock.calls[0]
    expect(startArg).toBeInstanceOf(Date)
    expect(endArg).toBeInstanceOf(Date)
    expect((startArg as Date).toISOString().slice(0, 10)).toBe('2024-05-01')
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

    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()

    errorSpy.mockRestore()
  })
})