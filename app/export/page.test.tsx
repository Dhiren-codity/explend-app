import React from 'react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom';

vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: { EXPORT: 'Export' },
}))

vi.mock('app/lib/actions', () => {
  return {
    getCachedAllTransactions: vi.fn(),
    getCachedAuthSession: vi.fn(),
    getTransactionsForExport: vi.fn(),
  }
})

vi.mock('app/ui/sidebar/with-sidebar', () => {
  const WithSidebar = ({ contentNearby }) => (
    <div data-testid="with-sidebar">{contentNearby}</div>
  )
  return { default: WithSidebar }
})

vi.mock('app/ui/no-transactions-plug', () => {
  const NoTransactionsPlug = () => <div data-testid="no-transactions-plug" />
  return { default: NoTransactionsPlug }
})

vi.mock('app/ui/home/export-transactions', () => {
  const ExportTransactions = (props) => {
    lastExportProps = props
    return (
      <div data-testid="export-transactions" data-count={props.transactions?.length ?? 0} />
    )
  }
  return {
    default: ExportTransactions,
    __esModule: true,
    getLastExportProps: () => lastExportProps,
  }
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  lastExportProps = null
})

import Page, { metadata } from 'app/export/page'
import {
  getCachedAllTransactions,
  getCachedAuthSession,
  getTransactionsForExport,
} from 'app/lib/actions'
import { getLastExportProps } from 'app/ui/home/export-transactions'

describe('app/export/page metadata', () => {
  test('sets title to NAV_TITLE.EXPORT', () => {
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Export')
  })
})


    const exported = [{ id: 'e1' }]

    getCachedAuthSession.mockResolvedValue({ user: { email: userId } })
    getCachedAllTransactions.mockResolvedValue(txs)
    getTransactionsForExport.mockResolvedValue(exported)

    const element = await Page()
    render(element)

    expect(screen.getByTestId('with-sidebar')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
    expect(screen.getByTestId('export-transactions')).toBeInTheDocument()
    expect(screen.queryByTestId('no-transactions-plug')).toBeNull()

    const props = getLastExportProps()
    expect(props).toBeTruthy()
    expect(Array.isArray(props.transactions)).toBe(true)
    expect(props.transactions).toHaveLength(2)
    expect(typeof props.onExport).toBe('function')

    const startDate = new Date('2020-01-01')
    const endDate = new Date('2020-02-01')
    const result = await props.onExport(startDate, endDate)

    expect(getTransactionsForExport).toHaveBeenCalledTimes(1)
    expect(getTransactionsForExport).toHaveBeenCalledWith(userId, startDate, endDate)
    expect(result).toEqual(exported)

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, userId)
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(2, userId)
  })

    getCachedAllTransactions.mockImplementation(() => {
      throw new Error('boom')
    })

    await expect(Page()).rejects.toThrow('boom')
  })

    getCachedAllTransactions.mockResolvedValue(txs)
    getTransactionsForExport.mockResolvedValue([{ id: 'out' }])

    const element = await Page()
    render(element)

    expect(screen.getByTestId('export-transactions')).toBeInTheDocument()

    expect(getCachedAuthSession).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2)
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(1, undefined)
    expect(getCachedAllTransactions).toHaveBeenNthCalledWith(2, undefined)

    const props = getLastExportProps()
    const res = await props.onExport()
    expect(getTransactionsForExport).toHaveBeenCalledWith(undefined, undefined, undefined)
    expect(res).toEqual([{ id: 'out' }])
  })
})
