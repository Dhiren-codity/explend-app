import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

vi.mock('react-use', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-use')>()
  return { ...actual, useMedia: vi.fn() }
})

vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>()
  return { ...actual, usePathname: vi.fn() }
})

vi.mock('@/config/constants/navigation', () => {
  return {
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
  }
})

vi.mock('@/config/constants/routes', () => {
  const disabledRoutes: string[] = []
  return {
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
    DISABLED_ROUTES: disabledRoutes,
  }
})

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: (bp: string) => `(min-width: ${bp === 'md' ? '768px' : '0px'})`,
  }
})

// Mock child components used by Navbar
vi.mock('../../../../app/ui/sidebar/hoverables', () => {
  return {
    HoverableNavLink: (props: { idx: number; link: { title: string; url: string }; isActiveLink: boolean; withScale?: boolean }) => {
      const { link, isActiveLink } = props
      return (
        <li data-testid="nav-item" data-url={link.url} data-active={isActiveLink ? 'true' : 'false'}>
          {link.title}
        </li>
      )
    },
  }
})

vi.mock('../../../../app/ui/sidebar/logo', () => {
  return {
    default: (props: { size: string }) => <div data-testid="logo" data-size={props.size} />,
  }
})

import Navbar from '@/app/ui/sidebar/navbar'
import { useMedia } from 'react-use'
import { usePathname } from 'next/navigation'
import { NAV_TITLE } from '@/config/constants/navigation'
import * as routesModule from '@/config/constants/routes'

const mockUseMedia = useMedia as unknown as vi.Mock
const mockUsePathname = usePathname as unknown as vi.Mock

const setMedia = (value: boolean) => {
  mockUseMedia.mockReturnValue(value)
}

const setPathname = (value: string) => {
  mockUsePathname.mockReturnValue(value)
}

beforeEach(() => {
  vi.clearAllMocks()
  // reset disabled routes
  routesModule.DISABLED_ROUTES.length = 0
  // defaults
  setMedia(true)
  setPathname('/')
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('Navbar', () => {
  it('renders logo when withLogo is true and uses sm size on md and up', () => {
    setMedia(true)
    render(<Navbar linksGroup="top" withLogo />)
    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'sm')
  })

  it('renders logo with xxs size when below md', () => {
    setMedia(false)
    render(<Navbar linksGroup="top" withLogo />)
    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'xxs')
  })

  it('does not render logo when withLogo is false', () => {
    render(<Navbar linksGroup="top" />)
    expect(screen.queryByTestId('logo')).not.toBeInTheDocument()
  })

  it('renders all top nav links when none are disabled and marks active based on pathname', () => {
    // Ensure no disabled routes
    routesModule.DISABLED_ROUTES.length = 0
    setPathname(routesModule.ROUTE.HOME)

    render(<Navbar linksGroup="top" />)

    // Expect 8 items for top links
    const items = screen.getAllByTestId('nav-item')
    expect(items).toHaveLength(8)

    // Each title should be present
    expect(screen.getByText(NAV_TITLE.HOME)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.MONTHLY_REPORT)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.CHART)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.LIMITS)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.SUBSCRIPTIONS)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.CATEGORIES)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.EXPORT)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.SETTINGS)).toBeInTheDocument()

    // Active state is set for current path
    const activeItems = items.filter((el) => el.getAttribute('data-active') === 'true')
    expect(activeItems).toHaveLength(1)
    expect(activeItems[0]).toHaveAttribute('data-url', routesModule.ROUTE.HOME)
  })

  it('filters out disabled routes in top group', () => {
    routesModule.DISABLED_ROUTES.length = 0
    routesModule.DISABLED_ROUTES.push(routesModule.ROUTE.LIMITS, routesModule.ROUTE.EXPORT)
    setPathname('/')

    render(<Navbar linksGroup="top" />)

    const items = screen.getAllByTestId('nav-item')
    // 8 total minus 2 disabled
    expect(items).toHaveLength(6)
    expect(screen.queryByText(NAV_TITLE.LIMITS)).not.toBeInTheDocument()
    expect(screen.queryByText(NAV_TITLE.EXPORT)).not.toBeInTheDocument()

    // Ensure other titles still render
    expect(screen.getByText(NAV_TITLE.HOME)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.MONTHLY_REPORT)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.CHART)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.SUBSCRIPTIONS)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.CATEGORIES)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.SETTINGS)).toBeInTheDocument()
  })

  it('renders bottom group links and marks active based on pathname', () => {
    routesModule.DISABLED_ROUTES.length = 0
    setPathname(routesModule.ROUTE.FEEDBACK)

    render(<Navbar linksGroup="bottom" />)

    const items = screen.getAllByTestId('nav-item')
    expect(items).toHaveLength(2)

    expect(screen.getByText(NAV_TITLE.FEEDBACK)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.ISSUE)).toBeInTheDocument()

    const activeItems = items.filter((el) => el.getAttribute('data-active') === 'true')
    expect(activeItems).toHaveLength(1)
    expect(activeItems[0]).toHaveAttribute('data-url', routesModule.ROUTE.FEEDBACK)
  })

  it('filters out disabled routes in bottom group', () => {
    routesModule.DISABLED_ROUTES.length = 0
    routesModule.DISABLED_ROUTES.push(routesModule.ROUTE.ISSUE)
    setPathname('/')

    render(<Navbar linksGroup="bottom" />)

    const items = screen.getAllByTestId('nav-item')
    expect(items).toHaveLength(1)
    expect(screen.getByText(NAV_TITLE.FEEDBACK)).toBeInTheDocument()
    expect(screen.queryByText(NAV_TITLE.ISSUE)).not.toBeInTheDocument()
  })

  it('sets active only for exact pathname match', () => {
    routesModule.DISABLED_ROUTES.length = 0
    setPathname(routesModule.ROUTE.CATEGORIES)

    render(<Navbar linksGroup="top" />)

    const items = screen.getAllByTestId('nav-item')
    const activeItems = items.filter((el) => el.getAttribute('data-active') === 'true')
    expect(activeItems).toHaveLength(1)
    expect(activeItems[0]).toHaveAttribute('data-url', routesModule.ROUTE.CATEGORIES)
  })
})
