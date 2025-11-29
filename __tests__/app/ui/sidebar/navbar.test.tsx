import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// Shared constants used by mocks and tests
const ROUTES = {
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

const TITLES = {
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

let useMediaMock: ReturnType<typeof vi.fn>
let usePathnameMock: ReturnType<typeof vi.fn>

// Mock react-use with importOriginal rule preserved
vi.mock('react-use', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-use')>()
  useMediaMock = vi.fn()
  return {
    ...actual,
    useMedia: (...args: any[]) => useMediaMock(...args),
  }
})

// Mock next/navigation usePathname
vi.mock('next/navigation', () => {
  usePathnameMock = vi.fn()
  return {
    usePathname: () => usePathnameMock(),
  }
})

// Mock navigation constants
vi.mock('@/config/constants/navigation', () => ({
  NAV_ICON_SIZE: 24,
  NAV_TITLE: { ...TITLES },
}))

// Mock routes constants and disabled routes filtering
vi.mock('@/config/constants/routes', () => {
  const ROUTE = { ...ROUTES }
  const DISABLED_ROUTES = [ROUTE.EXPORT, ROUTE.ISSUE]
  return { ROUTE, DISABLED_ROUTES }
})

// Mock helper used by useMedia
vi.mock('@/app/lib/helpers', () => ({
  getBreakpointWidth: vi.fn(() => '(min-width: 768px)'),
}))

// Mock react-icons/pi to avoid rendering actual icons
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

// Mock HoverableNavLink to a predictable li for assertions
vi.mock('../../../../app/ui/sidebar/hoverables', () => ({
  HoverableNavLink: ({ link, idx, isActiveLink }: any) => (
    <li
      role="listitem"
      data-testid="hoverable-nav-link"
      data-idx={idx}
      data-active={isActiveLink}
    >
      {link.title}
    </li>
  ),
}))

// Mock Logo to assert size prop based on media query
vi.mock('../../../../app/ui/sidebar/logo', () => ({
  default: ({ size }: any) => <div data-testid="logo" data-size={size} />,
}))

import Navbar from '../../../../app/ui/sidebar/navbar'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  useMediaMock.mockReset()
  usePathnameMock.mockReset()
})

describe('Navbar', () => {
  it('renders top nav links in order and filters disabled routes', () => {
    useMediaMock.mockReturnValue(true)
    usePathnameMock.mockReturnValue('/not-matching')

    render(<Navbar linksGroup="top" />)

    // Ensure list exists
    expect(screen.getByRole('list')).toBeInTheDocument()

    const items = screen.getAllByTestId('hoverable-nav-link')
    // EXPORT is disabled => total 7 items
    const expectedOrder = [
      TITLES.HOME,
      TITLES.MONTHLY_REPORT,
      TITLES.CHART,
      TITLES.LIMITS,
      TITLES.SUBSCRIPTIONS,
      TITLES.CATEGORIES,
      TITLES.SETTINGS,
    ]

    expect(items).toHaveLength(expectedOrder.length)
    const renderedTitles = items.map((li) => li.textContent)
    expect(renderedTitles).toEqual(expectedOrder)
  })

  it('renders bottom nav links and filters disabled routes', () => {
    useMediaMock.mockReturnValue(true)
    usePathnameMock.mockReturnValue('/another')

    render(<Navbar linksGroup="bottom" />)

    const items = screen.getAllByTestId('hoverable-nav-link')
    // ISSUE is disabled => only FEEDBACK remains
    expect(items).toHaveLength(1)
    expect(items[0]).toHaveTextContent(TITLES.FEEDBACK)
  })

  it('renders Logo when withLogo is true and respects media size', () => {
    // md and up
    useMediaMock.mockReturnValue(true)
    usePathnameMock.mockReturnValue('/any')

    const { rerender } = render(<Navbar linksGroup="top" withLogo />)
    const logoMd = screen.getByTestId('logo')
    expect(logoMd).toBeInTheDocument()
    expect(logoMd).toHaveAttribute('data-size', 'sm')

    // below md
    useMediaMock.mockReturnValue(false)
    rerender(<Navbar linksGroup="top" withLogo />)
    const logoSm = screen.getByTestId('logo')
    expect(logoSm).toHaveAttribute('data-size', 'xxs')
  })

  it('marks the current route as active', () => {
    useMediaMock.mockReturnValue(true)
    usePathnameMock.mockReturnValue(ROUTES.CHART)

    render(<Navbar linksGroup="top" />)

    const items = screen.getAllByTestId('hoverable-nav-link')

    for (const item of items) {
      const title = item.textContent
      const isChart = title === TITLES.CHART
      expect(item).toHaveAttribute('data-active', String(isChart))
    }
  })
})
