import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

vi.mock('../../../config/constants/navigation', () => ({
  __esModule: true,
  NAV_TITLE: { EXPORT: 'Export' },
}))

vi.mock('date-fns', async (importOriginal) => {
  const original = await importOriginal<any>('date-fns')
  return {
    __esModule: true,
    ...original,
  }
})

vi.mock('../../../app/lib/actions', () => {
  const getCachedAuthSession = vi.fn()
  const getCachedAllTransactions = vi.fn()
  const getTransactionsForExport = vi.fn()
  return {
    __esModule: true,
    getCachedAuthSession,
    getCachedAllTransactions,
    getTransactionsForExport,
  }
})

vi.mock('../../../app/export/ui/no-transactions-plug', async (importOriginal) => {
  const React = await importOriginal<any>('react')
  return {
    __esModule: true,
    default: () => React.createElement('div', { 'data-testid': 'no-transactions' }, 'No transactions'),
  }
})

vi.mock('../../../app/export/ui/home/export-transactions', async (importOriginal) => {
  const React = await importOriginal<any>('react')
  return {
    __esModule: true,
    default: ({ transactions, onExport }: any) =>
      React.createElement(
        'div',
        { 'data-testid': 'export-transactions' },
        React.createElement('div', null, `count: ${transactions.length}`),
        React.createElement('button', {
          type: 'button',
          'data-testid': 'export-btn',
          onClick: () => onExport(new Date('2024-01-10'), new Date('2024-02-20')),
          children: 'Trigger Export',
        })
      ),
  }
})

vi.mock('../../../app/export/ui/sidebar/with-sidebar', async (importOriginal) => {
  const React = await importOriginal<any>('react')
  return {
    __esModule: true,
    default: ({ contentNearby }: any) => React.createElement('div', { 'data-testid': 'with-sidebar' }, contentNearby),
  }
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.resetModules()
})

describe('app/export/page', () => {
  let actions: any
  const sessionMock = { user: { email: 'user@example.com' } }

  beforeEach(async () => {
    actions = await import('../../../app/lib/actions')
    actions.getCachedAuthSession.mockResolvedValue(sessionMock)
    actions.getCachedAllTransactions.mockResolvedValue([])
    actions.getTransactionsForExport.mockResolvedValue([])
  })

  it('renders title and NoTransactionsPlug when there are no transactions', async () => {
    const { default: Page } = await import('../../../app/export/page')
    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions')).toBeInTheDocument()
    expect(screen.queryByTestId('export-transactions')).not.toBeInTheDocument()

    expect(actions.getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(actions.getCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(actions.getCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
    expect(actions.getCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com')
  })

  it('renders ExportTransactions when transactions exist and calls onExport with userId and dates', async () => {
    const transactions = [{ id: 't1' }, { id: 't2' }]
    actions.getCachedAllTransactions.mockResolvedValue(transactions)
    actions.getTransactionsForExport.mockResolvedValue([{ id: 'export1' }])

    const { default: Page } = await import('../../../app/export/page')
    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.queryByTestId('no-transactions')).not.toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toBeInTheDocument()
    expect(screen.getByText('count: 2')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('export-btn'))

    expect(actions.getTransactionsForExport).toHaveBeenCalledTimes(1)
    const [userIdArg, startDateArg, endDateArg] = actions.getTransactionsForExport.mock.calls[0]

    expect(userIdArg).toBe('user@example.com')
    expect(startDateArg).toBeInstanceOf(Date)
    expect(endDateArg).toBeInstanceOf(Date)
    expect((startDateArg as Date).toISOString()).toBe('2024-01-10T00:00:00.000Z')
    expect((endDateArg as Date).toISOString()).toBe('2024-02-20T00:00:00.000Z')

    expect(actions.getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(actions.getCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(actions.getCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
    expect(actions.getCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com')
  })
})