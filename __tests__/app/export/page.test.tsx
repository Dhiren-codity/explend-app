import React from 'react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: { EXPORT: 'Export' },
}))

vi.mock('../../../app/ui/no-transactions-plug', () => {
  const NoTransactionsPlug = () => <div data-testid="no-transactions-plug">No transactions</div>
  return { default: NoTransactionsPlug }
})

vi.mock('../../../app/ui/sidebar/with-sidebar', () => {
  const WithSidebar = ({ contentNearby }: { contentNearby: React.ReactNode }) => (
    <div data-testid="with-sidebar">{contentNearby}</div>
  )
  return { default: WithSidebar }
})

vi.mock('../../../app/ui/home/export-transactions', () => {
  const React = require('react')
  const ExportTransactions = ({
    transactions,
    onExport,
  }: {
    transactions: any[]
    onExport: (startDate?: Date, endDate?: Date) => Promise<any[]>
  }) => {
    const [resultCount, setResultCount] = React.useState<number | null>(null)
    const handleClick = async () => {
      const res = await onExport(new Date('2023-01-01'), new Date('2023-12-31'))
      setResultCount(res.length)
    }
    return (
      <div data-testid="export-transactions-mock">
        <div data-testid="transactions-count">{transactions?.length ?? 0}</div>
        <button type="button" onClick={handleClick}>
          Run export
        </button>
        {resultCount !== null && (
          <div data-testid="export-result">Exported {resultCount}</div>
        )}
      </div>
    )
  }
  return { default: ExportTransactions }
})

vi.mock('../../../app/lib/actions', () => {
  return {
    getCachedAllTransactions: vi.fn(),
    getCachedAuthSession: vi.fn(),
    getTransactionsForExport: vi.fn(),
  }
})

import {
  getCachedAllTransactions,
  getCachedAuthSession,
  getTransactionsForExport,
} from '../../../app/lib/actions'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('app/export/page', () => {
  beforeEach(() => {
    // Ensure default mock implementations are set for each test
    ;(getCachedAuthSession as unknown as vi.Mock).mockResolvedValue({
      user: { email: 'user@example.com' },
    })
    ;(getCachedAllTransactions as unknown as vi.Mock).mockResolvedValue([])
    ;(getTransactionsForExport as unknown as vi.Mock).mockResolvedValue([])
  })

  it('renders heading and NoTransactionsPlug when there are no transactions', async () => {
    ;(getCachedAuthSession as unknown as vi.Mock).mockResolvedValue({
      user: { email: 'user@example.com' },
    })
    ;(getCachedAllTransactions as unknown as vi.Mock).mockResolvedValue([])

    const { default: Page } = await import('../../../app/export/page')
    const ui = await Page()
    render(ui as React.ReactElement)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument()
    expect(screen.queryByTestId('export-transactions-mock')).not.toBeInTheDocument()

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect((getCachedAllTransactions as unknown as vi.Mock).mock.calls[0][0]).toBe('user@example.com')
    expect((getCachedAllTransactions as unknown as vi.Mock).mock.calls[1][0]).toBe('user@example.com')
  })

  it('renders ExportTransactions when there are transactions and calls onExport with correct args', async () => {
    const userId = 'me@x.com'
    ;(getCachedAuthSession as unknown as vi.Mock).mockResolvedValue({
      user: { email: userId },
    })
    const initialTransactions = [{ id: 't1' }, { id: 't2' }]
    ;(getCachedAllTransactions as unknown as vi.Mock).mockResolvedValue(initialTransactions)
    const exportedTransactions = [{ id: 'e1' }, { id: 'e2' }, { id: 'e3' }]
    ;(getTransactionsForExport as unknown as vi.Mock).mockResolvedValue(exportedTransactions)

    const { default: Page } = await import('../../../app/export/page')
    const ui = await Page()
    render(ui as React.ReactElement)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('export-transactions-mock')).toBeInTheDocument()
    expect(screen.getByTestId('transactions-count')).toHaveTextContent('2')

    fireEvent.click(screen.getByRole('button', { name: 'Run export' }))

    await waitFor(() => {
      expect(screen.getByTestId('export-result')).toHaveTextContent('Exported 3')
    })

    // Assert handler called with userId and provided dates
    expect(getTransactionsForExport).toHaveBeenCalledTimes(1)
    const callArgs = (getTransactionsForExport as unknown as vi.Mock).mock.calls[0]
    expect(callArgs[0]).toBe(userId)
    expect(callArgs[1]).toEqual(new Date('2023-01-01'))
    expect(callArgs[2]).toEqual(new Date('2023-12-31'))
  })

  it('exports metadata with correct title', async () => {
    const { metadata } = await import('../../../app/export/page')
    expect(metadata?.title).toBe('Export')
  })
})
