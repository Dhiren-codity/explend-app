import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// Mocks
vi.mock('react-use', () => ({
  useMedia: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
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
  },
  DISABLED_ROUTES: ['/export'],
}))

vi.mock('@/app/lib/helpers', () => ({
  getBreakpointWidth: vi.fn(() => '(min-width: 768px)'),
}))

vi.mock('react-icons/pi', () => {
  const Icon = (props: any) => <span data-testid="icon" {...props} />
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

// Mock local components used by Navbar
vi.mock('../../../../app/ui/sidebar/hoverables', () => ({
  HoverableNavLink: ({ link, isActiveLink }: any) => (
    <li role="listitem" data-active={isActiveLink ? 'true' : 'false'}>
      {link.title}
    </li>
  ),
}), { virtual: true })

vi.mock('../../../../app/ui/sidebar/logo', () => ({
  __esModule: true,
  default: ({ size }: any) => <div data-testid="logo" data-size={size}>Logo</div>,
}), { virtual: true })

import { useMedia } from 'react-use'
import { usePathname } from 'next/navigation'
import Navbar from '../../../../app/ui/sidebar/navbar'

describe('Navbar', () => {
  beforeEach(() => {
    (useMedia as unknown as vi.Mock).mockReturnValue(true)
    ;(usePathname as unknown as vi.Mock).mockReturnValue('/')
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders top links and excludes disabled routes; no logo by default', () => {
    render(<Navbar linksGroup="top" />)

    const list = screen.getByRole('list')
    const items = within(list).getAllByRole('listitem')
    // Top has 8 items total, one disabled ('/export') => 7 rendered
    expect(items).toHaveLength(7)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Monthly report')).toBeInTheDocument()
    expect(screen.getByText('Chart')).toBeInTheDocument()
    expect(screen.getByText('Limits')).toBeInTheDocument()
    expect(screen.getByText('Subscriptions')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()

    expect(screen.queryByText('Export')).not.toBeInTheDocument()
    expect(screen.queryByTestId('logo')).not.toBeInTheDocument()
  })

  it('marks a link as active when pathname matches', () => {
    ;(usePathname as unknown as vi.Mock).mockReturnValue('/settings')
    render(<Navbar linksGroup="top" />)

    const activeItem = screen.getByText('Settings')
    expect(activeItem).toHaveAttribute('data-active', 'true')

    const inactiveItem = screen.getByText('Home')
    expect(inactiveItem).toHaveAttribute('data-active', 'false')
  })

  it('renders bottom links group', () => {
    ;(usePathname as unknown as vi.Mock).mockReturnValue('/feedback')
    render(<Navbar linksGroup="bottom" />)

    const list = screen.getByRole('list')
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(2)

    expect(screen.getByText('Feedback')).toBeInTheDocument()
    expect(screen.getByText('Issue')).toBeInTheDocument()
    expect(screen.queryByText('Home')).not.toBeInTheDocument()

    expect(screen.getByText('Feedback')).toHaveAttribute('data-active', 'true')
    expect(screen.getByText('Issue')).toHaveAttribute('data-active', 'false')
  })

  it('renders logo with sm size on md screens', () => {
    ;(useMedia as unknown as vi.Mock).mockReturnValue(true)
    render(<Navbar linksGroup="top" withLogo />)
    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'sm')
  })

  it('renders logo with xxs size on small screens', () => {
    ;(useMedia as unknown as vi.Mock).mockReturnValue(false)
    render(<Navbar linksGroup="top" withLogo />)
    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'xxs')
  })
})
