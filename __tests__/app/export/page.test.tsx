import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

// Mock NAV_TITLE alias module as virtual
vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: { EXPORT: 'Export' },
}), { virtual: true })

// Mock UI components
vi.mock('../../../app/export/ui/sidebar/with-sidebar', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: ({ contentNearby }: any) => (
      <div data-testid="with-sidebar">{contentNearby}</div>
    ),
  }
})

vi.mock('../../../app/export/ui/no-transactions-plug', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: () => <div data-testid="no-transactions-plug">No transactions</div>,
  }
})

vi.mock('../../../app/export/ui/home/export-transactions', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: (props: any) => {
      const handleClick = () => {
        if (props.onExport) {
          props.onExport(new Date('2023-01-01'), new Date('2023-02-01'))
        }
      }
      return (
        <div data-testid="export-transactions">
          <div data-testid="tx-count">{props.transactions?.length ?? 0}</div>
          <button onClick={handleClick}>trigger-export</button>
        </div>
      )
    },
  }
})

// Mock actions
vi.mock('../../../app/export/lib/actions', () => ({
  getCachedAllTransactions: vi.fn(),
  getCachedAuthSession: vi.fn(),
  getTransactionsForExport: vi.fn(),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('app/export/page', () => {
  it('renders title and NoTransactionsPlug when there are no transactions', async () => {
    const actions = await import('../../../app/export/lib/actions')
    const getCachedAuthSession = actions.getCachedAuthSession as unknown as vi.Mock
    const getCachedAllTransactions = actions.getCachedAllTransactions as unknown as vi.Mock
    const getTransactionsForExport = actions.getTransactionsForExport as unknown as vi.Mock

    getCachedAuthSession.mockResolvedValue({ user: { email: 'user@example.com' } })
    getCachedAllTransactions.mockResolvedValue([])

    const mod = await import('../../../app/export/page')
    const Page = mod.default as unknown as () => Promise<JSX.Element>

    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument()

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com')
    expect(getTransactionsForExport).not.toHaveBeenCalled()
  })

  it('renders ExportTransactions and calls onExport with userId and dates', async () => {
    const actions = await import('../../../app/export/lib/actions')
    const getCachedAuthSession = actions.getCachedAuthSession as unknown as vi.Mock
    const getCachedAllTransactions = actions.getCachedAllTransactions as unknown as vi.Mock
    const getTransactionsForExport = actions.getTransactionsForExport as unknown as vi.Mock

    getCachedAuthSession.mockResolvedValue({ user: { email: 'user@example.com' } })
    getCachedAllTransactions.mockResolvedValue([{ id: '1' }, { id: '2' }])
    getTransactionsForExport.mockResolvedValue([])

    const mod = await import('../../../app/export/page')
    const Page = mod.default as unknown as () => Promise<JSX.Element>

    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toBeInTheDocument()
    expect(screen.getByTestId('tx-count')).toHaveTextContent('2')

    fireEvent.click(screen.getByText('trigger-export'))

    await waitFor(() => {
      expect(getTransactionsForExport).toHaveBeenCalledTimes(1)
    })
    const callArgs = (getTransactionsForExport as vi.Mock).mock.calls[0]
    expect(callArgs[0]).toBe('user@example.com')
    expect(callArgs[1]).toBeInstanceOf(Date)
    expect(callArgs[2]).toBeInstanceOf(Date)
    expect((callArgs[1] as Date).toISOString().slice(0, 10)).toBe('2023-01-01')
    expect((callArgs[2] as Date).toISOString().slice(0, 10)).toBe('2023-02-01')
  })
})
