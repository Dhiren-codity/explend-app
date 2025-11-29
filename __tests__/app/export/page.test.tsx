import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'

vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    format: vi.fn(() => '2024-01-01'),
    subMonths: vi.fn(() => new Date('2024-01-01')),
  }
})

vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: { EXPORT: 'Export' },
}))

vi.mock('@/app/lib/actions', () => ({
  getCachedAuthSession: vi.fn(),
  getCachedAllTransactions: vi.fn(),
  getTransactionsForExport: vi.fn(),
}))

vi.mock('@/app/export/ui/sidebar/with-sidebar', async () => {
  const React = await import('react')
  return {
    default: ({ contentNearby }: any) =>
      React.createElement('div', { 'data-testid': 'with-sidebar' }, contentNearby),
  }
})

vi.mock('@/app/export/ui/no-transactions-plug', async () => {
  const React = await import('react')
  return {
    default: () => React.createElement('div', { 'data-testid': 'no-transactions-plug' }, 'No transactions'),
  }
})

vi.mock('@/app/export/ui/home/export-transactions', async () => {
  const React = await import('react')
  return {
    default: ({ transactions, onExport }: any) =>
      React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { 'data-testid': 'export-transactions' },
          `count: ${transactions?.length ?? 'n/a'}`
        ),
        React.createElement(
          'button',
          { onClick: () => onExport(new Date('2020-01-01'), new Date('2020-01-31')) },
          'Export Now'
        )
      ),
  }
})

import Page, { metadata } from '@/app/export/page'
import { NAV_TITLE } from '@/config/constants/navigation'
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
  it('renders with sidebar and shows NoTransactionsPlug when no transactions', async () => {
    ;(getCachedAuthSession as any).mockResolvedValue({ user: { email: 'user@example.com' } })
    ;(getCachedAllTransactions as any).mockResolvedValue([])

    const ui = await Page()
    render(ui)

    expect(screen.getByTestId('with-sidebar')).toBeTruthy()
    expect(screen.getByTestId('no-transactions-plug')).toBeTruthy()
    expect(screen.queryByTestId('export-transactions')).toBeNull()
  })

  it('renders ExportTransactions when transactions exist and triggers export handler', async () => {
    ;(getCachedAuthSession as any).mockResolvedValue({ user: { email: 'user@example.com' } })
    ;(getCachedAllTransactions as any).mockResolvedValue([{ id: 't1' }])
    ;(getTransactionsForExport as any).mockResolvedValue([{ id: 'e1' }])

    const ui = await Page()
    render(ui)

    expect(screen.getByTestId('with-sidebar')).toBeTruthy()
    expect(screen.queryByTestId('no-transactions-plug')).toBeNull()
    expect(screen.getByTestId('export-transactions')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Export Now' }))

    await waitFor(() => {
      expect(getTransactionsForExport).toHaveBeenCalledTimes(1)
    })
  })

  it('exports metadata title', () => {
    expect(metadata.title).toBe(NAV_TITLE.EXPORT)
  })
})