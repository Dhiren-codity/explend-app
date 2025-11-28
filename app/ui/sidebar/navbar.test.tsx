import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom';

// Mocks and shared vars

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

const NAV_TITLE = {
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
}

const mockedUsePathname = vi.fn()
const mockedUseMedia = vi.fn()
const mockedGetBreakpointWidth = vi.fn().mockReturnValue('(min-width: 768px)')

vi.mock('next/navigation', () => ({
  usePathname: mockedUsePathname,
}))

vi.mock('react-use', () => ({
  useMedia: mockedUseMedia,
}))

vi.mock('@/app/lib/helpers', () => ({
  getBreakpointWidth: mockedGetBreakpointWidth,
}))

vi.mock('@/config/constants/navigation', () => ({
  NAV_ICON_SIZE: 20,
  NAV_TITLE,
}))

vi.mock('@/config/constants/routes', () => ({
  get DISABLED_ROUTES() {
    return disabledRoutesVar
  },
  ROUTE,
}))

// Mock react-icons used by the module
const IconStub = (props: any) => null
vi.mock('react-icons/pi', () => ({
  PiBugBeetle: IconStub,
  PiBugBeetleFill: IconStub,
  PiChatText: IconStub,
  PiChatTextFill: IconStub,
  PiDownloadSimple: IconStub,
  PiDownloadSimpleFill: IconStub,
  PiEscalatorUp: IconStub,
  PiEscalatorUpFill: IconStub,
  PiGearSix: IconStub,
  PiGearSixFill: IconStub,
  PiHouse: IconStub,
  PiHouseFill: IconStub,
  PiPolygon: IconStub,
  PiPolygonFill: IconStub,
  PiPresentationChart: IconStub,
  PiPresentationChartFill: IconStub,
  PiRepeat: IconStub,
  PiRepeatFill: IconStub,
  PiStack: IconStub,
  PiStackFill: IconStub,
}))

// Mock child components
vi.mock('../hoverables', () => ({
  HoverableNavLink: (props: any) => {
    const { idx, link, isActiveLink, withScale } = props
    return (
      
      >
        {link.title}
      </li>
    )
  },
}))

vi.mock('../logo', () => ({
  default: (props: any) => {
    const { size } = props
    return <div data-testid="logo" data-size={size} />
  },
}))

// Import the component under test
import Navbar from './navbar'

describe('Navbar', () => {
  beforeEach(() => {
    disabledRoutesVar = []
    mockedUsePathname.mockReset()
    mockedUseMedia.mockReset()
    mockedGetBreakpointWidth.mockClear()
    mockedUsePathname.mockReturnValue(ROUTE.HOME)
    mockedUseMedia.mockReturnValue(true)
  })

  test('renders top links and logo with size based on media query', async () => {
    mockedUseMedia.mockReturnValue(true)

    render(<Navbar linksGroup="top" withLogo />)

    // getBreakpointWidth called with 'md'
    expect(mockedGetBreakpointWidth).toHaveBeenCalledWith('md')

    // Logo present with size 'sm' when md is true
    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'sm')

    // Renders all top links (8 defined in source)
    const items = screen.getAllByTestId('navitem')
    expect(items.length).toBe(8)

    // withScale is always true
    items.forEach((el) => {
      expect(el).toHaveAttribute('data-with-scale', 'true')
    })

    // ul with role list exists
    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  test('renders logo with size xxs when media query is false', async () => {
    mockedUseMedia.mockReturnValue(false)

    render(<Navbar linksGroup="top" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toHaveAttribute('data-size', 'xxs')
  })

  test('highlights active link based on pathname', async () => {
    mockedUsePathname.mockReturnValue(ROUTE.LIMITS)

    render(<Navbar linksGroup="top" withLogo={false} />)

    const items = screen.getAllByTestId('navitem')
    const active = items.find((el) => el.getAttribute('data-active') === 'true')
    expect(active).toBeDefined()
    expect(active?.getAttribute('data-url')).toBe(ROUTE.LIMITS)

    const nonActive = items.filter((el) => el.getAttribute('data-active') === 'false')
    expect(nonActive.length).toBe(items.length - 1)
  })

  test('filters disabled routes for bottom links', async () => {
    disabledRoutesVar = [ROUTE.ISSUE]

    render(<Navbar linksGroup="bottom" />)

    const items = screen.getAllByTestId('navitem')
    expect(items.length).toBe(1)
    expect(items[0]).toHaveAttribute('data-url', ROUTE.FEEDBACK)
  })

  test('handles unknown linksGroup by using bottom links', async () => {
    render(<Navbar linksGroup={'unknown' as any} />)

    const items = screen.getAllByTestId('navitem')
    expect(items.length).toBe(2)
    const urls = items.map((el) => el.getAttribute('data-url'))
    expect(urls.sort()).toEqual([ROUTE.FEEDBACK, ROUTE.ISSUE].sort())
  })

  test('does not render logo when withLogo is false', async () => {
    render(<Navbar linksGroup="top" />)

    expect(screen.queryByTestId('logo')).toBeNull()
  })

  test('renders empty list when all top routes are disabled', async () => {
    disabledRoutesVar = Object.values(ROUTE)

    render(<Navbar linksGroup="top" />)

    expect(screen.queryAllByTestId('navitem').length).toBe(0)
  })

  test('no active link when usePathname returns undefined (edge case)', async () => {
    mockedUsePathname.mockReturnValue(undefined as unknown as string)

    render(<Navbar linksGroup="top" />)

    const items = screen.getAllByTestId('navitem')
    items.forEach((el) => {
      expect(el).toHaveAttribute('data-active', 'false')
    })
  })

  test('passes correct idx in order', async () => {
    render(<Navbar linksGroup="bottom" />)

    const items = screen.getAllByTestId('navitem')
    expect(items[0]).toHaveAttribute('data-idx', '0')
    expect(items[1]).toHaveAttribute('data-idx', '1')
  })
})
