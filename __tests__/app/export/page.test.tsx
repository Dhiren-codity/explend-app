import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: { EXPORT: 'Export transactions' },
}))

vi.mock('../../../app/lib/actions', () => {
  return {
    getCachedAuthSession: vi.fn(),
    getCachedAllTransactions: vi.fn(),
    getTransactionsForExport: vi.fn(),
  }
})

vi.mock('../../../app/ui/no-transactions-plug', () => ({
  __esModule: true,
  default: () => <div data-testid="no-transactions-plug">No transactions</div>,
}))

vi.mock('../../../app/ui/home/export-transactions', () => ({
  __esModule: true,
  default: (props: any) => {
    return (
      <div data-testid="export-transactions">
        <div>tx-count:{props.transactions?.length ?? 0}</div>
        <button
          type="button"
          onClick={async () => {
            const start = new Date('2023-01-01')
            const end = new Date('2023-12-31')
            await props.onExport?.(start, end)
          }}
        >
          run-export
        </button>
      </div>
    )
  },
}))

vi.mock('../../../app/ui/sidebar/with-sidebar', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="with-sidebar">
      <div>with-sidebar</div>
      {props.contentNearby}
    </div>
  ),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.resetModules()
})

describe('app/export/page', () => {
  it('exports metadata title from NAV_TITLE.EXPORT', async () => {
    const { metadata } = await import('../../../app/export/page')
    expect(metadata.title).toBe('Export transactions')
  })

  it('renders NoTransactionsPlug when there are no transactions', async () => {
    const actions = await import('../../../app/lib/actions')
    ;(actions.getCachedAuthSession as any).mockResolvedValue({
      user: { email: 'user@example.com' },
    })
    ;(actions.getCachedAllTransactions as any).mockResolvedValue([])

    const mod = await import('../../../app/export/page')
    const Page = mod.default

    const element = await Page()
    render(element)

    expect(screen.getByRole('heading', { name: 'Export transactions' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument()
    expect(screen.queryByTestId('export-transactions')).not.toBeInTheDocument()

    expect(actions.getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(actions.getCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect((actions.getCachedAllTransactions as any).mock.calls[0][0]).toBe('user@example.com')
    expect((actions.getCachedAllTransactions as any).mock.calls[1][0]).toBe('user@example.com')
  })

  it('renders ExportTransactions with transactions and calls onExport server action', async () => {
    const actions = await import('../../../app/lib/actions')
    const sampleTransactions = [{ id: 't1' }, { id: 't2' }]
    ;(actions.getCachedAuthSession as any).mockResolvedValue({
      user: { email: 'user@example.com' },
    })
    ;(actions.getCachedAllTransactions as any).mockResolvedValue(sampleTransactions)
    ;(actions.getTransactionsForExport as any).mockResolvedValue(sampleTransactions)

    const mod = await import('../../../app/export/page')
    const Page = mod.default

    render(await Page())

    expect(screen.getByRole('heading', { name: 'Export transactions' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()

    const exportComp = screen.getByTestId('export-transactions')
    expect(exportComp).toBeInTheDocument()
    expect(screen.getByText('tx-count:2')).toBeInTheDocument()
    expect(screen.queryByTestId('no-transactions-plug')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'run-export' }))

    await waitFor(() => {
      expect(actions.getTransactionsForExport).toHaveBeenCalledTimes(1)
    })

    const call = (actions.getTransactionsForExport as any).mock.calls[0]
    expect(call[0]).toBe('user@example.com')
    expect(call[1]).toBeInstanceOf(Date)
    expect(call[2]).toBeInstanceOf(Date)
    expect((call[1] as Date).getFullYear()).toBe(2023)
    expect((call[2] as Date).getFullYear()).toBe(2023)
  })
})
