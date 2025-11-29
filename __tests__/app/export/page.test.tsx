import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024-01-01'),
  subMonths: vi.fn(() => new Date()),
}))

vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: { EXPORT: 'Export' },
}))

vi.mock('@/app/export/lib/actions', () => ({
  getCachedAllTransactions: vi.fn(),
  getCachedAuthSession: vi.fn(),
  getTransactionsForExport: vi.fn(),
}))

vi.mock('@/app/export/ui/home/export-transactions', () => {
  let lastProps: any
  const Comp = (props: any) => {
    lastProps = props
    return <div data-testid="export-transactions">{props.transactions?.length} items</div>
  }
  return {
    __esModule: true,
    default: Comp,
    __mock: {
      getLastProps: () => lastProps,
    },
  }
})

vi.mock('@/app/export/ui/no-transactions-plug', () => ({
  __esModule: true,
  default: () => <div data-testid="no-transactions-plug">No transactions</div>,
}))

vi.mock('@/app/export/ui/sidebar/with-sidebar', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="with-sidebar">{props.contentNearby}</div>,
}))

import Page, { metadata } from '@/app/export/page'
import {
  getCachedAllTransactions,
  getCachedAuthSession,
  getTransactionsForExport,
} from '@/app/export/lib/actions'
import { __mock as exportTransactionsMock } from '@/app/export/ui/home/export-transactions'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('app/export/page', () => {
  it('exports metadata with correct title', () => {
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Export')
  })

  it('renders NoTransactionsPlug when there are no transactions', async () => {
    ;(getCachedAuthSession as unknown as vi.Mock).mockResolvedValue({
      user: { email: 'john@example.com' },
    })
    ;(getCachedAllTransactions as unknown as vi.Mock).mockResolvedValue([])

    const ui = await Page()
    render(ui)

    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument()
    expect(screen.queryByTestId('export-transactions')).not.toBeInTheDocument()

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, 'john@example.com')
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(2, 'john@example.com')
  })

  it('renders ExportTransactions when transactions exist and onExport calls server action', async () => {
    const userEmail = 'user@example.com'
    const transactions = [{ id: 't1' }]
    const exported = [{ id: 'tX' }]

    ;(getCachedAuthSession as unknown as vi.Mock).mockResolvedValue({
      user: { email: userEmail },
    })
    ;(getCachedAllTransactions as unknown as vi.Mock).mockResolvedValue(transactions)
    ;(getTransactionsForExport as unknown as vi.Mock).mockResolvedValue(exported)

    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { level: 1, name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toHaveTextContent('1 items')
    expect(screen.queryByTestId('no-transactions-plug')).not.toBeInTheDocument()

    const exportTransactionsProps = exportTransactionsMock.getLastProps()
    expect(exportTransactionsProps).toBeDefined()
    expect(Array.isArray(exportTransactionsProps.transactions)).toBe(true)
    expect(exportTransactionsProps.transactions.length).toBe(1)
    expect(typeof exportTransactionsProps.onExport).toBe('function')

    const start = new Date('2024-01-01T00:00:00.000Z')
    const end = new Date('2024-01-31T23:59:59.999Z')
    const result = await exportTransactionsProps.onExport(start, end)

    expect(getTransactionsForExport).toHaveBeenCalledTimes(1)
    expect(getTransactionsForExport).toHaveBeenCalledWith(userEmail, start, end)
    expect(result).toEqual(exported)

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, userEmail)
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(2, userEmail)
  })
})