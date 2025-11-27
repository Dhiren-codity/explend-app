import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// Mocks and state controls
let mockedPathname: string | null = '/';
let isMdValue = true;
let useMediaShouldThrow = false;
const disabledRoutes: string[] = [];

const getBreakpointWidthMock = vi.fn((_breakpoint: string): string => '(min-width: 768px)');

vi.mock('react-icons/pi', () => {
  const Stub = (): JSX.Element => React.createElement('span');
  return {
    PiBugBeetle: Stub,
    PiBugBeetleFill: Stub,
    PiChatText: Stub,
    PiChatTextFill: Stub,
    PiDownloadSimple: Stub,
    PiDownloadSimpleFill: Stub,
    PiEscalatorUp: Stub,
    PiEscalatorUpFill: Stub,
    PiGearSix: Stub,
    PiGearSixFill: Stub,
    PiHouse: Stub,
    PiHouseFill: Stub,
    PiPolygon: Stub,
    PiPolygonFill: Stub,
    PiPresentationChart: Stub,
    PiPresentationChartFill: Stub,
    PiRepeat: Stub,
    PiRepeatFill: Stub,
    PiStack: Stub,
    PiStackFill: Stub,
  };
});

vi.mock('react-use', () => {
  return {
    useMedia: (_query: string, _defaultState?: boolean): boolean => {
      if (useMediaShouldThrow) {
        throw new Error('media error');
      }
      return isMdValue;
    },
  };
});

vi.mock('next/navigation', () => {
  return {
    usePathname: (): string | null => mockedPathname,
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
  };
  return {
    ROUTE,
    DISABLED_ROUTES: disabledRoutes,
  };
});

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: getBreakpointWidthMock,
  };
});

vi.mock('../hoverables', () => {
  type Link = { title: string; url: string };
  type Props = {
    idx: number;
    link: Link;
    isActiveLink: boolean;
    withScale?: boolean;
  };
  const HoverableNavLink = ({ idx, link, isActiveLink, withScale }: Props): JSX.Element => {
    return (
      <li
        data-testid="nav-item"
        data-idx={String(idx)}
        data-title={link.title}
        data-url={link.url}
        data-active={isActiveLink ? 'true' : 'false'}
        data-scale={withScale ? 'true' : 'false'}
      />
    );
  };
  return { HoverableNavLink };
});

vi.mock('../logo', () => {
  const Logo = ({ size }: { size: 'sm' | 'xxs' }): JSX.Element => (
    <div data-testid="logo" data-size={size} />
  );
  return { default: Logo };
});

// Import after mocks
import Navbar from './navbar';

describe('Navbar', (): void => {
  beforeEach((): void => {
    mockedPathname = '/';
    isMdValue = true;
    useMediaShouldThrow = false;
    disabledRoutes.splice(0, disabledRoutes.length);
    getBreakpointWidthMock.mockClear();
  });

  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  test('renders top nav links and marks active link based on pathname', (): void => {
    mockedPathname = '/chart';
    render(<Navbar linksGroup="top" />);

    const list = screen.getByRole('list');
    expect(list).toBeTruthy();

    const items = screen.getAllByTestId('nav-item');
    expect(items.length).toBe(8);

    const activeItem = items.find((el) => el.getAttribute('data-url') === '/chart');
    expect(activeItem?.getAttribute('data-active')).toBe('true');

    const nonActiveItems = items.filter((el) => el.getAttribute('data-url') !== '/chart');
    for (const el of nonActiveItems) {
      expect(el.getAttribute('data-active')).toBe('false');
    }

    // withScale passed through
    for (const el of items) {
      expect(el.getAttribute('data-scale')).toBe('true');
    }

    // idx mapping
    expect(items[0].getAttribute('data-idx')).toBe('0');
    expect(items[items.length - 1].getAttribute('data-idx')).toBe(String(items.length - 1));

    // breakpoint helper called with 'md'
    expect(getBreakpointWidthMock).toHaveBeenCalledTimes(1);
    expect(getBreakpointWidthMock).toHaveBeenCalledWith('md');
  });

  test('filters out disabled routes in top links', (): void => {
    disabledRoutes.splice(0, disabledRoutes.length, '/export', '/categories');
    render(<Navbar linksGroup="top" />);

    const items = screen.getAllByTestId('nav-item');
    expect(items.length).toBe(6);

    const urls = items.map((el) => el.getAttribute('data-url'));
    expect(urls.includes('/export')).toBe(false);
    expect(urls.includes('/categories')).toBe(false);
  });

  test('renders bottom nav links and filters disabled', (): void => {
    disabledRoutes.splice(0, disabledRoutes.length, '/issue');
    render(<Navbar linksGroup="bottom" />);

    const items = screen.getAllByTestId('nav-item');
    expect(items.length).toBe(1);
    expect(items[0].getAttribute('data-url')).toBe('/feedback');
  });

  test('renders Logo when withLogo is true and size follows media query (md=true)', (): void => {
    isMdValue = true;
    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeTruthy();
    expect(logo.getAttribute('data-size')).toBe('sm');
  });

  test('renders Logo with size xxs when media query md=false', (): void => {
    isMdValue = false;
    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo.getAttribute('data-size')).toBe('xxs');
  });

  test('no active link when pathname is null', (): void => {
    mockedPathname = null;
    render(<Navbar linksGroup="top" />);

    const items = screen.getAllByTestId('nav-item');
    for (const el of items) {
      expect(el.getAttribute('data-active')).toBe('false');
    }
  });

  test('propagates error when useMedia throws', (): void => {
    useMediaShouldThrow = true;
    expect(() => render(<Navbar linksGroup="top" />)).toThrowError('media error');
  });
});
