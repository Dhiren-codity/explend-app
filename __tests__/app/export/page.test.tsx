import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

const mockGetCachedAuthSession = vi.fn()
const mockGetCachedAllTransactions = vi.fn()
const mockGetTransactionsForExport = vi.fn()

vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: { EXPORT: 'Export' },
}))

vi.mock('../../../app/export/lib/actions', () => ({
  getCachedAuthSession: mockGetCachedAuthSession,
  getCachedAllTransactions: mockGetCachedAllTransactions,
  getTransactionsForExport: mockGetTransactionsForExport,
}))

vi.mock('../../../app/export/ui/sidebar/with-sidebar', () => ({
  __esModule: true,
  default: ({ contentNearby }: { contentNearby: React.ReactNode }) => (
    <div data-testid="with-sidebar">{contentNearby}</div>
  ),
}))

vi.mock('../../../app/export/ui/no-transactions-plug', () => ({
  __esModule: true,
  default: () => <div data-testid="no-transactions-plug">No Transactions</div>,
}))

vi.mock('../../../app/export/ui/home/export-transactions', () => ({
  __esModule: true,
  default: ({
    transactions,
    onExport,
  }: {
    transactions: any[]
    onExport: (startDate?: Date, endDate?: Date) => Promise<any[]>
  }) => (
    <div data-testid="export-transactions">
      <div>ExportTransactions</div>
      <div data-testid="tx-count">{transactions?.length ?? 0}</div>
      <button
        type="button"
        onClick={() =>
          onExport(new Date('2020-01-01'), new Date('2020-01-31'))
        }
      >
        trigger-export
      </button>
    </div>
  ),
}))

import Page, { metadata } from '../../../app/export/page'

describe('app/export/page', () => {
  beforeEach(() => {
    mockGetCachedAuthSession.mockReset()
    mockGetCachedAllTransactions.mockReset()
    mockGetTransactionsForExport.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('exports correct metadata title', () => {
    expect(metadata.title).toBe('Export')
  })

  it('renders NoTransactionsPlug when there are no transactions', async () => {
    mockGetCachedAuthSession.mockResolvedValue({ user: { email: 'user@example.com' } })
    mockGetCachedAllTransactions.mockResolvedValue([])

    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument()

    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com')
  })

  it('renders ExportTransactions when transactions exist and calls onExport with dates and userId', async () => {
    const userId = 'user@example.com'
    mockGetCachedAuthSession.mockResolvedValue({ user: { email: userId } })
    mockGetCachedAllTransactions.mockResolvedValue([{ id: 't1' }])
    mockGetTransactionsForExport.mockResolvedValue([{ id: 'exported' }])

    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.queryByTestId('no-transactions-plug')).not.toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toBeInTheDocument()
    expect(screen.getByTestId('tx-count')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: /trigger-export/i }))

    expect(mockGetTransactionsForExport).toHaveBeenCalledTimes(1)
    const [calledUserId, startDate, endDate] = mockGetTransactionsForExport.mock.calls[0]
    expect(calledUserId).toBe(userId)
    expect(startDate).toBeInstanceOf(Date)
    expect(endDate).toBeInstanceOf(Date)
    expect((startDate as Date).toISOString()).toBe('2020-01-01T00:00:00.000Z')
    expect((endDate as Date).toISOString()).toBe('2020-01-31T00:00:00.000Z')

    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(1, userId)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(2, userId)
  })
})
