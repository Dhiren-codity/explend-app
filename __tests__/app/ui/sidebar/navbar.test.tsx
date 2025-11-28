import React from 'react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

vi.mock('react-use', () => ({
  useMedia: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

vi.mock('@/config/constants/navigation', () => ({
  NAV_ICON_SIZE: 20,
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
    SUBSCRIPTIONS: '/subs',
    CATEGORIES: '/categories',
    EXPORT: '/export',
    SETTINGS: '/settings',
    FEEDBACK: '/feedback',
    ISSUE: '/issue',
  },
  DISABLED_ROUTES: ['/export'],
}))

vi.mock('@/app/lib/helpers', () => ({
  getBreakpointWidth: vi.fn(() => '(min-width: 768px)'),
}))

vi.mock('../../../../app/ui/sidebar/hoverables', () => ({
  HoverableNavLink: (props: any) => {
    const { idx, link, isActiveLink } = props
    return (
      <li role="listitem" data-testid={`nav-item-${idx}`} data-active={isActiveLink ? 'true' : 'false'}>
        {link.title}
      </li>
    )
  },
}), { virtual: true })

vi.mock('../../../../app/ui/sidebar/logo', () => ({
  default: ({ size }: any) => <div data-testid="logo">Logo size:{size}</div>,
}), { virtual: true })

import Navbar from '../../../../app/ui/sidebar/navbar'
import { useMedia } from 'react-use'
import { usePathname } from 'next/navigation'
import { getBreakpointWidth } from '@/app/lib/helpers'
import { DISABLED_ROUTES } from '@/config/constants/routes'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('Navbar', () => {
  beforeEach(() => {
    ;(useMedia as unknown as vi.Mock).mockReturnValue(true)
    ;(usePathname as unknown as vi.Mock).mockReturnValue('/home')
    // Reset disabled routes to default ['/export'] before each test
    DISABLED_ROUTES.splice(0, DISABLED_ROUTES.length, '/export')
  })

  it('renders top links, filters disabled routes, and highlights the active link', () => {
    ;(usePathname as unknown as vi.Mock).mockReturnValue('/settings')

    render(<Navbar linksGroup="top" />)

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()

    // Top nav has 8 items total; with '/export' disabled -> 7 items
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(7)

    // Ensure expected titles are present, and disabled one is not
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Monthly report')).toBeInTheDocument()
    expect(screen.getByText('Chart')).toBeInTheDocument()
    expect(screen.getByText('Limits')).toBeInTheDocument()
    expect(screen.getByText('Subscriptions')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.queryByText('Export')).not.toBeInTheDocument()

    // Active link should be 'Settings'
    expect(screen.getByText('Settings').closest('li')).toHaveAttribute('data-active', 'true')
    expect(screen.getByText('Home').closest('li')).toHaveAttribute('data-active', 'false')
  })

  it('renders bottom links and applies disabled filtering', () => {
    // Disable '/issue' for this test
    DISABLED_ROUTES.splice(0, DISABLED_ROUTES.length, '/issue')
    ;(usePathname as unknown as vi.Mock).mockReturnValue('/feedback')

    render(<Navbar linksGroup="bottom" />)

    const items = screen.getAllByRole('listitem')
    // Bottom has 2; with '/issue' disabled -> 1
    expect(items).toHaveLength(1)

    expect(screen.getByText('Feedback')).toBeInTheDocument()
    expect(screen.queryByText('Issue')).not.toBeInTheDocument()

    expect(screen.getByText('Feedback').closest('li')).toHaveAttribute('data-active', 'true')
  })

  it('renders Logo when withLogo is true and passes size "sm" when isMd is true', () => {
    ;(useMedia as unknown as vi.Mock).mockReturnValue(true)
    ;(usePathname as unknown as vi.Mock).mockReturnValue('/home')

    render(<Navbar linksGroup="top" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveTextContent('Logo size:sm')

    expect(getBreakpointWidth).toHaveBeenCalledWith('md')
    expect(useMedia).toHaveBeenCalledWith('(min-width: 768px)', true)
  })

  it('uses Logo size "xxs" when isMd is false', () => {
    ;(useMedia as unknown as vi.Mock).mockReturnValue(false)
    ;(usePathname as unknown as vi.Mock).mockReturnValue('/home')

    render(<Navbar linksGroup="top" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveTextContent('Logo size:xxs')
  })

  it('does not render the Logo when withLogo is false', () => {
    render(<Navbar linksGroup="top" withLogo={false} />)
    expect(screen.queryByTestId('logo')).not.toBeInTheDocument()
  })
})
