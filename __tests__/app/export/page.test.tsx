import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import React from 'react'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.resetModules()
})

const mockGetCachedAuthSession = vi.fn()
const mockGetCachedAllTransactions = vi.fn()
const mockGetTransactionsForExport = vi.fn()

vi.mock('../../../app/export/lib/actions', () => ({
  getCachedAuthSession: mockGetCachedAuthSession,
  getCachedAllTransactions: mockGetCachedAllTransactions,
  getTransactionsForExport: mockGetTransactionsForExport,
}))

vi.mock('../../../app/export/ui/sidebar/with-sidebar', () => ({
  default: ({ contentNearby }: { contentNearby: React.ReactNode }) => (
    <div data-testid="with-sidebar">{contentNearby}</div>
  ),
}))

vi.mock('../../../app/export/ui/no-transactions-plug', () => ({
  default: () => <div>No transactions</div>,
}))

vi.mock('../../../app/export/ui/home/export-transactions', () => ({
  default: ({ onExport, transactions }: { onExport?: Function; transactions?: any[] }) => (
    <div>
      <div>ExportTransactions Component</div>
      <div data-testid="tx-count">{transactions?.length ?? 0}</div>
      <button
        type="button"
        onClick={() =>
          onExport?.(new Date('2020-01-01T00:00:00.000Z'), new Date('2020-12-31T00:00:00.000Z'))
        }
      >
        Do Export
      </button>
    </div>
  ),
}))

vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: { EXPORT: 'Export' },
}))

describe('app/export/page', () => {
  it('renders title and NoTransactionsPlug when there are no transactions', async () => {
    mockGetCachedAuthSession.mockResolvedValueOnce({ user: { email: 'user@example.com' } })
    mockGetCachedAuthSession.mockResolvedValueOnce({ user: { email: 'user@example.com' } })
    mockGetCachedAllTransactions.mockResolvedValueOnce([])
    mockGetCachedAllTransactions.mockResolvedValueOnce([])

    const mod = await import('../../../app/export/page')
    const Page = mod.default
    const { metadata } = mod as { metadata: { title: string } }

    expect(metadata.title).toBe('Export')

    render(await Page())

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByText('No transactions')).toBeInTheDocument()
    expect(screen.queryByText('ExportTransactions Component')).not.toBeInTheDocument()

    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com')
  })

  it('renders ExportTransactions when transactions exist', async () => {
    mockGetCachedAuthSession.mockResolvedValueOnce({ user: { email: 'user@example.com' } })
    mockGetCachedAuthSession.mockResolvedValueOnce({ user: { email: 'user@example.com' } })
    const txs = [{ id: 't1' }] as any[]
    mockGetCachedAllTransactions.mockResolvedValueOnce(txs)
    mockGetCachedAllTransactions.mockResolvedValueOnce(txs)

    const mod = await import('../../../app/export/page')
    const Page = mod.default

    render(await Page())

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByText('ExportTransactions Component')).toBeInTheDocument()
    expect(screen.getByTestId('tx-count').textContent).toBe('1')
    expect(screen.queryByText('No transactions')).not.toBeInTheDocument()

    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com')
  })

  it('passes onExport that calls getTransactionsForExport with userId and date range', async () => {
    mockGetCachedAuthSession.mockResolvedValueOnce({ user: { email: 'user@example.com' } })
    mockGetCachedAuthSession.mockResolvedValueOnce({ user: { email: 'user@example.com' } })
    const txs = [{ id: 't1' }] as any[]
    mockGetCachedAllTransactions.mockResolvedValueOnce(txs)
    mockGetCachedAllTransactions.mockResolvedValueOnce(txs)
    mockGetTransactionsForExport.mockResolvedValue([])

    const mod = await import('../../../app/export/page')
    const Page = mod.default

    render(await Page())

    fireEvent.click(screen.getByRole('button', { name: 'Do Export' }))

    expect(mockGetTransactionsForExport).toHaveBeenCalledTimes(1)
    const start = new Date('2020-01-01T00:00:00.000Z')
    const end = new Date('2020-12-31T00:00:00.000Z')
    expect(mockGetTransactionsForExport).toHaveBeenCalledWith('user@example.com', start, end)
  })
})
