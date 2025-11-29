import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

vi.mock('../../../app/lib/actions', () => {
  return {
    __esModule: true,
    getCachedAuthSession: vi.fn(),
    getCachedAllTransactions: vi.fn(),
    getTransactionsForExport: vi.fn(),
  }
})

vi.mock('@/config/constants/navigation', () => ({
  __esModule: true,
  NAV_TITLE: {
    EXPORT: 'Export',
  },
}))

vi.mock('../../../app/ui/sidebar/with-sidebar', async () => {
  const React = await import('react')
  return {
    __esModule: true,
    default: ({ contentNearby }: any) =>
      React.createElement('div', { 'data-testid': 'with-sidebar' }, contentNearby),
  }
})

vi.mock('../../../app/ui/no-transactions-plug', async () => {
  const React = await import('react')
  return {
    __esModule: true,
    default: () => React.createElement('div', { 'data-testid': 'no-transactions-plug' }, 'No transactions'),
  }
})

vi.mock('../../../app/ui/home/export-transactions', async () => {
  const React = await import('react')
  return {
    __esModule: true,
    default: ({ transactions }: any) =>
      React.createElement('div', { 'data-testid': 'export-transactions' }, `count: ${transactions?.length ?? 0}`),
  }
})

import Page from '../../../app/export/page'
import { getCachedAuthSession, getCachedAllTransactions } from '../../../app/lib/actions'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('app/export/page', () => {
  it('renders heading and NoTransactionsPlug when there are no transactions', async () => {
    ;(getCachedAuthSession as any).mockResolvedValue({ user: { email: 'user@example.com' } })
    ;(getCachedAllTransactions as any).mockResolvedValue([])

    const ui = await Page()
    render(ui as any)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument()
    expect(screen.queryByTestId('export-transactions')).not.toBeInTheDocument()

    expect(getCachedAuthSession).toHaveBeenCalledTimes(1)
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(1)
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, 'user@example.com')
  })

  it('renders ExportTransactions when transactions exist', async () => {
    ;(getCachedAuthSession as any).mockResolvedValue({ user: { email: 'abc@x.com' } })
    ;(getCachedAllTransactions as any).mockResolvedValue([{ id: 't1' }, { id: 't2' }])

    const ui = await Page()
    render(ui as any)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toHaveTextContent('count: 2')
    expect(screen.queryByTestId('no-transactions-plug')).not.toBeInTheDocument()

    expect(getCachedAuthSession).toHaveBeenCalledTimes(1)
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(1)
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, 'abc@x.com')
  })

  it('passes undefined userId to data fetch when session has no email', async () => {
    ;(getCachedAuthSession as any).mockResolvedValue(undefined)
    ;(getCachedAllTransactions as any).mockResolvedValue([])

    const ui = await Page()
    render(ui as any)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions-plug')).toBeInTheDocument()

    expect(getCachedAuthSession).toHaveBeenCalledTimes(1)
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(1)
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, undefined)
  })
})