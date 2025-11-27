import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Navbar from './navbar';
import { useMedia } from 'react-use';
import { usePathname } from 'next/navigation';
import { getBreakpointWidth } from '@/app/lib/helpers';
import { ROUTE, setDisabledRoutes } from '@/config/constants/routes';
import { NAV_TITLE } from '@/config/constants/navigation';

vi.mock('react-use', () => {
  return {
    useMedia: vi.fn(),
  };
});

vi.mock('next/navigation', () => {
  return {
    usePathname: vi.fn(),
  };
});

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
  };
});

vi.mock('@/config/constants/routes', () => {
  const disabled: string[] = [];
  return {
    DISABLED_ROUTES: disabled,
    ROUTE: {
      HOME: '/home',
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
    setDisabledRoutes: (xs: string[]): void => {
      disabled.splice(0, disabled.length, ...xs);
    },
  };
});

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: vi.fn(() => '(min-width: 768px)'),
  };
});

vi.mock('../hoverables', () => {
  return {
    HoverableNavLink: vi.fn(
      (props: {
        idx: number;
        link: { title: string; url: string };
        isActiveLink: boolean;
        withScale?: boolean;
      }) => (
        <li
          role="listitem"
          data-testid={`nav-${props.link.title}`}
          data-idx={String(props.idx)}
          data-url={props.link.url}
          data-active={props.isActiveLink ? 'true' : 'false'}
          data-with-scale={props.withScale ? 'true' : 'false'}
        >
          {props.link.title}
        </li>
      )
    ),
  };
});

vi.mock('../logo', () => {
  return {
    default: vi.fn((props: { size: 'sm' | 'xxs' }) => (
      <div data-testid="logo" data-size={props.size} />
    )),
  };
});

vi.mock('react-icons/pi', () => {
  const makeIcon = (name: string) =>
    function Icon(_props: { size?: number }): JSX.Element {
      return <span data-icon={name} />;
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

describe('Navbar', (): void => {
  const mockedUseMedia = useMedia as unknown as ReturnType<typeof vi.fn>;
  const mockedUsePathname = usePathname as unknown as ReturnType<typeof vi.fn>;
  const mockedGetBreakpointWidth = getBreakpointWidth as unknown as ReturnType<typeof vi.fn>;

  beforeEach((): void => {
    vi.clearAllMocks();
    setDisabledRoutes([]);
    mockedUseMedia.mockReturnValue(true);
    mockedUsePathname.mockReturnValue(ROUTE.HOME);
    mockedGetBreakpointWidth.mockReturnValue('(min-width: 768px)');
  });

  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  test('renders logo with size "sm" when withLogo is true and isMd matches', (): void => {
    render(<Navbar linksGroup="top" withLogo />);
    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('sm');
    expect(mockedGetBreakpointWidth).toHaveBeenCalledWith('md');
  });

  test('renders logo with size "xxs" when media query is false', (): void => {
    mockedUseMedia.mockReturnValue(false);
    render(<Navbar linksGroup="top" withLogo />);
    const logo = screen.getByTestId('logo');
    expect(logo.getAttribute('data-size')).toBe('xxs');
  });

  test('renders top links, filters disabled routes, and marks active link', (): void => {
    setDisabledRoutes([ROUTE.EXPORT, ROUTE.LIMITS]);
    mockedUsePathname.mockReturnValue(ROUTE.CHART);
    render(<Navbar linksGroup="top" />);
    const list = screen.getByRole('list');
    expect(list).toBeDefined();
    const items = screen.getAllByRole('listitem');
    // Total top links = 8, minus 2 disabled = 6
    expect(items.length).toBe(6);

    const chartItem = screen.getByTestId(`nav-${NAV_TITLE.CHART}`);
    expect(chartItem.getAttribute('data-active')).toBe('true');

    const homeItem = screen.getByTestId(`nav-${NAV_TITLE.HOME}`);
    expect(homeItem.getAttribute('data-idx')).toBe('0');

    for (const el of items) {
      expect(el.getAttribute('data-with-scale')).toBe('true');
    }
  });

  test('renders bottom links and respects disabled routes', (): void => {
    setDisabledRoutes([ROUTE.ISSUE]);
    mockedUsePathname.mockReturnValue(ROUTE.FEEDBACK);
    render(<Navbar linksGroup="bottom" />);
    const list = screen.getByRole('list');
    expect(list).toBeDefined();
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(1);
    const feedbackItem = screen.getByTestId(`nav-${NAV_TITLE.FEEDBACK}`);
    expect(feedbackItem.getAttribute('data-active')).toBe('true');
    const issueItem = screen.queryByTestId(`nav-${NAV_TITLE.ISSUE}`);
    expect(issueItem).toBeNull();
  });

  test('no active link when pathname is null (edge case)', (): void => {
    mockedUsePathname.mockReturnValue(null);
    render(<Navbar linksGroup="top" />);
    const items = screen.getAllByRole('listitem');
    for (const el of items) {
      expect(el.getAttribute('data-active')).toBe('false');
    }
  });

  test('renders an empty list when all bottom routes are disabled', (): void => {
    setDisabledRoutes([ROUTE.FEEDBACK, ROUTE.ISSUE]);
    render(<Navbar linksGroup="bottom" />);
    const list = screen.getByRole('list');
    expect(list).toBeDefined();
    const items = screen.queryAllByRole('listitem');
    expect(items.length).toBe(0);
  });

    expect((): void => {
      render(<Navbar linksGroup="top" />);
    }).toThrow('boom');
  });
});
