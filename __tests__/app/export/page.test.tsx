import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// Virtual mock for alias import
vi.mock('@/config/constants/navigation', () => {
  return {
    NAV_TITLE: {
      EXPORT: 'Export',
    },
  }
}, { virtual: true })

// Shared mock fns for actions
const mockGetCachedAuthSession = vi.fn()
const mockGetCachedAllTransactions = vi.fn()
const mockGetTransactionsForExport = vi.fn()

vi.mock('../../../app/export/lib/actions', () => {
  return {
    getCachedAuthSession: mockGetCachedAuthSession,
    getCachedAllTransactions: mockGetCachedAllTransactions,
    getTransactionsForExport: mockGetTransactionsForExport,
  }
})

// Mock UI components used by the page
vi.mock('../../../app/export/ui/sidebar/with-sidebar', async () => {
  const React = await import('react')
  return {
    default: ({ contentNearby }: { contentNearby: React.ReactNode }) => {
      return React.createElement(React.Fragment, null, contentNearby)
    },
  }
})

vi.mock('../../../app/export/ui/no-transactions-plug', async () => {
  const React = await import('react')
  return {
    default: () => React.createElement('div', { 'data-testid': 'no-transactions-plug' }, 'No transactions'),
  }
})

vi.mock('../../../app/export/ui/home/export-transactions', async () => {
  const React = await import('react')
  function ExportTransactionsMock(props: { transactions: unknown[]; onExport?: (start?: Date, end?: Date) => Promise<unknown[]> }) {
    const [count, setCount] = (React as any).useState<number | null>(null)
    return React.createElement(
      'div',
      { 'data-testid': 'export-transactions' },
      React.createElement('div', { 'data-testid': 'export-transactions-count' }, String(props.transactions?.length ?? 0)),
      React.createElement(
        'button',
        {
          onClick: async () => {
            const res = await props.onExport?.(new Date('2020-01-01'), new Date('2020-12-31'))
            setCount((res as any)?.length ?? 0)
          },
        },
        'run-export',
      ),
      count !== null &&
        React.createElement('div', { 'data-testid': 'export-result-count' }, String(count)),
    )
  }
  return { default: ExportTransactionsMock }
})

describe('app/export/page', () => {
  beforeEach(() => {
    vi.resetModules()
    mockGetCachedAuthSession.mockReset()
    mockGetCachedAllTransactions.mockReset()
    mockGetTransactionsForExport.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders title and NoTransactionsPlug when there are no transactions', async () => {
    const session = { user: { email: 'user@example.com' } }
    mockGetCachedAuthSession.mockResolvedValue(session)
    mockGetCachedAllTransactions.mockResolvedValue([])
    mockGetTransactionsForExport.mockResolvedValue([])

    const { default: Page } = await import('../../../app/export/page')
    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument()
    expect(screen.queryByTestId('export-transactions')).not.toBeInTheDocument()

    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAuthSession).toHaveBeenNthCalledWith(1)
    expect(mockGetCachedAuthSession).toHaveBeenNthCalledWith(2)

    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com')

    expect(mockGetTransactionsForExport).not.toHaveBeenCalled()
  })

  it('renders ExportTransactions when transactions exist and calls onExport with dates and userId', async () => {
    const session = { user: { email: 'user@example.com' } }
    const transactions = [{ id: 't1' }, { id: 't2' }]
    const exported = [{ id: 'e1' }, { id: 'e2' }, { id: 'e3' }]

    mockGetCachedAuthSession.mockResolvedValue(session)
    mockGetCachedAllTransactions.mockResolvedValue(transactions)
    mockGetTransactionsForExport.mockResolvedValue(exported)

    const { default: Page } = await import('../../../app/export/page')
    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toBeInTheDocument()
    expect(screen.getByTestId('export-transactions-count')).toHaveTextContent('2')
    expect(screen.queryByTestId('no-transactions-plug')).not.toBeInTheDocument()

    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com')

    // Before click, export not called
    expect(mockGetTransactionsForExport).not.toHaveBeenCalled()

    // Trigger export via mock component button
    fireEvent.click(screen.getByText('run-export'))

    await waitFor(() => {
      expect(screen.getByTestId('export-result-count')).toHaveTextContent('3')
    })

    expect(mockGetTransactionsForExport).toHaveBeenCalledTimes(1)
    const call = mockGetTransactionsForExport.mock.calls[0]
    expect(call[0]).toBe('user@example.com')
    expect(call[1]).toBeInstanceOf(Date)
    expect(call[2]).toBeInstanceOf(Date)
    const start: Date = call[1]
    const end: Date = call[2]
    expect(start.toISOString().startsWith('2020-01-01')).toBe(true)
    expect(end.toISOString().startsWith('2020-12-31')).toBe(true)
  })
})
