import { describe, it, expect, vi, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: { EXPORT: 'Export' },
}))

vi.mock('app/export/lib/actions', () => {
  return {
    getCachedAllTransactions: vi.fn(),
    getCachedAuthSession: vi.fn(),
    getTransactionsForExport: vi.fn(),
  }
})

let lastExportTransactionsProps: any = null
vi.mock('app/export/ui/home/export-transactions', () => {
  return {
    __getLastProps: () => lastExportTransactionsProps,
    default: (props: any) => {
      lastExportTransactionsProps = props
      return (
        <div data-testid="export-transactions">
          MockExportTransactions ({Array.isArray(props.transactions) ? props.transactions.length : 'no'} items)
        </div>
      )
    },
  }
})

vi.mock('app/export/ui/no-transactions-plug', () => {
  return {
    default: () => <div data-testid="no-transactions-plug">NoTransactionsPlug</div>,
  }
})

vi.mock('app/export/ui/sidebar/with-sidebar', () => {
  return {
    default: ({ contentNearby }: { contentNearby: React.ReactNode }) => (
      <div data-testid="with-sidebar">{contentNearby}</div>
    ),
  }
})

import Page, { metadata } from 'app/export/page'
import {
  getCachedAllTransactions,
  getCachedAuthSession,
  getTransactionsForExport,
} from 'app/export/lib/actions'

// helper to get the last props passed to mocked ExportTransactions
const getLastExportTransactionsProps = async () => {
  const mod: any = await import('app/export/ui/home/export-transactions')
  return mod.__getLastProps()
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('app/export/page', () => {
  it('exports correct metadata', () => {
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Export')
  })

  it('renders heading and NoTransactionsPlug when there are no transactions', async () => {
    ;(getCachedAuthSession as any).mockResolvedValue({ user: { email: 'user@example.com' } })
    ;(getCachedAllTransactions as any).mockResolvedValue([])

    const ui = await Page()
    render(ui)

    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument()
    expect(screen.queryByTestId('export-transactions')).not.toBeInTheDocument()

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect((getCachedAllTransactions as any).mock.calls[0][0]).toBe('user@example.com')
    expect((getCachedAllTransactions as any).mock.calls[1][0]).toBe('user@example.com')
  })

  it('renders ExportTransactions when transactions exist and passes props', async () => {
    const transactions = [
      { id: 't1', amount: 10 },
      { id: 't2', amount: 20 },
    ]
    ;(getCachedAuthSession as any).mockResolvedValue({ user: { email: 'user@example.com' } })
    ;(getCachedAllTransactions as any).mockResolvedValue(transactions)

    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toBeInTheDocument()
    expect(screen.queryByTestId('no-transactions-plug')).not.toBeInTheDocument()

    const props = await getLastExportTransactionsProps()
    expect(Array.isArray(props.transactions)).toBe(true)
    expect(props.transactions).toEqual(transactions)
    expect(typeof props.onExport).toBe('function')

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2)
  })

  it('onExport calls getTransactionsForExport with date range and returns data', async () => {
    const transactions = [{ id: 't3', amount: 30 }]
    ;(getCachedAuthSession as any).mockResolvedValue({ user: { email: 'user@example.com' } })
    ;(getCachedAllTransactions as any).mockResolvedValue(transactions)

    const exported = [{ id: 'e1', amount: 30 }]
    ;(getTransactionsForExport as any).mockResolvedValue(exported)

    const ui = await Page()
    render(ui)

    const props = await getLastExportTransactionsProps()
    const start = new Date('2023-01-01T00:00:00.000Z')
    const end = new Date('2023-12-31T23:59:59.999Z')

    const result = await props.onExport(start, end)

    expect(getTransactionsForExport).toHaveBeenCalledTimes(1)
    expect((getTransactionsForExport as any).mock.calls[0][0]).toBe('user@example.com')
    expect((getTransactionsForExport as any).mock.calls[0][1]).toEqual(start)
    expect((getTransactionsForExport as any).mock.calls[0][2]).toEqual(end)
    expect(result).toEqual(exported)
  })

  it('onExport supports being called without dates', async () => {
    const transactions = [{ id: 't4', amount: 40 }]
    ;(getCachedAuthSession as any).mockResolvedValue({ user: { email: 'user@example.com' } })
    ;(getCachedAllTransactions as any).mockResolvedValue(transactions)

    const exported = [{ id: 'e2', amount: 40 }]
    ;(getTransactionsForExport as any).mockResolvedValue(exported)

    const ui = await Page()
    render(ui)

    const props = await getLastExportTransactionsProps()
    const result = await props.onExport()

    expect(getTransactionsForExport).toHaveBeenCalledTimes(1)
    expect((getTransactionsForExport as any).mock.calls[0][0]).toBe('user@example.com')
    expect((getTransactionsForExport as any).mock.calls[0][1]).toBeUndefined()
    expect((getTransactionsForExport as any).mock.calls[0][2]).toBeUndefined()
    expect(result).toEqual(exported)
  })
})
