import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, within, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mocks and shared state
let mockIsMd = true
vi.mock('react-use', () => {
  return {
    useMedia: vi.fn((_query: string, _defaultState?: boolean) => mockIsMd),
  }
})

let mockPathname = '/'
vi.mock('next/navigation', () => {
  return {
    usePathname: () => mockPathname,
  }
})

const NAV_TITLE_CONST = {
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
}

const ROUTE_CONST = {
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

let disabledRoutes: string[] = []

vi.mock('@/config/constants/navigation', () => {
  return {
    NAV_ICON_SIZE: 20,
    NAV_TITLE: NAV_TITLE_CONST,
  }
})

vi.mock('@/config/constants/routes', () => {
  return {
    get DISABLED_ROUTES() {
      return disabledRoutes
    },
    ROUTE: ROUTE_CONST,
  }
})

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: (_bp: string) => '(min-width: 768px)',
  }
})

vi.mock('../../../../app/ui/sidebar/hoverables', () => {
  return {
    HoverableNavLink: ({ idx, link, isActiveLink }: any) => (
      <li
        data-testid={`nav-link-${link.title}`}
        data-idx={idx}
        data-active={isActiveLink ? 'true' : 'false'}
      >
        {link.title}
      </li>
    ),
  }
})

vi.mock('../../../../app/ui/sidebar/logo', () => {
  return {
    default: ({ size }: any) => <div data-testid="logo">Logo size: {size}</div>,
  }
})

import Navbar from '../../../../app/ui/sidebar/navbar'

describe('Navbar', () => {
  beforeEach(() => {
    mockIsMd = true
    mockPathname = '/'
    disabledRoutes = []
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders top nav links, filters disabled routes, and marks active link', () => {
    disabledRoutes = [ROUTE_CONST.EXPORT, ROUTE_CONST.CHART]
    mockPathname = ROUTE_CONST.LIMITS

    render(<Navbar linksGroup="top" withLogo />)

    // Logo is visible and respects md breakpoint
    expect(screen.getByTestId('logo')).toHaveTextContent('Logo size: sm')

    // Present links (filtered)
    expect(screen.getByTestId('nav-link-Home')).toBeInTheDocument()
    expect(screen.getByTestId('nav-link-Monthly report')).toBeInTheDocument()
    expect(screen.getByTestId('nav-link-Limits')).toBeInTheDocument()
    expect(screen.getByTestId('nav-link-Subscriptions')).toBeInTheDocument()
    expect(screen.getByTestId('nav-link-Categories')).toBeInTheDocument()
    expect(screen.getByTestId('nav-link-Settings')).toBeInTheDocument()

    // Disabled links are not rendered
    expect(screen.queryByTestId('nav-link-Export')).not.toBeInTheDocument()
    expect(screen.queryByTestId('nav-link-Chart')).not.toBeInTheDocument()

    // Active state
    expect(screen.getByTestId('nav-link-Limits')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('nav-link-Home')).toHaveAttribute('data-active', 'false')

    // Count matches expected (8 total top links - 2 disabled = 6)
    const list = screen.getByRole('list')
    const items = within(list).getAllByTestId(/nav-link-/)
    expect(items).toHaveLength(6)
  })

  it('renders bottom nav links and marks active based on pathname', () => {
    mockPathname = ROUTE_CONST.FEEDBACK

    render(<Navbar linksGroup="bottom" />)

    const list = screen.getByRole('list')
    const items = within(list).getAllByTestId(/nav-link-/)
    expect(items).toHaveLength(2)

    expect(screen.getByTestId('nav-link-Feedback')).toBeInTheDocument()
    expect(screen.getByTestId('nav-link-Issue')).toBeInTheDocument()

    expect(screen.getByTestId('nav-link-Feedback')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('nav-link-Issue')).toHaveAttribute('data-active', 'false')
  })

  it('renders Logo with size "sm" when md breakpoint matches', () => {
    mockIsMd = true
    render(<Navbar linksGroup="top" withLogo />)
    expect(screen.getByTestId('logo')).toHaveTextContent('Logo size: sm')
  })

  it('renders Logo with size "xxs" when md breakpoint does not match', () => {
    mockIsMd = false
    render(<Navbar linksGroup="top" withLogo />)
    expect(screen.getByTestId('logo')).toHaveTextContent('Logo size: xxs')
  })

  it('does not render Logo when withLogo is false', () => {
    render(<Navbar linksGroup="top" />)
    expect(screen.queryByTestId('logo')).not.toBeInTheDocument()
  })
})
