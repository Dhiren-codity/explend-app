import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

let mockIsMd = true
let mockPathname = '/'

// Mock react-use useMedia
vi.mock('react-use', () => {
  return {
    useMedia: vi.fn(() => mockIsMd),
  }
})

// Mock next/navigation usePathname
vi.mock('next/navigation', () => {
  return {
    usePathname: () => mockPathname,
  }
})

// Mock react-icons/pi to avoid pulling in heavy dependency
vi.mock('react-icons/pi', () => {
  const stub = () => null
  return {
    PiBugBeetle: stub,
    PiBugBeetleFill: stub,
    PiChatText: stub,
    PiChatTextFill: stub,
    PiDownloadSimple: stub,
    PiDownloadSimpleFill: stub,
    PiEscalatorUp: stub,
    PiEscalatorUpFill: stub,
    PiGearSix: stub,
    PiGearSixFill: stub,
    PiHouse: stub,
    PiHouseFill: stub,
    PiPolygon: stub,
    PiPolygonFill: stub,
    PiPresentationChart: stub,
    PiPresentationChartFill: stub,
    PiRepeat: stub,
    PiRepeatFill: stub,
    PiStack: stub,
    PiStackFill: stub,
  }
})

// Mock helper
vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: () => '(min-width: 768px)',
  }
})

// Mock constants: navigation titles and icon size
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

// Mock routes and a mutable disabled routes array
const routes = {
  HOME: '/',
  MONTHLY_REPORT: '/monthly',
  CHART: '/chart',
  LIMITS: '/limits',
  SUBSCRIPTIONS: '/subscriptions',
  CATEGORIES: '/categories',
  EXPORT: '/export',
  SETTINGS: '/settings',
  FEEDBACK: '/feedback',
  ISSUE: '/issue',
}
let mockDisabledRoutes: string[] = []

vi.mock('@/config/constants/routes', () => {
  return {
    ROUTE: routes,
    DISABLED_ROUTES: mockDisabledRoutes,
  }
})

// Mock child components used by Navbar
vi.mock('../../../../app/ui/hoverables', () => {
  // Mock HoverableNavLink to render identifiable list items with props as data attributes
  const HoverableNavLink = ({
    idx,
    link,
    isActiveLink,
    withScale,
  }: {
    idx: number
    link: { title: string; url: string }
    isActiveLink?: boolean
    withScale?: boolean
  }) => (
    <li
      data-testid={`hover-link-${idx}`}
      data-title={link.title}
      data-url={link.url}
      data-active={isActiveLink ? 'true' : 'false'}
      data-with-scale={withScale ? 'true' : 'false'}
    >
      {link.title}
    </li>
  )
  return { HoverableNavLink }
})

vi.mock('../../../../app/ui/logo', () => {
  const Logo = ({ size }: { size: string }) => (
    <div data-testid="logo" data-size={size}>
      Logo
    </div>
  )
  return { default: Logo }
})

import Navbar from '../../../../app/ui/sidebar/navbar'

describe('Navbar', () => {
  beforeEach(() => {
    mockIsMd = true
    mockPathname = '/'
    mockDisabledRoutes.length = 0
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders a list of top nav links and filters disabled routes', () => {
    mockDisabledRoutes.push('/limits')

    render(<Navbar linksGroup="top" />)

    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.queryByTestId('logo')).not.toBeInTheDocument()

    const items = screen.getAllByTestId(/hover-link-/)
    // Top group has 8 links; 1 disabled => 7
    expect(items).toHaveLength(7)

    // Disabled "Limits" should not be present
    expect(screen.queryByText('Limits')).not.toBeInTheDocument()

    // First visible item should be "Home"
    const first = screen.getByTestId('hover-link-0')
    expect(first).toHaveAttribute('data-title', 'Home')
    expect(first).toHaveAttribute('data-url', '/')
    expect(first).toHaveAttribute('data-with-scale', 'true')

    // Indices should be sequential starting from 0..6
    for (let i = 0; i < 7; i++) {
      expect(screen.getByTestId(`hover-link-${i}`)).toBeInTheDocument()
    }
    expect(screen.queryByTestId('hover-link-7')).not.toBeInTheDocument()
  })

  it('marks the active link based on the current pathname (top group)', () => {
    mockPathname = '/chart'

    render(<Navbar linksGroup="top" />)

    const active = screen.getByText('Chart').closest('li')
    expect(active).toHaveAttribute('data-active', 'true')

    const inactive = screen.getByText('Home').closest('li')
    expect(inactive).toHaveAttribute('data-active', 'false')
  })

  it('renders bottom group and filters disabled routes', () => {
    mockDisabledRoutes.push('/issue')
    mockPathname = '/feedback'

    render(<Navbar linksGroup="bottom" />)

    const items = screen.getAllByTestId(/hover-link-/)
    // Bottom group has 2 links; 1 disabled => 1
    expect(items).toHaveLength(1)

    expect(screen.getByText('Feedback')).toBeInTheDocument()
    expect(screen.queryByText('Issue')).not.toBeInTheDocument()

    const feedback = screen.getByText('Feedback').closest('li')
    expect(feedback).toHaveAttribute('data-active', 'true')
  })

  it('shows Logo when withLogo is true and size is sm on md screens', () => {
    mockIsMd = true
    render(<Navbar linksGroup="top" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'sm')
  })

  it('shows Logo with size xxs on small screens (isMd=false)', () => {
    mockIsMd = false
    render(<Navbar linksGroup="bottom" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'xxs')
  })

  it('renders empty list when all routes in a group are disabled', () => {
    mockDisabledRoutes.push('/feedback', '/issue')

    render(<Navbar linksGroup="bottom" />)

    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.queryAllByTestId(/hover-link-/)).toHaveLength(0)
  })
})
