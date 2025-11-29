import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

const useMediaMock = vi.fn().mockReturnValue(true)
vi.mock('react-use', () => ({
  useMedia: (q: string, d?: boolean) => useMediaMock(q, d),
}))

const usePathnameMock = vi.fn().mockReturnValue('/')
vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}))

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
  const DISABLED_ROUTES: string[] = []
  return { ROUTE, DISABLED_ROUTES }
})

vi.mock('@/app/lib/helpers', () => ({
  getBreakpointWidth: (bp: string) => `(min-width: ${bp})`,
}))

vi.mock('react-icons/pi', () => {
  const Comp = (props: any) => null
  return {
    PiBugBeetle: Comp,
    PiBugBeetleFill: Comp,
    PiChatText: Comp,
    PiChatTextFill: Comp,
    PiDownloadSimple: Comp,
    PiDownloadSimpleFill: Comp,
    PiEscalatorUp: Comp,
    PiEscalatorUpFill: Comp,
    PiGearSix: Comp,
    PiGearSixFill: Comp,
    PiHouse: Comp,
    PiHouseFill: Comp,
    PiPolygon: Comp,
    PiPolygonFill: Comp,
    PiPresentationChart: Comp,
    PiPresentationChartFill: Comp,
    PiRepeat: Comp,
    PiRepeatFill: Comp,
    PiStack: Comp,
    PiStackFill: Comp,
  }
})

vi.mock('../../../../app/ui/sidebar/hoverables', () => ({
  HoverableNavLink: ({ idx, link, isActiveLink }: any) => (
    <li role="listitem" data-idx={idx} data-active={isActiveLink ? 'true' : 'false'}>
      <span>{link.title}</span>
    </li>
  ),
}))

vi.mock('../../../../app/ui/sidebar/logo', () => ({
  default: ({ size }: any) => <div data-testid="logo" data-size={size} />,
}))

async function renderNavbar(props: any) {
  const Navbar = (await import('../../../../app/ui/sidebar/navbar')).default
  return render(<Navbar {...props} />)
}

beforeEach(async () => {
  cleanup()
  useMediaMock.mockReset()
  usePathnameMock.mockReset()
  useMediaMock.mockReturnValue(true)
  usePathnameMock.mockReturnValue('/')
  const routes = await import('@/config/constants/routes')
  routes.DISABLED_ROUTES.length = 0
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('Navbar', () => {
  it('renders top links, filters disabled route, and marks active item', async () => {
    const { ROUTE, DISABLED_ROUTES } = await import('@/config/constants/routes')
    const { NAV_TITLE } = await import('@/config/constants/navigation')

    DISABLED_ROUTES.push(ROUTE.EXPORT)
    usePathnameMock.mockReturnValue(ROUTE.SETINGS ?? ROUTE.SETTINGS)

    await renderNavbar({ linksGroup: 'top' })

    expect(screen.getByText(NAV_TITLE.HOME)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.MONTHLY_REPORT)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.CHART)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.LIMITS)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.SUBSCRIPTIONS)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.CATEGORIES)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.SETTINGS)).toBeInTheDocument()

    expect(screen.queryByText(NAV_TITLE.EXPORT)).not.toBeInTheDocument()

    const items = screen.getAllByRole('listitem')
    expect(items.length).toBe(7)

    const activeItem = screen.getByText(NAV_TITLE.SETTINGS).closest('[role="listitem"]')
    expect(activeItem).toHaveAttribute('data-active', 'true')
  })

  it('renders bottom link group and respects disabled routes', async () => {
    const { ROUTE, DISABLED_ROUTES } = await import('@/config/constants/routes')
    const { NAV_TITLE } = await import('@/config/constants/navigation')

    await renderNavbar({ linksGroup: 'bottom' })
    expect(screen.getByText(NAV_TITLE.FEEDBACK)).toBeInTheDocument()
    expect(screen.getByText(NAV_TITLE.ISSUE)).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').length).toBe(2)

    cleanup()

    DISABLED_ROUTES.push(ROUTE.ISSUE)
    await renderNavbar({ linksGroup: 'bottom' })
    expect(screen.getByText(NAV_TITLE.FEEDBACK)).toBeInTheDocument()
    expect(screen.queryByText(NAV_TITLE.ISSUE)).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem').length).toBe(1)
  })

  it('renders Logo with correct size based on media query and withLogo flag', async () => {
    useMediaMock.mockReturnValue(true)
    await renderNavbar({ linksGroup: 'top', withLogo: true })
    expect(screen.getByTestId('logo')).toHaveAttribute('data-size', 'sm')

    cleanup()

    useMediaMock.mockReturnValue(false)
    await renderNavbar({ linksGroup: 'top', withLogo: true })
    expect(screen.getByTestId('logo')).toHaveAttribute('data-size', 'xxs')

    cleanup()

    await renderNavbar({ linksGroup: 'top', withLogo: false })
    expect(screen.queryByTestId('logo')).not.toBeInTheDocument()
  })

  it('passes sequential idx to items', async () => {
    const { ROUTE, DISABLED_ROUTES } = await import('@/config/constants/routes')
    DISABLED_ROUTES.push(ROUTE.EXPORT)

    await renderNavbar({ linksGroup: 'top' })
    const items = screen.getAllByRole('listitem')
    items.forEach((item, i) => {
      expect(item).toHaveAttribute('data-idx', String(i))
    })
  })
})
