import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// Mock constants with alias
vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: { EXPORT: 'Export' },
}))

// Mock actions used in the page
vi.mock('../../../app/export/lib/actions', () => ({
  getCachedAuthSession: vi.fn(),
  getCachedAllTransactions: vi.fn(),
  getTransactionsForExport: vi.fn(),
}))

// Mock UI components
vi.mock('../../../app/export/ui/sidebar/with-sidebar', () => ({
  default: ({ contentNearby }: any) => (
    <div data-testid="with-sidebar">{contentNearby}</div>
  ),
}))

vi.mock('../../../app/export/ui/no-transactions-plug', () => ({
  default: () => <div data-testid="no-transactions-plug">No transactions</div>,
}))

vi.mock('../../../app/export/ui/home/export-transactions', () => ({
  default: ({ transactions, onExport }: any) => (
    <div>
      <div data-testid="export-transactions">count: {transactions?.length ?? 'n/a'}</div>
      <button onClick={() => onExport(new Date('2020-01-01'), new Date('2020-01-31'))}>
        Export Now
      </button>
    </div>
  ),
}))

import Page, { metadata } from '@/app/export/page'
import { NAV_TITLE } from '@/config/constants/navigation'
import {
  getCachedAuthSession,
  getCachedAllTransactions,
  getTransactionsForExport,
} from '@/app/export/lib/actions'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('app/export/page', () => {
  it('renders heading and shows NoTransactionsPlug when no transactions', async () => {
    ;(getCachedAuthSession as any).mockResolvedValue({ user: { email: 'user@example.com' } })
    ;(getCachedAllTransactions as any).mockResolvedValue([])

    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: NAV_TITLE.EXPORT })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument()
    expect(screen.queryByTestId('export-transactions')).not.toBeInTheDocument()
  })

  it('renders ExportTransactions when transactions exist and triggers export handler', async () => {
    ;(getCachedAuthSession as any).mockResolvedValue({ user: { email: 'user@example.com' } })
    ;(getCachedAllTransactions as any).mockResolvedValue([{ id: 't1' }])
    ;(getTransactionsForExport as any).mockResolvedValue([{ id: 'e1' }])

    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: NAV_TITLE.EXPORT })).toBeInTheDocument()
    expect(screen.queryByTestId('no-transactions-plug')).not.toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toHaveTextContent('count: 1')

    fireEvent.click(screen.getByRole('button', { name: 'Export Now' }))

    await waitFor(() => {
      expect(getTransactionsForExport).toHaveBeenCalledTimes(1)
    })

    const call = (getTransactionsForExport as any).mock.calls[0]
    const [userId, startDate, endDate] = call
    expect(userId).toBe('user@example.com')
    expect(startDate).toBeInstanceOf(Date)
    expect(endDate).toBeInstanceOf(Date)
    expect((startDate as Date).toISOString()).toBe('2020-01-01T00:00:00.000Z')
    expect((endDate as Date).toISOString()).toBe('2020-01-31T00:00:00.000Z')
  })

  it('exports metadata title equals NAV_TITLE.EXPORT', () => {
    expect(metadata.title).toBe(NAV_TITLE.EXPORT)
  })
})
