import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'

vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>()
  return {
    ...actual,
    usePathname: vi.fn(),
  }
})

vi.mock('react-use', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-use')>()
  return {
    ...actual,
    useMedia: vi.fn(),
  }
})

vi.mock('@/app/lib/helpers', () => ({
  getBreakpointWidth: vi.fn(() => '(min-width: 768px)'),
}))

vi.mock('../../../../app/ui/hoverables', () => ({
  HoverableNavLink: ({ idx, link, isActiveLink }: any) => (
    <li
      role="listitem"
      data-testid="nav-link"
      data-idx={idx}
      data-url={link?.url}
      data-title={link?.title}
      data-active={isActiveLink ? 'true' : 'false'}
    >
      {link?.title}
    </li>
  ),
}))

vi.mock('../../../../app/ui/logo', () => ({
  default: ({ size }: any) => <div data-testid="logo" data-size={size} />,
}))

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
  DISABLED_ROUTES: ['/export'],
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
}))

import Navbar from '../../../../app/ui/sidebar/navbar'
import { getBreakpointWidth } from '@/app/lib/helpers'
import { useMedia } from 'react-use'
import { usePathname } from 'next/navigation'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('Navbar', () => {
  it('renders logo with size "sm" when withLogo and media is md', () => {
    ;(useMedia as unknown as vi.Mock).mockReturnValue(true)
    ;(usePathname as unknown as vi.Mock).mockReturnValue('/settings')

    render(<Navbar linksGroup="top" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeTruthy()
    expect(logo.getAttribute('data-size')).toBe('sm')

    // list is present
    expect(screen.getByRole('list')).toBeTruthy()

    // top links: 8 defined, 1 disabled ('/export') => 7 rendered
    const navLinks = screen.getAllByTestId('nav-link')
    expect(navLinks).toHaveLength(7)

    // active link matches pathname strictly
    const active = navLinks.find((n) => n.getAttribute('data-active') === 'true')
    expect(!!active).toBe(true)
    expect(active?.getAttribute('data-url')).toBe('/settings')

    // ensure disabled route '/export' is filtered out
    const exportLink = navLinks.find((n) => n.getAttribute('data-url') === '/export')
    expect(exportLink).toBeUndefined()

    // idxs are sequential starting at 0
    expect(navLinks[0].getAttribute('data-idx')).toBe('0')
    expect(navLinks[navLinks.length - 1].getAttribute('data-idx')).toBe(String(navLinks.length - 1))

    // verify breakpoint helper is called
    expect(getBreakpointWidth).toHaveBeenCalledWith('md')
  })

  it('renders logo with size "xxs" when withLogo and media is not md', () => {
    ;(useMedia as unknown as vi.Mock).mockReturnValue(false)
    ;(usePathname as unknown as vi.Mock).mockReturnValue('/settings')

    render(<Navbar linksGroup="top" withLogo />)

    const logo = screen.getByTestId('logo')
    expect(logo).toBeTruthy()
    expect(logo.getAttribute('data-size')).toBe('xxs')
  })

  it('renders top links without logo when withLogo is not provided', () => {
    ;(useMedia as unknown as vi.Mock).mockReturnValue(true)
    ;(usePathname as unknown as vi.Mock).mockReturnValue('/chart')

    render(<Navbar linksGroup="top" />)

    expect(screen.queryByTestId('logo')).toBeNull()

    const navLinks = screen.getAllByTestId('nav-link')
    expect(navLinks).toHaveLength(7)

    const active = navLinks.find((n) => n.getAttribute('data-active') === 'true')
    expect(active?.getAttribute('data-url')).toBe('/chart')
  })

  it('renders bottom links and sets active correctly', () => {
    ;(useMedia as unknown as vi.Mock).mockReturnValue(true)
    ;(usePathname as unknown as vi.Mock).mockReturnValue('/issue')

    render(<Navbar linksGroup="bottom" />)

    const navLinks = screen.getAllByTestId('nav-link')
    expect(navLinks).toHaveLength(2)

    const urls = navLinks.map((n) => n.getAttribute('data-url'))
    expect(urls).toEqual(expect.arrayContaining(['/feedback', '/issue']))

    const active = navLinks.find((n) => n.getAttribute('data-active') === 'true')
    expect(active?.getAttribute('data-url')).toBe('/issue')
  })
})