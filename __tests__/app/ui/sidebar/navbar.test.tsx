import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

vi.mock('@/config/constants/navigation', () => ({
  NAV_ICON_SIZE: 20,
  NAV_TITLE: {
    HOME: 'Home',
    MONTHLY_REPORT: 'Monthly Report',
    CHART: 'Chart',
    LIMITS: 'Limits',
    SUBSCRIPTIONS: 'Subscriptions',
    CATEGORIES: 'Categories',
    EXPORT: 'Export',
    SETTINGS: 'Settings',
    FEEDBACK: 'Feedback',
    ISSUE: 'Issue',
  },
}))

vi.mock('@/config/constants/routes', () => ({
  ROUTE: {
    HOME: '/',
    MONTHLY_REPORT: '/monthly-report',
    CHART: '/chart',
    LIMITS: '/limits',
    SUBSCRIPTIONS: '/subscriptions',
    CATEGORIES: '/categories',
    EXPORT: '/export',
    SETTINGS: '/settings',
    FEEDBACK: '/feedback',
    ISSUE: '/issue',
  },
  // Disable only the EXPORT route to verify filtering behavior
  DISABLED_ROUTES: ['/export'],
}))

vi.mock('@/app/lib/helpers', () => ({
  getBreakpointWidth: (bp: string) => {
    if (bp === 'md') return '(min-width: 768px)'
    return '(min-width: 0px)'
  },
}))

vi.mock('react-use', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-use')>()
  return {
    ...actual,
    useMedia: vi.fn(),
  }
})

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

vi.mock('../../../../app/ui/sidebar/hoverables', () => {
  return {
    HoverableNavLink: ({ idx, link, isActiveLink }: any) => (
      <li
        role="listitem"
        data-testid="nav-link"
        data-idx={String(idx)}
        data-active={isActiveLink ? 'true' : 'false'}
      >
        <span>{link.title}</span>
      </li>
    ),
  }
})

vi.mock('../../../../app/ui/sidebar/logo', () => ({
  default: ({ size }: any) => <div data-testid="logo" data-size={size} />,
}))

import Navbar from '../../../../app/ui/sidebar/navbar'
import { useMedia } from 'react-use'
import { usePathname } from 'next/navigation'

describe('Navbar', () => {
  beforeEach(() => {
    vi.mocked(useMedia).mockReturnValue(true)
    vi.mocked(usePathname).mockReturnValue('/')
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders top links, filters disabled routes, and marks active link based on pathname', () => {
    vi.mocked(usePathname).mockReturnValue('/chart')

    render(<Navbar linksGroup="top" />)

    const list = screen.getByRole('list')
    const items = within(list).getAllByTestId('nav-link')

    // Top links total: 8, with '/export' disabled → 7
    expect(items).toHaveLength(7)

    // Expect titles to be present
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Monthly Report')).toBeInTheDocument()
    expect(screen.getByText('Chart')).toBeInTheDocument()
    expect(screen.getByText('Limits')).toBeInTheDocument()
    expect(screen.getByText('Subscriptions')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()

    // Disabled route should not render
    expect(screen.queryByText('Export')).not.toBeInTheDocument()

    // Active link should be 'Chart'
    const chartItem = items.find((el) => within(el).queryByText('Chart'))
    expect(chartItem).toBeTruthy()
    expect(chartItem).toHaveAttribute('data-active', 'true')

    // Others should not be active
    items.forEach((el) => {
      if (within(el).queryByText('Chart')) return
      expect(el).toHaveAttribute('data-active', 'false')
    })

    // Index ordering
    expect(items[0]).toHaveAttribute('data-idx', '0') // Home
    expect(items[1]).toHaveAttribute('data-idx', '1') // Monthly Report
  })

  it('renders bottom links and marks active link', () => {
    vi.mocked(usePathname).mockReturnValue('/feedback')

    render(<Navbar linksGroup="bottom" />)

    const list = screen.getByRole('list')
    const items = within(list).getAllByTestId('nav-link')

    expect(items).toHaveLength(2)
    expect(screen.getByText('Feedback')).toBeInTheDocument()
    expect(screen.getByText('Issue')).toBeInTheDocument()

    const activeItem = items.find((el) => within(el).queryByText('Feedback'))
    expect(activeItem).toBeTruthy()
    expect(activeItem).toHaveAttribute('data-active', 'true')

    const inactiveItem = items.find((el) => within(el).queryByText('Issue'))
    expect(inactiveItem).toBeTruthy()
    expect(inactiveItem).toHaveAttribute('data-active', 'false')
  })

  it('renders Logo when withLogo is true and uses sm size for md screens', () => {
    vi.mocked(useMedia).mockReturnValue(true) // md matches
    render(<Navbar linksGroup="top" withLogo />)
    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'sm')
  })

  it('renders Logo with xxs size when screen is below md', () => {
    vi.mocked(useMedia).mockReturnValue(false) // md does not match
    render(<Navbar linksGroup="top" withLogo />)
    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'xxs')
  })

  it('does not render Logo when withLogo is not provided', () => {
    render(<Navbar linksGroup="top" />)
    expect(screen.queryByTestId('logo')).not.toBeInTheDocument()
  })
})
