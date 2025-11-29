import { describe, it, expect, vi, afterEach, type Mock } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024-01-01'),
  subMonths: vi.fn(() => new Date('2024-01-01')),
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

vi.mock('react-use', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-use')>()
  return {
    ...actual,
    useMedia: vi.fn(),
  }
})

vi.mock('@/app/lib/helpers', () => ({
  getBreakpointWidth: vi.fn(() => '(min-width: 768px)'),
}))

vi.mock('../../../../app/ui/hoverables', () => ({
  HoverableNavLink: ({ link, isActiveLink }: any) => (
    <li
      data-testid={`nav-link-${link.title}`}
      data-url={link.url}
      data-active={isActiveLink ? 'true' : 'false'}
    >
      <a href={link.url}>{link.title}</a>
    </li>
  ),
}))

vi.mock('../../../../app/ui/logo', () => ({
  default: ({ size }: { size: string }) => (
    <div data-testid="logo" data-size={size}>
      Logo
    </div>
  ),
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

vi.mock('@/config/constants/routes', () => {
  const ROUTE = {
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
  }
  const DISABLED_ROUTES = [ROUTE.CHART, ROUTE.EXPORT, ROUTE.ISSUE]
  return { ROUTE, DISABLED_ROUTES }
})

import { useMedia } from 'react-use'
import { usePathname } from 'next/navigation'
import Navbar from '../../../../app/ui/sidebar/navbar'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('Navbar', () => {
  it('renders top links, filters disabled ones, and marks active link', () => {
    ;(useMedia as unknown as Mock).mockReturnValue(true)
    ;(usePathname as unknown as Mock).mockReturnValue('/settings')

    render(<Navbar linksGroup="top" />)

    expect(screen.getByTestId('nav-link-Home')).toBeInTheDocument()
    expect(screen.getByTestId('nav-link-Monthly report')).toBeInTheDocument()
    expect(screen.getByTestId('nav-link-Limits')).toBeInTheDocument()
    expect(screen.getByTestId('nav-link-Subscriptions')).toBeInTheDocument()
    expect(screen.getByTestId('nav-link-Categories')).toBeInTheDocument()
    expect(screen.getByTestId('nav-link-Settings')).toBeInTheDocument()

    expect(screen.queryByTestId('nav-link-Chart')).not.toBeInTheDocument()
    expect(screen.queryByTestId('nav-link-Export')).not.toBeInTheDocument()

    expect(screen.getByTestId('nav-link-Settings')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('nav-link-Home')).toHaveAttribute('data-active', 'false')

    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('renders bottom links, filters disabled ones, and marks active link', () => {
    ;(useMedia as unknown as Mock).mockReturnValue(true)
    ;(usePathname as unknown as Mock).mockReturnValue('/feedback')

    render(<Navbar linksGroup="bottom" />)

    expect(screen.getByTestId('nav-link-Feedback')).toBeInTheDocument()
    expect(screen.queryByTestId('nav-link-Issue')).not.toBeInTheDocument()
    expect(screen.getByTestId('nav-link-Feedback')).toHaveAttribute('data-active', 'true')
  })

  it('renders Logo when withLogo is true and uses sm size on md screens', () => {
    ;(useMedia as unknown as Mock).mockReturnValue(true)
    ;(usePathname as unknown as Mock).mockReturnValue('/')

    render(<Navbar linksGroup="top" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'sm')
  })

  it('uses xxs logo size when not md screen', () => {
    ;(useMedia as unknown as Mock).mockReturnValue(false)
    ;(usePathname as unknown as Mock).mockReturnValue('/')

    render(<Navbar linksGroup="top" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'xxs')
  })

  it('does not render Logo when withLogo is false/omitted', () => {
    ;(useMedia as unknown as Mock).mockReturnValue(true)
    ;(usePathname as unknown as Mock).mockReturnValue('/')

    render(<Navbar linksGroup="top" />)

    expect(screen.queryByTestId('logo')).not.toBeInTheDocument()
  })
})