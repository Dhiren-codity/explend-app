import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

// Mocks with controllable fns
const mockUsePathname = vi.fn<() => string>(() => '/')
const mockUseMedia = vi.fn<(query?: string, defaultState?: boolean) => boolean>(() => true)

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

// Mock react-use
vi.mock('react-use', () => ({
  useMedia: (query: string, defaultState?: boolean) => mockUseMedia(query, defaultState),
}))

// Mock constants used to build links
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
  const DISABLED_ROUTES = ['/export', '/issue']
  return { ROUTE, DISABLED_ROUTES }
})

// Mock helper
vi.mock('@/app/lib/helpers', () => ({
  getBreakpointWidth: (_: string) => '(min-width: 768px)',
}))

// Mock react-icons to lightweight components
vi.mock('react-icons/pi', () => {
  const Icon = (_props: any) => null
  return {
    PiBugBeetle: Icon,
    PiBugBeetleFill: Icon,
    PiChatText: Icon,
    PiChatTextFill: Icon,
    PiDownloadSimple: Icon,
    PiDownloadSimpleFill: Icon,
    PiEscalatorUp: Icon,
    PiEscalatorUpFill: Icon,
    PiGearSix: Icon,
    PiGearSixFill: Icon,
    PiHouse: Icon,
    PiHouseFill: Icon,
    PiPolygon: Icon,
    PiPolygonFill: Icon,
    PiPresentationChart: Icon,
    PiPresentationChartFill: Icon,
    PiRepeat: Icon,
    PiRepeatFill: Icon,
    PiStack: Icon,
    PiStackFill: Icon,
  }
})

// Mock HoverableNavLink - alias path
vi.mock('@/app/ui/sidebar/hoverables', () => ({
  HoverableNavLink: (props: any) => {
    const { idx, link, isActiveLink, withScale } = props
    return (
      <li
        role="listitem"
        data-testid="nav-item"
        data-idx={idx}
        data-active={isActiveLink ? 'true' : 'false'}
        data-with-scale={withScale ? 'true' : 'false'}
      >
        {link?.title}
      </li>
    )
  },
}))

// Mock HoverableNavLink - relative fallback (in case resolver uses relative specifier)
vi.mock('../hoverables', () => ({
  HoverableNavLink: (props: any) => {
    const { idx, link, isActiveLink, withScale } = props
    return (
      <li
        role="listitem"
        data-testid="nav-item"
        data-idx={idx}
        data-active={isActiveLink ? 'true' : 'false'}
        data-with-scale={withScale ? 'true' : 'false'}
      >
        {link?.title}
      </li>
    )
  },
}), { virtual: true })

// Mock Logo - alias path
vi.mock('@/app/ui/sidebar/logo', () => ({
  default: ({ size }: any) => <div data-testid="logo" data-size={size} />,
}))
// Mock Logo - relative fallback
vi.mock('../logo', () => ({
  default: ({ size }: any) => <div data-testid="logo" data-size={size} />,
}), { virtual: true })

import Navbar from '@/app/ui/sidebar/navbar'

beforeEach(() => {
  vi.clearAllMocks()
  mockUsePathname.mockReturnValue('/')
  mockUseMedia.mockImplementation(() => true)
})

afterEach(() => {
  cleanup()
})

describe('Navbar', () => {
  it('renders top nav links, filters disabled routes, marks active, passes idx/withScale, and shows Logo size sm on md', () => {
    mockUseMedia.mockReturnValue(true)
    mockUsePathname.mockReturnValue('/settings')

    render(<Navbar linksGroup="top" withLogo />)

    // list container
    const list = screen.getByRole('list')
    expect(list).toBeTruthy()

    // logo present with size sm (md breakpoint)
    const logo = screen.getByTestId('logo')
    expect(logo).toBeTruthy()
    expect(logo.getAttribute('data-size')).toBe('sm')

    // Expected titles (Export is disabled)
    const expectedTitles = [
      'Home',
      'Monthly Report',
      'Chart',
      'Limits',
      'Subscriptions',
      'Categories',
      'Settings',
    ]

    const items = screen.getAllByTestId('nav-item')
    expect(items.length).toBe(expectedTitles.length)
    expect(items.map((el) => el.textContent)).toEqual(expectedTitles)

    // idx increments and withScale is true
    items.forEach((el, idx) => {
      expect(el.getAttribute('data-idx')).toBe(String(idx))
      expect(el.getAttribute('data-with-scale')).toBe('true')
    })

    // only Settings should be active
    items.forEach((el) => {
      const isSettings = el.textContent === 'Settings'
      expect(el.getAttribute('data-active')).toBe(isSettings ? 'true' : 'false')
    })
  })

  it('renders bottom nav links and excludes disabled routes; feedback is active and Logo size xxs on non-md', () => {
    mockUseMedia.mockReturnValue(false)
    mockUsePathname.mockReturnValue('/feedback')

    render(<Navbar linksGroup="bottom" withLogo />)

    // logo present with size xxs (non-md)
    const logo = screen.getByTestId('logo')
    expect(logo).toBeTruthy()
    expect(logo.getAttribute('data-size')).toBe('xxs')

    // Only Feedback should render since Issue is disabled
    const items = screen.getAllByTestId('nav-item')
    expect(items.length).toBe(1)
    expect(items[0].textContent).toBe('Feedback')
    expect(items[0].getAttribute('data-idx')).toBe('0')
    expect(items[0].getAttribute('data-active')).toBe('true')
    expect(items[0].getAttribute('data-with-scale')).toBe('true')
  })

  it('does not render Logo when withLogo is false', () => {
    render(<Navbar linksGroup="top" withLogo={false} />)
    expect(screen.queryByTestId('logo')).toBeNull()
  })
})
