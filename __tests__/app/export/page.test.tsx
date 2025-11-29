import '@testing-library/jest-dom'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import React from 'react'

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, env: {} }
})

vi.mock('@/config/constants/navigation', () => ({
  __esModule: true,
  NAV_TITLE: { EXPORT: 'Export' },
}))

vi.mock('../../../app/lib/actions', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    __esModule: true,
    getCachedAuthSession: vi.fn(),
    getCachedAllTransactions: vi.fn(),
    getTransactionsForExport: vi.fn(),
  }
})

vi.mock('../../../app/ui/sidebar/with-sidebar', async () => {
  const React = await import('react')
  return {
    __esModule: true,
    default: ({ contentNearby }: { contentNearby: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'with-sidebar' }, contentNearby),
  }
})

vi.mock('../../../app/ui/home/export-transactions', async () => {
  const React = await import('react')
  return {
    __esModule: true,
    default: ({
      transactions,
      onExport,
    }: {
      transactions: any[]
      onExport?: (start?: Date, end?: Date) => Promise<any[]>
    }) =>
      React.createElement(
        'div',
        { 'data-testid': 'export-transactions' },
        React.createElement('div', null, 'ExportTransactions Component'),
        React.createElement('div', { 'data-testid': 'tx-count' }, String(transactions?.length ?? -1)),
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: () =>
              onExport?.(new Date('2020-01-01T00:00:00.000Z'), new Date('2020-12-31T00:00:00.000Z')),
          },
          'Trigger Export'
        )
      ),
  }
})

vi.mock('../../../app/ui/no-transactions-plug', async () => {
  const React = await import('react')
  return {
    __esModule: true,
    default: () => React.createElement('div', { 'data-testid': 'no-transactions-plug' }, 'No Transactions'),
  }
})

import * as actions from '../../../app/lib/actions'
import Page, { metadata } from '../../../app/export/page'

describe('app/export/page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(actions.getCachedAuthSession as any).mockResolvedValue({ user: { email: 'user@example.com' } })
    ;(actions.getCachedAllTransactions as any).mockResolvedValue([])
    ;(actions.getTransactionsForExport as any).mockResolvedValue([])
  })

  afterEach(() => {
    cleanup()
  })

  it('exports metadata with correct title', () => {
    expect(metadata.title).toBe('Export')
  })

  it('renders heading and NoTransactionsPlug when there are no transactions', async () => {
    ;(actions.getCachedAllTransactions as any).mockResolvedValueOnce([]).mockResolvedValueOnce([])

    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeTruthy()
    expect(screen.getByTestId('with-sidebar')).toBeTruthy()
    expect(screen.getByTestId('no-transactions-plug')).toBeTruthy()
    expect(screen.queryByTestId('export-transactions')).toBeNull()

    expect(actions.getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(actions.getCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(actions.getCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
    expect(actions.getCachedAllTransactions).toHaveBeenNthCalledWith(2, 'user@example.com')
  })

  it('renders ExportTransactions when transactions exist and handles export with userId', async () => {
    const transactions = [{ id: 't1' }, { id: 't2' }]
    ;(actions.getCachedAllTransactions as any)
      .mockResolvedValueOnce(transactions)
      .mockResolvedValueOnce(transactions)
    ;(actions.getCachedAuthSession as any).mockResolvedValue({ user: { email: 'abc@x.com' } })

    const ui = await Page()
    render(ui)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeTruthy()
    expect(screen.getByTestId('export-transactions')).toBeTruthy()
    expect(screen.getByTestId('tx-count').textContent).toBe('2')
    expect(screen.queryByTestId('no-transactions-plug')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /trigger export/i }))

    await waitFor(() => {
      expect(actions.getTransactionsForExport).toHaveBeenCalledTimes(1)
    })

    const [userIdArg, startArg, endArg] = (actions.getTransactionsForExport as any).mock.calls[0]
    expect(userIdArg).toBe('abc@x.com')
    expect(startArg).toEqual(new Date('2020-01-01T00:00:00.000Z'))
    expect(endArg).toEqual(new Date('2020-12-31T00:00:00.000Z'))

    expect(actions.getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(actions.getCachedAllTransactions).toHaveBeenCalledTimes(2)
  })

  it('passes undefined userId to actions when session is missing', async () => {
    ;(actions.getCachedAuthSession as any).mockResolvedValue(undefined)
    const transactions = [{ id: 't1' }]
    ;(actions.getCachedAllTransactions as any)
      .mockResolvedValueOnce(transactions)
      .mockResolvedValueOnce(transactions)

    const ui = await Page()
    render(ui)

    expect(screen.getByTestId('export-transactions')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /trigger export/i }))

    await waitFor(() => {
      expect(actions.getTransactionsForExport).toHaveBeenCalledTimes(1)
    })

    const [userIdArg] = (actions.getTransactionsForExport as any).mock.calls[0]
    expect(userIdArg).toBeUndefined()

    expect(actions.getCachedAllTransactions).toHaveBeenNthCalledWith(1, undefined)
    expect(actions.getCachedAllTransactions).toHaveBeenNthCalledWith(2, undefined)
  })
})