import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'

let mockIsMd = true
let mockPathname = '/'
const mockDisabledRoutes: string[] = []

vi.mock('react-use', () => ({
  useMedia: () => mockIsMd,
}))

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

vi.mock('react-icons/pi', () => {
  const Stub = (props: any) => null
  return {
    PiBugBeetle: Stub,
    PiBugBeetleFill: Stub,
    PiChatText: Stub,
    PiChatTextFill: Stub,
    PiDownloadSimple: Stub,
    PiDownloadSimpleFill: Stub,
    PiEscalatorUp: Stub,
    PiEscalatorUpFill: Stub,
    PiGearSix: Stub,
    PiGearSixFill: Stub,
    PiHouse: Stub,
    PiHouseFill: Stub,
    PiPolygon: Stub,
    PiPolygonFill: Stub,
    PiPresentationChart: Stub,
    PiPresentationChartFill: Stub,
    PiRepeat: Stub,
    PiRepeatFill: Stub,
    PiStack: Stub,
    PiStackFill: Stub,
  }
})

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
  DISABLED_ROUTES: mockDisabledRoutes,
  ROUTE: {
    HOME: '/home',
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
}))

vi.mock('@/app/lib/helpers', () => ({
  getBreakpointWidth: () => '(min-width: 768px)',
}))

vi.mock('../../../../app/ui/hoverables', () => ({
  HoverableNavLink: ({
    link,
    idx,
    isActiveLink,
  }: {
    link: { title: string; url: string }
    idx: number
    isActiveLink: boolean
  }) => (
    <li
      role="listitem"
      data-testid={`nav-link-${link.title}`}
      data-idx={idx}
      data-active={isActiveLink}
    >
      {link.title}
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

import Navbar from '../../../../app/ui/sidebar/navbar'
import { NAV_TITLE } from '@/config/constants/navigation'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  // reset mutable mocks
  mockIsMd = true
  mockPathname = '/'
  mockDisabledRoutes.splice(0, mockDisabledRoutes.length)
})

describe('Navbar - top links', () => {
  it('renders top nav links, filters disabled routes, sets active state, shows logo size sm on md', () => {
    mockIsMd = true
    mockPathname = '/settings'
    mockDisabledRoutes.splice(0, mockDisabledRoutes.length, '/export')

    render(<Navbar linksGroup="top" withLogo />)

    expect(screen.getByRole('list')).toBeInTheDocument()

    // Logo rendered with size sm for md screens
    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'sm')

    // Export is disabled
    expect(screen.queryByTestId(`nav-link-${NAV_TITLE.EXPORT}`)).toBeNull()

    // These should render
    const expected = [
      NAV_TITLE.HOME,
      NAV_TITLE.MONTHLY_REPORT,
      NAV_TITLE.CHART,
      NAV_TITLE.LIMITS,
      NAV_TITLE.SUBSCRIPTIONS,
      NAV_TITLE.CATEGORIES,
      NAV_TITLE.SETTINGS,
    ]
    expected.forEach((title) => {
      expect(screen.getByTestId(`nav-link-${title}`)).toBeInTheDocument()
    })

    // Count should be 7 (8 top links minus 1 disabled)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(7)

    // Indices should be sequential starting at 0 after filtering
    expect(screen.getByTestId(`nav-link-${NAV_TITLE.HOME}`)).toHaveAttribute('data-idx', '0')
    // Last item (Settings) index should be 6 after removing Export
    expect(screen.getByTestId(`nav-link-${NAV_TITLE.SETTINGS}`)).toHaveAttribute('data-idx', '6')

    // Active link is Settings
    expect(screen.getByTestId(`nav-link-${NAV_TITLE.SETTINGS}`)).toHaveAttribute('data-active', 'true')
    // Non-active example
    expect(screen.getByTestId(`nav-link-${NAV_TITLE.HOME}`)).toHaveAttribute('data-active', 'false')
  })

  it('renders logo with size xxs when not md', () => {
    mockIsMd = false
    render(<Navbar linksGroup="top" withLogo />)
    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'xxs')
  })

  it('does not render logo when withLogo is false', () => {
    render(<Navbar linksGroup="top" />)
    expect(screen.queryByTestId('logo')).toBeNull()
  })
})

describe('Navbar - bottom links', () => {
  it('renders bottom nav links and filters disabled routes; sets active state', () => {
    mockIsMd = true
    mockPathname = '/feedback'
    mockDisabledRoutes.splice(0, mockDisabledRoutes.length, '/issue')

    render(<Navbar linksGroup="bottom" withLogo={false} />)

    // Should render Feedback
    expect(screen.getByTestId(`nav-link-${NAV_TITLE.FEEDBACK}`)).toBeInTheDocument()
    // Issue is disabled
    expect(screen.queryByTestId(`nav-link-${NAV_TITLE.ISSUE}`)).toBeNull()

    // Only one list item after filtering
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(1)

    // Active should be Feedback
    expect(screen.getByTestId(`nav-link-${NAV_TITLE.FEEDBACK}`)).toHaveAttribute('data-active', 'true')
  })
})
