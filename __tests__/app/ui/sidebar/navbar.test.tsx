import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

const hoverableSpy = vi.fn((props: any) => {
  return (
    <li
      role="listitem"
      data-testid={`navlink-${props.link.title}`}
      data-active={props.isActiveLink ? 'true' : 'false'}
      data-idx={props.idx}
    >
      {props.link.title}
    </li>
  )
})

const logoSpy = vi.fn(({ size }: { size: string }) => (
  <div data-testid="logo" data-size={size}>
    Logo
  </div>
))

const usePathnameMock = vi.fn()
const useMediaMock = vi.fn()

vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    usePathname: usePathnameMock,
  }
})

vi.mock('react-use', async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    useMedia: useMediaMock,
  }
})

vi.mock('@/config/constants/navigation', () => ({
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
}))

vi.mock('@/config/constants/routes', () => ({
  ROUTE: {
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
  },
  DISABLED_ROUTES: ['/export', '/issue'],
}))

vi.mock('@/app/lib/helpers', () => ({
  getBreakpointWidth: vi.fn(() => '(min-width: 768px)'),
}))

vi.mock('../../../../app/ui/sidebar/hoverables', () => ({
  HoverableNavLink: (props: any) => hoverableSpy(props),
}))

vi.mock('../../../../app/ui/sidebar/logo', () => ({
  __esModule: true,
  default: (props: any) => logoSpy(props),
}))

import Navbar from '@/app/ui/sidebar/navbar'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('Navbar', () => {
  it('renders top nav links excluding disabled ones and sets active and idx correctly', () => {
    usePathnameMock.mockReturnValue('/chart')
    useMediaMock.mockReturnValue(true)

    render(<Navbar linksGroup="top" />)

    // List is present
    expect(screen.getByRole('list')).toBeInTheDocument()

    // Expected top titles excluding disabled "/export"
    const expectedTitles = [
      'Home',
      'Monthly report',
      'Chart',
      'Limits',
      'Subscriptions',
      'Categories',
      'Settings',
    ]

    // Present titles
    expectedTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument()
    })

    // Disabled one is not rendered
    expect(screen.queryByText('Export')).toBeNull()

    // Active link based on pathname
    expect(screen.getByTestId('navlink-Chart')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('navlink-Home')).toHaveAttribute('data-active', 'false')

    // HoverableNavLink was called for each rendered item
    expect(hoverableSpy).toHaveBeenCalledTimes(expectedTitles.length)

    // Check idx sequence and titles order
    const calledIdxs = hoverableSpy.mock.calls.map((c) => c[0].idx)
    expect(calledIdxs).toEqual(expectedTitles.map((_, i) => i))

    const calledTitles = hoverableSpy.mock.calls.map((c) => c[0].link.title)
    expect(calledTitles).toEqual(expectedTitles)
  })

  it('renders bottom nav links and filters disabled ones', () => {
    usePathnameMock.mockReturnValue('/feedback')
    useMediaMock.mockReturnValue(false)

    render(<Navbar linksGroup="bottom" />)

    expect(screen.getByRole('list')).toBeInTheDocument()

    // Feedback present, Issue disabled and not present
    expect(screen.getByText('Feedback')).toBeInTheDocument()
    expect(screen.queryByText('Issue')).toBeNull()

    // Active feedback
    expect(screen.getByTestId('navlink-Feedback')).toHaveAttribute('data-active', 'true')
  })

  it('does not render logo when withLogo is not provided', () => {
    usePathnameMock.mockReturnValue('/')

    render(<Navbar linksGroup="top" />)
    expect(screen.queryByTestId('logo')).toBeNull()
    expect(logoSpy).not.toHaveBeenCalled()
  })

  it('renders Logo with size "sm" when isMd is true', () => {
    usePathnameMock.mockReturnValue('/')
    useMediaMock.mockReturnValue(true)

    render(<Navbar linksGroup="top" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'sm')
  })

  it('renders Logo with size "xxs" when isMd is false', () => {
    usePathnameMock.mockReturnValue('/')
    useMediaMock.mockReturnValue(false)

    render(<Navbar linksGroup="top" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('data-size', 'xxs')
  })
})
