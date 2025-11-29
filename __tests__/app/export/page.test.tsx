import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'

vi.mock('../../../config/constants/navigation', () => ({
  __esModule: true,
  NAV_TITLE: { EXPORT: 'Export' },
}))

vi.mock('date-fns', () => ({
  __esModule: true,
  format: vi.fn(() => '2024-01-01'),
  subMonths: vi.fn(() => new Date('2024-01-01')),
}))

vi.mock('react-use', async (importOriginal) => {
  const actual = await importOriginal<any>('react-use')
  return {
    __esModule: true,
    ...actual,
    useMedia: vi.fn(() => false),
    useHover: vi.fn(() => [undefined, false]),
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

    expect(screen.getByRole('heading', { name: 'Export' })).toBeTruthy()
    expect(screen.getByTestId('with-sidebar')).toBeTruthy()
    expect(screen.getByTestId('no-transactions')).toBeTruthy()
    expect(screen.queryByTestId('export-transactions')).toBeNull()

    expect(actions.getCachedAuthSession).toHaveBeenCalled()
    expect(actions.getCachedAllTransactions).toHaveBeenCalledWith('user@example.com')
  })

  it('renders ExportTransactions when transactions exist and calls onExport with userId and dates', async () => {
    const transactions = [{ id: 't1' }, { id: 't2' }]
    actions.getCachedAllTransactions.mockResolvedValue(transactions)
    actions.getTransactionsForExport.mockResolvedValue([{ id: 'export1' }])

    const { default: Page } = await import('../../../app/export/page')
    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeTruthy()
    expect(screen.queryByTestId('no-transactions')).toBeNull()
    expect(screen.getByTestId('export-transactions')).toBeTruthy()
    expect(screen.getByText('count: 2')).toBeTruthy()

    fireEvent.click(screen.getByTestId('export-btn'))

    expect(actions.getTransactionsForExport).toHaveBeenCalled()
    const [userIdArg, startDateArg, endDateArg] = actions.getTransactionsForExport.mock.calls[0]

    expect(userIdArg).toBe('user@example.com')
    expect(startDateArg).toBeInstanceOf(Date)
    expect(endDateArg).toBeInstanceOf(Date)
    expect((startDateArg as Date).toISOString()).toBe('2024-01-10T00:00:00.000Z')
    expect((endDateArg as Date).toISOString()).toBe('2024-02-20T00:00:00.000Z')

    expect(actions.getCachedAuthSession).toHaveBeenCalled()
    expect(actions.getCachedAllTransactions).toHaveBeenCalledWith('user@example.com')
  })
})