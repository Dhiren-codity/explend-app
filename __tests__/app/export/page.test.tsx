import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024-01-01'),
  subMonths: vi.fn(() => new Date('2024-01-01')),
}))

vi.mock('react-use', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-use')>()
  return { ...actual, useMedia: vi.fn() }
})

vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: { EXPORT: 'Export' },
}))

vi.mock('../../app/export/lib/actions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../app/export/lib/actions')>()
  return {
    ...actual,
    getCachedAuthSession: vi.fn(),
    getCachedAllTransactions: vi.fn(),
    getTransactionsForExport: vi.fn(),
  }
})

vi.mock('../../app/export/ui/no-transactions-plug', () => ({
  __esModule: true,
  default: () => <div data-testid="no-transactions-plug">No transactions</div>,
}))

vi.mock('../../app/export/ui/home/export-transactions', () => ({
  __esModule: true,
  default: (props: { transactions: any[]; onExport?: (start?: Date, end?: Date) => Promise<any[]> }) => (
    <div data-testid="export-transactions">
      <span>transactions-count:{props.transactions?.length ?? -1}</span>
      <button
        type="button"
        data-testid="trigger-export"
        onClick={() => props.onExport?.(new Date('2024-01-01'), new Date('2024-01-31'))}
      >
        Trigger Export
      </button>
    </div>
  ),
}))

vi.mock('../../app/export/ui/sidebar/with-sidebar', () => ({
  __esModule: true,
  default: ({ contentNearby }: { contentNearby: React.ReactNode }) => (
    <div data-testid="with-sidebar">{contentNearby}</div>
  ),
}))

import * as actions from '../../app/export/lib/actions'
import Page from '../../app/export/page'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('app/export/page', () => {
  it('renders title and no-transactions plug when there are no transactions', async () => {
    const mockGetCachedAuthSession = actions.getCachedAuthSession as unknown as vi.Mock
    const mockGetCachedAllTransactions = actions.getCachedAllTransactions as unknown as vi.Mock

    mockGetCachedAuthSession.mockResolvedValue({ user: { email: 'user@example.com' } })
    mockGetCachedAllTransactions.mockResolvedValue([])

    const ui = await Page()
    render(ui as React.ReactElement)

    const heading = screen.getByRole('heading', { name: 'Export' })
    expect(heading).toBeInTheDocument()

    const wrapper = screen.getByTestId('with-sidebar')
    expect(wrapper).toBeInTheDocument()
    expect(within(wrapper).getByRole('heading', { name: 'Export' })).toBeInTheDocument()

    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument()
    expect(screen.queryByTestId('export-transactions')).not.toBeInTheDocument()

    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com')
  })

  it('renders export component when transactions exist and triggers export action', async () => {
    const mockGetCachedAuthSession = actions.getCachedAuthSession as unknown as vi.Mock
    const mockGetCachedAllTransactions = actions.getCachedAllTransactions as unknown as vi.Mock
    const mockGetTransactionsForExport = actions.getTransactionsForExport as unknown as vi.Mock

    const userEmail = 'user2@example.com'
    mockGetCachedAuthSession.mockResolvedValue({ user: { email: userEmail } })
    mockGetCachedAllTransactions.mockResolvedValue([{ id: 't1' }, { id: 't2' }])
    mockGetTransactionsForExport.mockResolvedValue([{ id: 't1' }])

    const ui = await Page()
    render(ui as React.ReactElement)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()

    const exportComp = screen.getByTestId('export-transactions')
    expect(exportComp).toBeInTheDocument()
    expect(within(exportComp).getByText('transactions-count:2')).toBeInTheDocument()
    expect(screen.queryByTestId('no-transactions-plug')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('trigger-export'))

    expect(mockGetTransactionsForExport).toHaveBeenCalledTimes(1)
    const args = mockGetTransactionsForExport.mock.calls[0]
    expect(args[0]).toBe(userEmail)
    expect(args[1]).toBeInstanceOf(Date)
    expect(args[2]).toBeInstanceOf(Date)
    expect((args[1] as Date).toISOString()).toBe('2024-01-01T00:00:00.000Z')
    expect((args[2] as Date).toISOString()).toBe('2024-01-31T00:00:00.000Z')

    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(1, userEmail)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(2, userEmail)
  })
})