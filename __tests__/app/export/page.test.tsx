import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

const mockGetCachedAuthSession = vi.fn()
const mockGetCachedAllTransactions = vi.fn()
const mockGetTransactionsForExport = vi.fn()

vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: { EXPORT: 'Export' },
}))

vi.mock('../lib/actions', () => ({
  getCachedAuthSession: mockGetCachedAuthSession,
  getCachedAllTransactions: mockGetCachedAllTransactions,
  getTransactionsForExport: mockGetTransactionsForExport,
}))

vi.mock('../ui/sidebar/with-sidebar', () => ({
  default: ({ contentNearby }: { contentNearby: React.ReactNode }) => (
    <div data-testid="with-sidebar">{contentNearby}</div>
  ),
}))

vi.mock('../ui/home/export-transactions', () => ({
  default: ({
    transactions,
    onExport,
  }: {
    transactions: any[]
    onExport?: (start?: Date, end?: Date) => Promise<any[]>
  }) => (
    <div data-testid="export-transactions">
      <div>ExportTransactions Component</div>
      <div data-testid="tx-count">{transactions?.length ?? -1}</div>
      <button
        type="button"
        onClick={() =>
          onExport?.(new Date('2020-01-01T00:00:00.000Z'), new Date('2020-12-31T00:00:00.000Z'))
        }
      >
        Trigger Export
      </button>
    </div>
  ),
}))

vi.mock('../ui/no-transactions-plug', () => ({
  default: () => <div data-testid="no-transactions-plug">No Transactions</div>,
}))

import Page, { metadata } from '../../../app/export/page'

describe('app/export/page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCachedAuthSession.mockResolvedValue({ user: { email: 'user@example.com' } })
    mockGetCachedAllTransactions.mockResolvedValue([])
    mockGetTransactionsForExport.mockResolvedValue([])
  })

  afterEach(() => {
    cleanup()
  })

  it('exports metadata with correct title', () => {
    expect(metadata.title).toBe('Export')
  })

  it('renders heading and NoTransactionsPlug when there are no transactions', async () => {
    mockGetCachedAllTransactions.mockResolvedValueOnce([]).mockResolvedValueOnce([])

    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument()
    expect(screen.queryByTestId('export-transactions')).not.toBeInTheDocument()

    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com')
  })

  it('renders ExportTransactions when transactions exist and handles export with userId', async () => {
    const transactions = [{ id: 't1' }, { id: 't2' }]
    mockGetCachedAllTransactions.mockResolvedValueOnce(transactions).mockResolvedValueOnce(transactions)
    mockGetCachedAuthSession.mockResolvedValue({ user: { email: 'abc@x.com' } })

    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toBeInTheDocument()
    expect(screen.getByTestId('tx-count')).toHaveTextContent('2')
    expect(screen.queryByTestId('no-transactions-plug')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /trigger export/i }))

    await waitFor(() => {
      expect(mockGetTransactionsForExport).toHaveBeenCalledTimes(1)
    })

    const [userIdArg, startArg, endArg] = mockGetTransactionsForExport.mock.calls[0]
    expect(userIdArg).toBe('abc@x.com')
    expect(startArg).toEqual(new Date('2020-01-01T00:00:00.000Z'))
    expect(endArg).toEqual(new Date('2020-12-31T00:00:00.000Z'))

    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2)
  })

  it('passes undefined userId to actions when session is missing', async () => {
    mockGetCachedAuthSession.mockResolvedValue(undefined)
    const transactions = [{ id: 't1' }]
    mockGetCachedAllTransactions.mockResolvedValueOnce(transactions).mockResolvedValueOnce(transactions)

    const ui = await Page()
    render(ui)

    expect(screen.getByTestId('export-transactions')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /trigger export/i }))

    await waitFor(() => {
      expect(mockGetTransactionsForExport).toHaveBeenCalledTimes(1)
    })

    const [userIdArg] = mockGetTransactionsForExport.mock.calls[0]
    expect(userIdArg).toBeUndefined()

    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(1, undefined)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(2, undefined)
  })
})
