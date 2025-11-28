import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

// Mocks and shared constants
const NAV_TITLE = {
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

const DISABLED_ROUTES = [ROUTE.EXPORT, ROUTE.ISSUE]

const usePathnameMock = vi.fn<string, []>()
vi.mock('next/navigation', () => {
  return {
    usePathname: usePathnameMock,
  }
})

const useMediaMock = vi.fn<boolean, [any, any]>()
vi.mock('react-use', () => {
  return {
    useMedia: useMediaMock,
  }
})

const getBreakpointWidthMock = vi.fn<string, [string]>().mockReturnValue('(min-width: 768px)')
vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: getBreakpointWidthMock,
  }
})

vi.mock('@/config/constants/navigation', () => {
  return {
    NAV_ICON_SIZE: 20,
    NAV_TITLE,
  }
})

vi.mock('@/config/constants/routes', () => {
  return {
    DISABLED_ROUTES,
    ROUTE,
  }
})

const HoverableNavLinkSpy = vi.fn((props: any) => {
  const { link, isActiveLink, idx } = props
  return (
    <li role="listitem" data-testid="nav-link" data-active={isActiveLink ? 'true' : 'false'} data-idx={idx}>
      {link.title}
    </li>
  )
})
vi.mock('../../../../app/ui/sidebar/hoverables', () => {
  return {
    HoverableNavLink: (props: any) => HoverableNavLinkSpy(props),
  }
})

vi.mock('../../../../app/ui/sidebar/logo', () => {
  return {
    default: ({ size }: { size: string }) => (
      <div data-testid="logo" data-size={size}>
        Logo
      </div>
    ),
  }
})

import Navbar from '../../../../app/ui/sidebar/navbar'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('Navbar', () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue(ROUTE.HOME)
    useMediaMock.mockReturnValue(true)
  })

  it('renders top nav links excluding disabled routes and preserves order', () => {
    render(<Navbar linksGroup="top" withLogo={false} />)

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()

    const items = screen.getAllByTestId('nav-link')
    const titles = items.map((li) => li.textContent)
    expect(titles).toEqual([
      NAV_TITLE.HOME,
      NAV_TITLE.MONTHLY_REPORT,
      NAV_TITLE.CHART,
      NAV_TITLE.LIMITS,
      NAV_TITLE.SUBSCRIPTIONS,
      NAV_TITLE.CATEGORIES,
      // NAV_TITLE.EXPORT is disabled
      NAV_TITLE.SETTINGS,
    ])
  })

  it('renders bottom nav links excluding disabled routes', () => {
    usePathnameMock.mockReturnValue(ROUTE.FEEDBACK)
    render(<Navbar linksGroup="bottom" withLogo={false} />)

    const items = screen.getAllByTestId('nav-link')
    expect(items).toHaveLength(1)
    expect(items[0]).toHaveTextContent(NAV_TITLE.FEEDBACK)
    expect(items[0]).toHaveAttribute('data-active', 'true')
  })

  it('sets active state based on current pathname', () => {
    usePathnameMock.mockReturnValue(ROUTE.CATEGORIES)
    render(<Navbar linksGroup="top" withLogo={false} />)

    const activeItems = screen.getAllByTestId('nav-link').filter((el) => el.getAttribute('data-active') === 'true')
    expect(activeItems).toHaveLength(1)
    expect(activeItems[0]).toHaveTextContent(NAV_TITLE.CATEGORIES)
  })

  it('does not render logo when withLogo is false', () => {
    render(<Navbar linksGroup="top" withLogo={false} />)
    expect(screen.queryByTestId('logo')).toBeNull()
  })

  it('renders logo and uses sm size on md screens', () => {
    useMediaMock.mockReturnValue(true)
    render(<Navbar linksGroup="top" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'sm')

    expect(getBreakpointWidthMock).toHaveBeenCalledWith('md')
    expect(useMediaMock).toHaveBeenCalledWith('(min-width: 768px)', true)
  })

  it('renders logo and uses xxs size on non-md screens', () => {
    useMediaMock.mockReturnValue(false)
    render(<Navbar linksGroup="top" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'xxs')
  })
})
