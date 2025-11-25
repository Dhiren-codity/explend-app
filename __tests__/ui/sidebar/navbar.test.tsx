import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-icons/pi', () => {
  const Comp = (): JSX.Element => null;
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
  };

vi.mock('react-use', () => {
  return {
    useMedia: vi.fn(),
  };

vi.mock('next/navigation', () => {
  return {
    usePathname: vi.fn(),
  };

vi.mock('@/config/constants/navigation', () => {
  return {
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
  };

vi.mock('@/config/constants/routes', () => {
  let disabledRoutes: string[] = [];
  const ROUTE = {
    HOME: '/home',
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
    get DISABLED_ROUTES() {
      return disabledRoutes;
    },
    ROUTE,
    __setDisabledRoutes: (routes: string[]): void => {
      disabledRoutes = routes;
    },
  };

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: vi.fn(() => '(min-width: 768px)'),
  };

vi.mock('../hoverables', () => {
  // Matches import inside app/ui/sidebar/navbar.tsx
  return {
    HoverableNavLink: ({
      idx,
      link,
      isActiveLink,
    }: {
      idx: number;
      link: { title: string; url: string };
      isActiveLink: boolean;
      withScale?: boolean;
    }): JSX.Element => {
      return (
        <li role="listitem" data-idx={String(idx)} data-active={isActiveLink ? 'true' : 'false'}>
          <span>{link.title}</span>
        </li>
      );
    },
  };

vi.mock('../logo', () => {
  // Matches import inside app/ui/sidebar/navbar.tsx
  return {
    default: ({ size }: { size: 'sm' | 'xxs' }): JSX.Element => {
      return <div data-testid="logo" data-size={size} />;
    },
  };

import Navbar from './app/ui/sidebar/navbar';
import { useMedia } from 'react-use';
import { usePathname } from 'next/navigation';
import { getBreakpointWidth } from '@/app/lib/helpers';
import { NAV_TITLE } from '@/config/constants/navigation';
import * as routes from '@/config/constants/routes';

type RoutesMock = {
  ROUTE: {
    HOME: string;
    MONTHLY_REPORT: string;
    CHART: string;
    LIMITS: string;
    SUBSCRIPTIONS: string;
    CATEGORIES: string;
    EXPORT: string;
    SETTINGS: string;
    FEEDBACK: string;
    ISSUE: string;
  };
  __setDisabledRoutes: (routes: string[]) => void;
};

type MockedFn<T extends (...args: unknown[]) => unknown> = T & {
  mock: { calls: unknown[][] };
  mockReturnValue?: (value: unknown) => void;
  mockImplementation?: (fn: T) => void;
  mockReset?: () => void;
};

const routesMock = routes as unknown as RoutesMock;
const mockedUseMedia = useMedia as unknown as MockedFn<(query: string, defaultState?: boolean) => boolean>;
const mockedUsePathname = usePathname as unknown as MockedFn<() => string>;
const mockedGetBreakpointWidth = getBreakpointWidth as unknown as MockedFn<(bp: string) => string>;


  afterEach((): void => {
    vi.clearAllMocks();
  });


    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('sm');

    expect(mockedGetBreakpointWidth.mock.calls.length).toBe(1);
    expect(mockedGetBreakpointWidth.mock.calls[0][0]).toBe('md');
    const queryArg = mockedGetBreakpointWidth();
    expect(mockedUseMedia.mock.calls[0][0]).toBe(queryArg);
    expect(mockedUseMedia.mock.calls[0][1]).toBe(true);

    const list = screen.getByRole('list');
    expect(list).toBeDefined();
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(7);

    const expectedTopOrder = [
      NAV_TITLE.HOME,
      NAV_TITLE.MONTHLY_REPORT,
      NAV_TITLE.CHART,
      NAV_TITLE.LIMITS,
      NAV_TITLE.SUBSCRIPTIONS,
      NAV_TITLE.CATEGORIES,
      NAV_TITLE.EXPORT,
      NAV_TITLE.SETTINGS,
    ];
    const expectedAfterFilter = expectedTopOrder.filter((t) => t !== NAV_TITLE.CATEGORIES);
    const renderedTitles = items.map((el) => el.textContent);
    expect(renderedTitles).toEqual(expectedAfterFilter);

    items.forEach((el, idx) => {
      expect(el.getAttribute('data-idx')).toBe(String(idx));
    });

    const activeItems = items.filter((el) => el.getAttribute('data-active') === 'true');
    expect(activeItems.length).toBe(1);
    expect(activeItems[0].textContent).toBe(NAV_TITLE.CHART);

    expect(container).toBeDefined();
  });

  test('renders logo with xxs size when below md breakpoint', (): void => {
    mockedUseMedia.mockReturnValue && mockedUseMedia.mockReturnValue(false);

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo.getAttribute('data-size')).toBe('xxs');
  });

  test('renders bottom links and filters out disabled routes', (): void => {
    routesMock.__setDisabledRoutes([routesMock.ROUTE.FEEDBACK]);
    mockedUsePathname.mockReturnValue && mockedUsePathname.mockReturnValue(routesMock.ROUTE.ISSUE);

    render(<Navbar linksGroup="bottom" />);

    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toBe(NAV_TITLE.ISSUE);
    expect(items[0].getAttribute('data-active')).toBe('true');
  });

  test('handles undefined pathname by not marking any link as active', (): void => {
    // Force undefined via cast for edge-case testing
    mockedUsePathname.mockReturnValue && mockedUsePathname.mockReturnValue(undefined as unknown as string);

    render(<Navbar linksGroup="top" />);

    const items = screen.getAllByRole('listitem');
    const activeItems = items.filter((el) => el.getAttribute('data-active') === 'true');
    expect(activeItems.length).toBe(0);
  });


    expect((): void => {
      render(<Navbar linksGroup="top" withLogo />);
    }).toThrow('boom');
  });
