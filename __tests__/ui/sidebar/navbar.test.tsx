import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// Mocks and shared state
let pathnameValue: string = '/';
let useMediaReturn: boolean = true;

const usePathnameMock = vi.fn((): string => pathnameValue);
const useMediaMock = vi.fn((query: string, defaultState: boolean): boolean => {
  return useMediaReturn;
});
const getBreakpointWidthMock = vi.fn((brk: string): string => `${brk}-query`);

const disabledRoutes: string[] = [];
export const setDisabledRoutes = (routes: string[]): void => {
  disabledRoutes.length = 0;
  routes.forEach((r) => disabledRoutes.push(r));
};

vi.mock('next/navigation', (): Record<string, unknown> => ({
  usePathname: usePathnameMock,
}));

vi.mock('react-use', (): Record<string, unknown> => ({
  useMedia: useMediaMock,
}));

vi.mock('@/app/lib/helpers', (): Record<string, unknown> => ({
  getBreakpointWidth: getBreakpointWidthMock,
}));

vi.mock('@/config/constants/navigation', (): Record<string, unknown> => ({
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
}));

vi.mock('@/config/constants/routes', (): Record<string, unknown> => {
  const ROUTE = {
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
  };
  return {
    ROUTE,
    DISABLED_ROUTES: disabledRoutes,
    // helper export for tests
    __setDisabledRoutes: setDisabledRoutes,
  };
});

vi.mock('react-icons/pi', (): Record<string, unknown> => {
  const makeIcon = (_name: string) =>
    function Icon(): JSX.Element {
      return <span data-testid="icon" />;
    };
  return {
    PiBugBeetle: makeIcon('PiBugBeetle'),
    PiBugBeetleFill: makeIcon('PiBugBeetleFill'),
    PiChatText: makeIcon('PiChatText'),
    PiChatTextFill: makeIcon('PiChatTextFill'),
    PiDownloadSimple: makeIcon('PiDownloadSimple'),
    PiDownloadSimpleFill: makeIcon('PiDownloadSimpleFill'),
    PiEscalatorUp: makeIcon('PiEscalatorUp'),
    PiEscalatorUpFill: makeIcon('PiEscalatorUpFill'),
    PiGearSix: makeIcon('PiGearSix'),
    PiGearSixFill: makeIcon('PiGearSixFill'),
    PiHouse: makeIcon('PiHouse'),
    PiHouseFill: makeIcon('PiHouseFill'),
    PiPolygon: makeIcon('PiPolygon'),
    PiPolygonFill: makeIcon('PiPolygonFill'),
    PiPresentationChart: makeIcon('PiPresentationChart'),
    PiPresentationChartFill: makeIcon('PiPresentationChartFill'),
    PiRepeat: makeIcon('PiRepeat'),
    PiRepeatFill: makeIcon('PiRepeatFill'),
    PiStack: makeIcon('PiStack'),
    PiStackFill: makeIcon('PiStackFill'),
  };
});

// Mock HoverableNavLink and Logo with relative paths matching the SUT
vi.mock('../hoverables', (): Record<string, unknown> => {
  type HoverableNavLinkProps = {
    idx: number;
    link: { title: string; url: string; icon?: unknown; hoverIcon?: unknown };
    isActiveLink: boolean;
    withScale?: boolean;
  };
  const HoverableNavLink = ({
    idx,
    link,
    isActiveLink,
  }: HoverableNavLinkProps): JSX.Element => (
    <li
      data-testid="hoverable-nav-link"
      data-idx={String(idx)}
      data-title={link.title}
      data-url={link.url}
      data-active={isActiveLink ? 'true' : 'false'}
    />
  );
  return { HoverableNavLink };
});

vi.mock('../logo', (): Record<string, unknown> => {
  const Logo = ({ size }: { size: string }): JSX.Element => (
    <div data-testid="logo" data-size={size} />
  );
  return { default: Logo };
});

// Import mocked constants for expectations
import { ROUTE } from '@/config/constants/routes';
import { NAV_TITLE } from '@/config/constants/navigation';

// Import the component under test (path relative to this test file)
import Navbar from './navbar';

