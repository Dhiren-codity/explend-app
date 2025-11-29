import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import React from 'react'

// Mocks
vi.mock('@/config/constants/navigation', () => ({
  __esModule: true,
  NAV_TITLE: { EXPORT: 'Export' },
}))

vi.mock('../../../app/export/lib/actions', () => {
  return {
    __esModule: true,
    getCachedAuthSession: vi.fn(),
    getCachedAllTransactions: vi.fn(),
    getTransactionsForExport: vi.fn(),
  }
})

vi.mock('../../../app/export/ui/no-transactions-plug', () => {
  const React = require('react')
  function NoTransactionsPlug() {
    return React.createElement('div', { 'data-testid': 'no-transactions' }, 'No transactions')
  }
  return { __esModule: true, default: NoTransactionsPlug }
})

vi.mock('../../../app/export/ui/sidebar/with-sidebar', () => {
  const React = require('react')
  function WithSidebar({ contentNearby }: { contentNearby: React.ReactNode }) {
    return React.createElement('div', { 'data-testid': 'with-sidebar' }, contentNearby)
  }
  return { __esModule: true, default: WithSidebar }
})

vi.mock('../../../app/export/ui/home/export-transactions', () => {
  const React = require('react')
  function ExportTransactions({
    transactions,
    onExport,
  }: {
    transactions: any[]
    onExport?: (start?: Date, end?: Date) => Promise<any[]>
  }) {
    const [resultCount, setResultCount] = React.useState<number | null>(null)
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'div',
        { 'data-testid': 'export-transactions' },
        `transactions:${transactions?.length ?? 0}`,
      ),
      React.createElement(
        'button',
        {
          onClick: async () => {
            const start = new Date('2020-01-01T00:00:00.000Z')
            const end = new Date('2020-01-31T00:00:00.000Z')
            const res = await onExport?.(start, end)
            setResultCount(res?.length ?? 0)
          },
        },
        'Export Now',
      ),
      resultCount !== null &&
        React.createElement('div', { 'data-testid': 'export-result' }, String(resultCount)),
    )
  }
  return { __esModule: true, default: ExportTransactions }
})

import Page from '@/app/export/page'
import {
  getCachedAuthSession,
  getCachedAllTransactions,
  getTransactionsForExport,
} from '@/app/lib/actions'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('app/export/page', () => {
  it('renders title and NoTransactionsPlug when there are no transactions', async () => {
    ;(getCachedAuthSession as unknown as vi.Mock).mockResolvedValue({
      user: { email: 'user@example.com' },
    })
    ;(getCachedAllTransactions as unknown as vi.Mock).mockResolvedValue([])

    const element = await Page()
    render(element)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions')).toBeInTheDocument()
    expect(screen.queryByTestId('export-transactions')).not.toBeInTheDocument()

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com')
  })

  it('renders ExportTransactions when transactions exist and handles onExport', async () => {
    ;(getCachedAuthSession as unknown as vi.Mock).mockResolvedValue({
      user: { email: 'user@example.com' },
    })
    ;(getCachedAllTransactions as unknown as vi.Mock).mockResolvedValue([
      { id: 't1' },
      { id: 't2' },
      { id: 't3' },
    ])
    ;(getTransactionsForExport as unknown as vi.Mock).mockResolvedValue([{ id: 'e1' }, { id: 'e2' }])

    const element = await Page()
    render(element)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toHaveTextContent('transactions:3')

    fireEvent.click(screen.getByRole('button', { name: /export now/i }))

    await waitFor(() => {
      expect(getTransactionsForExport).toHaveBeenCalledTimes(1)
    })

    expect(getTransactionsForExport).toHaveBeenCalledWith(
      'user@example.com',
      expect.any(Date),
      expect.any(Date),
    )

    await waitFor(() => {
      expect(screen.getByTestId('export-result')).toHaveTextContent('2')
    })
  })
})
