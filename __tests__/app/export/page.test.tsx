import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

const mockGetCachedAuthSession = vi.fn()
const mockGetCachedAllTransactions = vi.fn()
const mockGetTransactionsForExport = vi.fn()

vi.mock('../../../app/lib/actions', () => ({
  __esModule: true,
  getCachedAuthSession: mockGetCachedAuthSession,
  getCachedAllTransactions: mockGetCachedAllTransactions,
  getTransactionsForExport: mockGetTransactionsForExport,
}))

vi.mock('@/config/constants/navigation', () => ({
  __esModule: true,
  NAV_TITLE: {
    EXPORT: 'Export',
  },
}))

vi.mock('../../../app/ui/sidebar/with-sidebar', () => ({
  __esModule: true,
  default: ({ contentNearby }: { contentNearby: React.ReactNode }) => (
    <div data-testid="with-sidebar">{contentNearby}</div>
  ),
}))

vi.mock('../../../app/ui/no-transactions-plug', () => ({
  __esModule: true,
  default: () => <div data-testid="no-transactions-plug">No transactions</div>,
}))

vi.mock('../../../app/ui/home/export-transactions', () => ({
  __esModule: true,
  default: ({ transactions }: { transactions: any[]; onExport: (a?: Date, b?: Date) => Promise<any[]> }) => (
    <div data-testid="export-transactions">count: {transactions?.length ?? 0}</div>
  ),
}))

import Page from '../../../app/export/page'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('app/export/page', () => {
  it('renders heading and NoTransactionsPlug when there are no transactions', async () => {
    mockGetCachedAuthSession.mockResolvedValue({ user: { email: 'user@example.com' } })
    mockGetCachedAllTransactions.mockResolvedValue([])

    const ui = await Page()
    render(ui as unknown as React.ReactElement)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument()
    expect(screen.queryByTestId('export-transactions')).not.toBeInTheDocument()

    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com')
  })

  it('renders ExportTransactions when transactions exist', async () => {
    mockGetCachedAuthSession.mockResolvedValue({ user: { email: 'abc@x.com' } })
    mockGetCachedAllTransactions.mockResolvedValue([{ id: 't1' }, { id: 't2' }])

    const ui = await Page()
    render(ui as unknown as React.ReactElement)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toHaveTextContent('count: 2')
    expect(screen.queryByTestId('no-transactions-plug')).not.toBeInTheDocument()

    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(1, 'abc@x.com')
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(2, 'abc@x.com')
  })

  it('passes undefined userId to data fetch when session has no email', async () => {
    mockGetCachedAuthSession.mockResolvedValue(undefined)
    mockGetCachedAllTransactions.mockResolvedValue([])

    const ui = await Page()
    render(ui as unknown as React.ReactElement)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument()

    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(1, undefined)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(2, undefined)
  })
})