describe('Navbar', (): void => {
  beforeEach((): void => {
    pathnameValue = '/';
    useMediaReturn = true;
    setDisabledRoutes([]);
    usePathnameMock.mockClear();
    useMediaMock.mockClear();
    getBreakpointWidthMock.mockClear();
  });

  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  test('renders all top nav links when none are disabled', (): void => {
    render(<Navbar linksGroup="top" />);
    const items = screen.getAllByTestId('hoverable-nav-link');
    expect(items.length).toBe(8);
    const titles = items.map((el) => el.getAttribute('data-title'));
    expect(titles).toEqual([
      NAV_TITLE.HOME,
      NAV_TITLE.MONTHLY_REPORT,
      NAV_TITLE.CHART,
      NAV_TITLE.LIMITS,
      NAV_TITLE.SUBSCRIPTIONS,
      NAV_TITLE.CATEGORIES,
      NAV_TITLE.EXPORT,
      NAV_TITLE.SETTINGS,
    ]);
    const list = screen.getByRole('list');
    expect(list).toBeDefined();
  });

  test('filters out disabled routes in top group', (): void => {
    setDisabledRoutes([ROUTE.CHART, ROUTE.EXPORT]);
    render(<Navbar linksGroup="top" />);
    const items = screen.getAllByTestId('hoverable-nav-link');
    expect(items.length).toBe(6);
    const urls = items.map((el) => el.getAttribute('data-url'));
    expect(urls.includes(ROUTE.CHART)).toBe(false);
    expect(urls.includes(ROUTE.EXPORT)).toBe(false);
  });

  test('marks the active link based on current pathname', (): void => {
    pathnameValue = ROUTE.SETTINGS;
    render(<Navbar linksGroup="top" />);
    const items = screen.getAllByTestId('hoverable-nav-link');
    const activeItems = items.filter(
      (el) => el.getAttribute('data-active') === 'true'
    );
    expect(activeItems.length).toBe(1);
    expect(activeItems[0]?.getAttribute('data-url')).toBe(ROUTE.SETTINGS);
    const inactiveItems = items.filter(
      (el) => el.getAttribute('data-active') === 'false'
    );
    expect(inactiveItems.length).toBe(7);
  });

  test('calls getBreakpointWidth with "md" and passes its result to useMedia', (): void => {
    render(<Navbar linksGroup="top" />);
    expect(getBreakpointWidthMock).toHaveBeenCalledTimes(1);
    expect(getBreakpointWidthMock).toHaveBeenCalledWith('md');
    expect(useMediaMock).toHaveBeenCalledTimes(1);
    expect(useMediaMock.mock.calls[0]?.[0]).toBe('md-query');
    expect(useMediaMock.mock.calls[0]?.[1]).toBe(true);
  });

  test('renders Logo with size "sm" when withLogo and md media is true', (): void => {
    useMediaReturn = true;
    render(<Navbar linksGroup="top" withLogo />);
    const logo = screen.getByTestId('logo');
    expect(logo.getAttribute('data-size')).toBe('sm');
  });

  test('renders Logo with size "xxs" when withLogo and md media is false', (): void => {
    useMediaReturn = false;
    render(<Navbar linksGroup="top" withLogo />);
    const logo = screen.getByTestId('logo');
    expect(logo.getAttribute('data-size')).toBe('xxs');
  });

  test('renders bottom group links when none are disabled', (): void => {
    render(<Navbar linksGroup="bottom" />);
    const items = screen.getAllByTestId('hoverable-nav-link');
    expect(items.length).toBe(2);
    const titles = items.map((el) => el.getAttribute('data-title'));
    expect(titles).toEqual([NAV_TITLE.FEEDBACK, NAV_TITLE.ISSUE]);
  });

  test('filters out disabled routes in bottom group', (): void => {
    setDisabledRoutes([ROUTE.ISSUE]);
    render(<Navbar linksGroup="bottom" />);
    const items = screen.getAllByTestId('hoverable-nav-link');
    expect(items.length).toBe(1);
    expect(items[0]?.getAttribute('data-title')).toBe(NAV_TITLE.FEEDBACK);
  });

  test('renders empty list when all top routes are disabled', (): void => {
    setDisabledRoutes([
      ROUTE.HOME,
      ROUTE.MONTHLY_REPORT,
      ROUTE.CHART,
      ROUTE.LIMITS,
      ROUTE.SUBSCRIPTIONS,
      ROUTE.CATEGORIES,
      ROUTE.EXPORT,
      ROUTE.SETTINGS,
    ]);
    render(<Navbar linksGroup="top" />);
    const items = screen.queryAllByTestId('hoverable-nav-link');
    expect(items.length).toBe(0);
    expect(screen.getByRole('list')).toBeDefined();
  });

  test('passes correct sequential idx to HoverableNavLink', (): void => {
    render(<Navbar linksGroup="top" />);
    const items = screen.getAllByTestId('hoverable-nav-link');
    const idxs = items.map((el) => Number(el.getAttribute('data-idx')));
    expect(idxs).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  test('no Logo rendered when withLogo is not provided', (): void => {
    render(<Navbar linksGroup="top" />);
    const logo = screen.queryByTestId('logo');
    expect(logo).toBeNull();
  });
});
