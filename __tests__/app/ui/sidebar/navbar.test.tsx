import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

vi.mock('react-use', () => ({
  useMedia: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

vi.mock('@/app/lib/helpers', () => ({
  getBreakpointWidth: vi.fn(() => '(min-width: 768px)'),
}))

vi.mock('@/config/constants/navigation', () => ({
  NAV_ICON_SIZE: 16,
  NAV_TITLE: {
    HOME: 'Home',
    MONTHLY_REPORT: 'Monthly report',
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
    HOME: '/home',
    MONTHLY_REPORT: '/monthly',
    CHART: '/chart',
    LIMITS: '/limits',
    SUBSCRIPTIONS: '/subscriptions',
    CATEGORIES: '/categories',
    EXPORT: '/export',
    SETTINGS: '/settings',
    FEEDBACK: '/feedback',
    ISSUE: '/issue',
  },
  DISABLED_ROUTES: [],
}))

vi.mock('../../../../app/ui/sidebar/hoverables', () => ({
  HoverableNavLink: ({ idx, link, isActiveLink }: any) => (
    <li data-testid={`navitem-${idx}`} data-active={isActiveLink ? 'true' : 'false'}>
      {link.title}
    </li>
  ),
}))

vi.mock('../../../../app/ui/sidebar/logo', () => ({
  __esModule: true,
  default: ({ size }: any) => <div data-testid="logo" data-size={size} />,
}))

import Navbar from '../../../../app/ui/sidebar/navbar'
import { useMedia } from 'react-use'
import { usePathname } from 'next/navigation'
import * as routes from '@/config/constants/routes'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  routes.DISABLED_ROUTES.length = 0
})

describe('Navbar', () => {
  it('renders top links inside a list', () => {
    ;(useMedia as any).mockReturnValue(true)
    ;(usePathname as any).mockReturnValue('/home')

    render(<Navbar linksGroup="top" />)

    expect(screen.getByRole('list')).toBeInTheDocument()

    // Top group includes 8 items
    const items = screen.getAllByTestId(/navitem-/)
    expect(items).toHaveLength(8)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Monthly report')).toBeInTheDocument()
    expect(screen.getByText('Chart')).toBeInTheDocument()
    expect(screen.getByText('Limits')).toBeInTheDocument()
    expect(screen.getByText('Subscriptions')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()

    // Ensure bottom links are not present
    expect(screen.queryByText('Feedback')).not.toBeInTheDocument()
    expect(screen.queryByText('Issue')).not.toBeInTheDocument()
  })

  it('marks the active link based on pathname', () => {
    ;(useMedia as any).mockReturnValue(true)
    ;(usePathname as any).mockReturnValue('/chart')

    render(<Navbar linksGroup="top" />)

    expect(screen.getByText('Chart')).toHaveAttribute('data-active', 'true')
    expect(screen.getByText('Home')).toHaveAttribute('data-active', 'false')
    expect(screen.getByText('Settings')).toHaveAttribute('data-active', 'false')
  })

  it('renders bottom links only', () => {
    ;(useMedia as any).mockReturnValue(true)
    ;(usePathname as any).mockReturnValue('/feedback')

    render(<Navbar linksGroup="bottom" />)

    const items = screen.getAllByTestId(/navitem-/)
    expect(items).toHaveLength(2)

    expect(screen.getByText('Feedback')).toBeInTheDocument()
    expect(screen.getByText('Issue')).toBeInTheDocument()

    // Ensure top links are not present
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })

  it('renders Logo when withLogo is true and uses sm size on md media', () => {
    ;(useMedia as any).mockReturnValue(true)
    ;(usePathname as any).mockReturnValue('/home')

    render(<Navbar linksGroup="top" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'sm')
  })

  it('renders Logo with xxs size when media is below md', () => {
    ;(useMedia as any).mockReturnValue(false)
    ;(usePathname as any).mockReturnValue('/home')

    render(<Navbar linksGroup="top" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'xxs')
  })

  it('filters out disabled routes for top group', () => {
    ;(useMedia as any).mockReturnValue(true)
    ;(usePathname as any).mockReturnValue('/home')

    routes.DISABLED_ROUTES.push('/chart', '/export')

    render(<Navbar linksGroup="top" />)

    // Chart and Export should not be rendered
    expect(screen.queryByText('Chart')).not.toBeInTheDocument()
    expect(screen.queryByText('Export')).not.toBeInTheDocument()

    // Remaining 6 items
    const items = screen.getAllByTestId(/navitem-/)
    expect(items).toHaveLength(6)
  })

  it('filters out disabled routes for bottom group', () => {
    ;(useMedia as any).mockReturnValue(true)
    ;(usePathname as any).mockReturnValue('/home')

    routes.DISABLED_ROUTES.push('/feedback')

    render(<Navbar linksGroup="bottom" />)

    // Feedback disabled, only Issue remains
    expect(screen.queryByText('Feedback')).not.toBeInTheDocument()
    expect(screen.getByText('Issue')).toBeInTheDocument()

    const items = screen.getAllByTestId(/navitem-/)
    expect(items).toHaveLength(1)
  })
})
