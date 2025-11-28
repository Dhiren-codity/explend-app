import React from 'react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom';

// Mocks
vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: { EXPORT: 'Export' },
}))

vi.mock('../lib/actions', () => {
  return {
    getCachedAllTransactions: vi.fn(),
    getCachedAuthSession: vi.fn(),
    getTransactionsForExport: vi.fn(),
  }
})


vi.mock('../ui/home/export-transactions', () => ({
  default: (props: any) => {
    capturedExportProps = props
    return <div data-testid="export-transactions">Export UI</div>
  },
}))

vi.mock('../ui/no-transactions-plug', () => ({
  default: () => <div data-testid="no-transactions">No tx</div>,
}))

vi.mock('../ui/sidebar/with-sidebar', () => ({
  default: ({ contentNearby }: { contentNearby: React.ReactNode }) => (
    <div data-testid="with-sidebar">{contentNearby}</div>
  ),
}))

import Page, { metadata } from './page'
import {
  getCachedAllTransactions,
  getCachedAuthSession,
  getTransactionsForExport,
} from '../lib/actions'

afterEach(() => {
  vi.clearAllMocks()
  cleanup()
  capturedExportProps = undefined
})

describe('app/export/page', () => {
  test('exports metadata with title from NAV_TITLE.EXPORT', () => {
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Export')
  })

  test('renders NoTransactionsPlug when there are no transactions', async () => {
    vi.mocked(getCachedAuthSession).mockResolvedValue({ user: { email: 'user@example.com' } } as any)
    vi.mocked(getCachedAllTransactions).mockResolvedValue([])

    const element = await Page()
    render(element)

    expect(screen.getByRole('heading', { level: 1, name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('no-transactions')).toBeInTheDocument()
    expect(screen.queryByTestId('export-transactions')).not.toBeInTheDocument()

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(vi.mocked(getCachedAllTransactions).mock.calls[0][0]).toBe('user@example.com')
    expect(vi.mocked(getCachedAllTransactions).mock.calls[1][0]).toBe('user@example.com')
  })

  test('renders ExportTransactions when transactions exist and onExport delegates to getTransactionsForExport', async () => {
    const session = { user: { email: 'user@example.com' } }
    const transactions = [{ id: 't1' }, { id: 't2' }] as any
    const exported = [{ id: 'e1' }] as any
    vi.mocked(getCachedAuthSession).mockResolvedValue(session as any)
    vi.mocked(getCachedAllTransactions).mockResolvedValue(transactions)
    vi.mocked(getTransactionsForExport).mockResolvedValue(exported)

    const element = await Page()
    render(element)

    expect(screen.getByRole('heading', { level: 1, name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toBeInTheDocument()
    expect(screen.queryByTestId('no-transactions')).not.toBeInTheDocument()

    expect(capturedExportProps).toBeDefined()
    expect(capturedExportProps.transactions).toEqual(transactions)
    expect(typeof capturedExportProps.onExport).toBe('function')

    const d1 = new Date('2020-01-01')
    const d2 = new Date('2020-12-31')
    const result = await capturedExportProps.onExport(d1, d2)

    expect(getTransactionsForExport).toHaveBeenCalledTimes(1)
    expect(getTransactionsForExport).toHaveBeenCalledWith('user@example.com', d1, d2)
    expect(result).toEqual(exported)
  })

  test('throws when getCachedAuthSession (awaited call) fails', async () => {
    const session = { user: { email: 'user@example.com' } }
    vi.mocked(getCachedAuthSession)
      .mockResolvedValueOnce(session as any) // first fire-and-forget call
      .mockRejectedValueOnce(new Error('Session failure')) // awaited call rejects

    await expect(Page()).rejects.toThrow('Session failure')
    expect(getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).not.toHaveBeenCalled()
  })
})
