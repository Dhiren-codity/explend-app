import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import React from 'react'

const getCachedAuthSession = vi.fn()
const getCachedAllTransactions = vi.fn()
const getTransactionsForExport = vi.fn()

vi.mock('../../../config/constants/navigation', () => ({
  __esModule: true,
  NAV_TITLE: { EXPORT: 'Export' },
}))

vi.mock('../../../app/lib/actions', () => ({
  __esModule: true,
  getCachedAuthSession,
  getCachedAllTransactions,
  getTransactionsForExport,
}))

vi.mock('../../../app/export/ui/no-transactions-plug', () => ({
  __esModule: true,
  default: () => <div data-testid="no-transactions">No transactions</div>,
}))

vi.mock('../../../app/export/ui/home/export-transactions', () => ({
  __esModule: true,
  default: ({ transactions, onExport }: { transactions: any[]; onExport: (start?: Date, end?: Date) => Promise<any> }) => (
    <div data-testid="export-transactions">
      <div>count: {transactions.length}</div>
      <button
        type="button"
        data-testid="export-btn"
        onClick={() => onExport(new Date('2024-01-10'), new Date('2024-02-20'))}
      >
        Trigger Export
      </button>
    </div>
  ),
}))

vi.mock('../../../app/export/ui/sidebar/with-sidebar', () => ({
  __esModule: true,
  default: ({ contentNearby }: { contentNearby: React.ReactNode }) => (
    <div data-testid="with-sidebar">{contentNearby}</div>
  ),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.resetModules()
})

describe('app/export/page', () => {
  const sessionMock = { user: { email: 'user@example.com' } }

  beforeEach(() => {
    getCachedAuthSession.mockResolvedValue(sessionMock)
    getCachedAllTransactions.mockResolvedValue([])
    getTransactionsForExport.mockResolvedValue([])
  })

  it('renders title and NoTransactionsPlug when there are no transactions', async () => {
    const { default: Page } = await import('../../../app/export/page')
    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions')).toBeInTheDocument()
    expect(screen.queryByTestId('export-transactions')).not.toBeInTheDocument()

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com')
  })

  it('renders ExportTransactions when transactions exist and calls onExport with userId and dates', async () => {
    const transactions = [{ id: 't1' }, { id: 't2' }]
    getCachedAllTransactions.mockResolvedValue(transactions)
    getTransactionsForExport.mockResolvedValue([{ id: 'export1' }])

    const { default: Page } = await import('../../../app/export/page')
    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.queryByTestId('no-transactions')).not.toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toBeInTheDocument()
    expect(screen.getByText('count: 2')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('export-btn'))

    expect(getTransactionsForExport).toHaveBeenCalledTimes(1)
    const [userIdArg, startDateArg, endDateArg] = getTransactionsForExport.mock.calls[0]

    expect(userIdArg).toBe('user@example.com')
    expect(startDateArg).toBeInstanceOf(Date)
    expect(endDateArg).toBeInstanceOf(Date)
    expect((startDateArg as Date).toISOString()).toBe('2024-01-10T00:00:00.000Z')
    expect((endDateArg as Date).toISOString()).toBe('2024-02-20T00:00:00.000Z')

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com')
  })
})
