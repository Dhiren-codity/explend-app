import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

// Mocks
vi.mock('react-icons/pi', () => {
  // Return no-op components for all icons used
  const noop = () => null
  return {
    PiBugBeetle: noop,
    PiBugBeetleFill: noop,
    PiChatText: noop,
    PiChatTextFill: noop,
    PiDownloadSimple: noop,
    PiDownloadSimpleFill: noop,
    PiEscalatorUp: noop,
    PiEscalatorUpFill: noop,
    PiGearSix: noop,
    PiGearSixFill: noop,
    PiHouse: noop,
    PiHouseFill: noop,
    PiPolygon: noop,
    PiPolygonFill: noop,
    PiPresentationChart: noop,
    PiPresentationChartFill: noop,
    PiRepeat: noop,
    PiRepeatFill: noop,
    PiStack: noop,
    PiStackFill: noop,
  }
})

vi.mock('react-use', () => {
  return {
    useMedia: vi.fn(),
  }
})

vi.mock('next/navigation', () => {
  return {
    usePathname: vi.fn(),
  }
})

vi.mock('@/config/constants/navigation', () => {
  return {
    NAV_ICON_SIZE: 24,
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
  } as const

  // Export a mutable array so tests can add/remove disabled routes dynamically
  const DISABLED_ROUTES: string[] = []

  return {
    ROUTE,
    DISABLED_ROUTES,
  }
})

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: (bp: string) => {
      if (bp === 'md') return '(min-width: 768px)'
      return '(min-width: 0px)'
    },
  }
})

vi.mock('../../../../app/ui/sidebar/hoverables', () => {
  return {
    HoverableNavLink: ({
      idx,
      link,
      isActiveLink,
    }: {
      idx: number
      link: { title: string; url: string }
      isActiveLink: boolean
    }) => (
      <li
        role="listitem"
        data-testid={`nav-item-${idx}`}
        data-title={link.title}
        data-url={link.url}
        data-active={isActiveLink ? 'true' : 'false'}
      >
        {link.title}
      </li>
    ),
  }
})

vi.mock('../../../../app/ui/sidebar/logo', () => {
  return {
    default: ({ size }: { size: string }) => (
      <div data-testid="logo" data-size={size} />
    ),
  }
})

// Imports after mocks so they use mocked modules
import { useMedia } from 'react-use'
import { usePathname } from 'next/navigation'
import { DISABLED_ROUTES, ROUTE } from '@/config/constants/routes'
import Navbar from '../../../../app/ui/sidebar/navbar'

const useMediaMock = useMedia as unknown as vi.Mock
const usePathnameMock = usePathname as unknown as vi.Mock

beforeEach(() => {
  useMediaMock.mockReset()
  usePathnameMock.mockReset()
  useMediaMock.mockReturnValue(true)
  usePathnameMock.mockReturnValue('/')
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  DISABLED_ROUTES.length = 0
})

describe('Navbar', () => {
  it('renders top links (excluding none when DISABLED_ROUTES is empty)', () => {
    render(<Navbar linksGroup="top" />)

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()

    const items = screen.getAllByRole('listitem')
    // Expect 8 top links: Home, Monthly report, Chart, Limits, Subscriptions, Categories, Export, Settings
    expect(items).toHaveLength(8)

    // Smoke check for a couple of known titles
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Chart')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders bottom links', () => {
    render(<Navbar linksGroup="bottom" />)

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)

    expect(screen.getByText('Feedback')).toBeInTheDocument()
    expect(screen.getByText('Issue')).toBeInTheDocument()
  })

  it('filters links based on DISABLED_ROUTES for top group', () => {
    DISABLED_ROUTES.push(ROUTE.LIMITS)

    render(<Navbar linksGroup="top" />)

    expect(screen.queryByText('Limits')).not.toBeInTheDocument()
    // Others remain
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Chart')).toBeInTheDocument()
  })

  it('filters links based on DISABLED_ROUTES for bottom group', () => {
    DISABLED_ROUTES.push(ROUTE.ISSUE)

    render(<Navbar linksGroup="bottom" />)

    expect(screen.getByText('Feedback')).toBeInTheDocument()
    expect(screen.queryByText('Issue')).not.toBeInTheDocument()
  })

  it('marks the current route as active', () => {
    usePathnameMock.mockReturnValue('/chart')

    render(<Navbar linksGroup="top" />)

    const chartItem = screen.getByText('Chart').closest('li')
    const homeItem = screen.getByText('Home').closest('li')
    expect(chartItem).toHaveAttribute('data-active', 'true')
    expect(homeItem).toHaveAttribute('data-active', 'false')
  })

  it('renders Logo with size "sm" on md and above', () => {
    useMediaMock.mockReturnValue(true)

    render(<Navbar linksGroup="top" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'sm')
  })

  it('renders Logo with size "xxs" below md', () => {
    useMediaMock.mockReturnValue(false)

    render(<Navbar linksGroup="top" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'xxs')
  })
})
