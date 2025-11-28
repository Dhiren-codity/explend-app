import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

const actionsMocks = {
  getCachedAuthSession: vi.fn(),
  getCachedAllTransactions: vi.fn(),
  getTransactionsForExport: vi.fn(),
}

// Mock navigation constants with alias path
vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: { EXPORT: 'Export' },
}))

// Mock UI components used by the page
vi.mock('../../../app/ui/sidebar/with-sidebar', () => ({
  __esModule: true,
  default: ({ contentNearby }: { contentNearby: React.ReactNode }) => (
    <div data-testid="with-sidebar">{contentNearby}</div>
  ),
}))

vi.mock('../../../app/ui/no-transactions-plug', () => ({
  __esModule: true,
  default: () => <div data-testid="no-transactions-plug">No Transactions</div>,
}))

vi.mock('../../../app/ui/home/export-transactions', () => ({
  __esModule: true,
  default: ({
    transactions,
    onExport,
  }: {
    transactions: any[]
    onExport: (start?: Date, end?: Date) => Promise<any[]>
  }) => (
    <div data-testid="export-transactions">
      <div>transactions-count:{transactions?.length ?? 0}</div>
      <button
        type="button"
        onClick={() =>
          onExport(
            new Date('2020-01-01T00:00:00.000Z'),
            new Date('2020-02-01T00:00:00.000Z'),
          )
        }
      >
        trigger-export
      </button>
    </div>
  ),
}))

// Mock server actions used by the page
vi.mock('../../../app/lib/actions', () => ({
  __esModule: true,
  getCachedAuthSession: actionsMocks.getCachedAuthSession,
  getCachedAllTransactions: actionsMocks.getCachedAllTransactions,
  getTransactionsForExport: actionsMocks.getTransactionsForExport,
}))

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  actionsMocks.getCachedAuthSession.mockReset()
  actionsMocks.getCachedAllTransactions.mockReset()
  actionsMocks.getTransactionsForExport.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('app/export/page', () => {
  it('renders title and NoTransactionsPlug when there are no transactions', async () => {
    actionsMocks.getCachedAuthSession.mockResolvedValue({
      user: { email: 'user@example.com' },
    })
    actionsMocks.getCachedAllTransactions.mockResolvedValue([])
    actionsMocks.getTransactionsForExport.mockResolvedValue([])

    const { default: Page } = await import('../../../app/export/page')
    const ui = await Page()
    render(ui as unknown as React.ReactElement)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument()
    expect(screen.queryByTestId('export-transactions')).not.toBeInTheDocument()

    expect(actionsMocks.getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(actionsMocks.getCachedAllTransactions).toHaveBeenCalledTimes(2)
    const allTransactionsCalls = actionsMocks.getCachedAllTransactions.mock.calls
    expect(allTransactionsCalls[0][0]).toBe('user@example.com')
    expect(allTransactionsCalls[1][0]).toBe('user@example.com')
  })

  it('renders ExportTransactions when transactions exist and wires onExport correctly', async () => {
    const userId = 'user@example.com'
    const transactions = [
      { id: 't1', amount: 10 },
      { id: 't2', amount: 20 },
    ]
    actionsMocks.getCachedAuthSession.mockResolvedValue({
      user: { email: userId },
    })
    actionsMocks.getCachedAllTransactions.mockResolvedValue(transactions)
    actionsMocks.getTransactionsForExport.mockResolvedValue(transactions)

    const { default: Page } = await import('../../../app/export/page')
    const ui = await Page()
    render(ui as unknown as React.ReactElement)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.queryByTestId('no-transactions-plug')).not.toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toBeInTheDocument()
    expect(screen.getByText('transactions-count:2')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'trigger-export' }))

    await waitFor(() => {
      expect(actionsMocks.getTransactionsForExport).toHaveBeenCalledTimes(1)
    })

    const call = actionsMocks.getTransactionsForExport.mock.calls[0]
    expect(call[0]).toBe(userId)
    expect(call[1]).toBeInstanceOf(Date)
    expect(call[2]).toBeInstanceOf(Date)
    expect((call[1] as Date).toISOString()).toBe('2020-01-01T00:00:00.000Z')
    expect((call[2] as Date).toISOString()).toBe('2020-02-01T00:00:00.000Z')

    expect(actionsMocks.getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(actionsMocks.getCachedAllTransactions).toHaveBeenCalledTimes(2)
  })
})
