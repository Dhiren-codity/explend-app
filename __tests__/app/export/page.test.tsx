import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import React from 'react'

const mockGetCachedAuthSession = vi.fn()
const mockGetCachedAllTransactions = vi.fn()
const mockGetTransactionsForExport = vi.fn()

vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: { EXPORT: 'Export' },
}))

vi.mock('../../../app/lib/actions', () => ({
  getCachedAuthSession: mockGetCachedAuthSession,
  getCachedAllTransactions: mockGetCachedAllTransactions,
  getTransactionsForExport: mockGetTransactionsForExport,
}))

vi.mock('../../../app/ui/no-transactions-plug', () => ({
  default: () => <div data-testid="no-transactions-plug">No transactions</div>,
}))

vi.mock('../../../app/ui/sidebar/with-sidebar', () => ({
  default: ({ contentNearby }: { contentNearby: React.ReactNode }) => (
    <div data-testid="with-sidebar">{contentNearby}</div>
  ),
}))

vi.mock('../../../app/ui/home/export-transactions', () => ({
  default: ({ transactions, onExport }: { transactions: any[]; onExport: (start?: Date, end?: Date) => Promise<any> }) => (
    <div data-testid="export-transactions">
      <span>ExportTransactions Component</span>
      <div data-testid="transactions-count">{transactions.length}</div>
      <button onClick={() => onExport(new Date('2020-01-01'), new Date('2020-01-31'))}>trigger-export</button>
    </div>
  ),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

beforeEach(() => {
  vi.resetModules()
})

describe('app/export/page', () => {
  it('renders NoTransactionsPlug when there are no transactions and calls data loaders correctly', async () => {
    const session = { user: { email: 'user@example.com' } }
    mockGetCachedAuthSession.mockResolvedValue(session)
    mockGetCachedAllTransactions.mockResolvedValue([])

    const { default: Page } = await import('../../../app/export/page')
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

  it('renders ExportTransactions when there are transactions and handleExport calls getTransactionsForExport with correct args', async () => {
    const session = { user: { email: 'user@example.com' } }
    mockGetCachedAuthSession.mockResolvedValue(session)
    mockGetCachedAllTransactions.mockResolvedValue([{ id: 't1' } as any])
    mockGetTransactionsForExport.mockResolvedValue([{ id: 'exported' } as any])

    const { default: Page } = await import('../../../app/export/page')
    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toBeInTheDocument()
    expect(screen.getByTestId('transactions-count').textContent).toBe('1')

    const trigger = screen.getByRole('button', { name: /trigger-export/i })
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(mockGetTransactionsForExport).toHaveBeenCalledTimes(1)
    })

    const [userIdArg, startArg, endArg] = mockGetTransactionsForExport.mock.calls[0]
    expect(userIdArg).toBe('user@example.com')
    expect(startArg).toBeInstanceOf(Date)
    expect(endArg).toBeInstanceOf(Date)
    expect((startArg as Date).toISOString()).toContain('2020-01-01')
    expect((endArg as Date).toISOString()).toContain('2020-01-31')

    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com')
  })
})
