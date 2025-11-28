import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navbar from './navbar';
import { useMedia } from 'react-use';
import { usePathname } from 'next/navigation';
import { ROUTE, __setDisabledRoutes } from '@/config/constants/routes';
import { NAV_TITLE } from '@/config/constants/navigation';

vi.mock('react-icons/pi', () => {
  const Stub = (_props: Record<string, unknown>): JSX.Element => null;
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
    NAV_ICON_SIZE: 16,
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
  };
});

vi.mock('@/config/constants/routes', () => {
  const disabled: string[] = [];
  const ROUTE = {
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
  };
  const __setDisabledRoutes = (routes: string[]): void => {
    disabled.length = 0;
    disabled.push(...routes);
  };
  return {
    DISABLED_ROUTES: disabled,
    ROUTE,
    __setDisabledRoutes,
  };
});

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: (bp: string): string => `(min-width: ${bp})`,
  };
});

vi.mock('../hoverables', () => {
  return {
    HoverableNavLink: (props: {
      idx: number;
      link: { title: string; url: string };
      isActiveLink: boolean;
      withScale?: boolean;
    }): JSX.Element => {
      return (
        
        />
      );
    },
  };
});

vi.mock('../logo', () => {
  const Logo = (props: { size: string }): JSX.Element => (
    <div data-testid="logo" data-size={props.size} />
  );
  return { default: Logo };
});

describe('Navbar', (): void => {
  beforeEach((): void => {
    (useMedia as unknown as vi.Mock).mockReturnValue(true);
    (usePathname as unknown as vi.Mock).mockReturnValue(ROUTE.HOME);
    __setDisabledRoutes([]);
    vi.clearAllMocks();
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  test('renders top nav links with logo and highlights active link when md is true', (): void => {
    (useMedia as unknown as vi.Mock).mockReturnValue(true);
    (usePathname as unknown as vi.Mock).mockReturnValue(ROUTE.CHART);

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('sm');

    const links = screen.getAllByTestId('nav-link');
    expect(links.length).toBe(8);

    const firstIndex = links[0].getAttribute('data-index');
    const lastIndex = links[links.length - 1].getAttribute('data-index');
    expect(firstIndex).toBe('0');
    expect(lastIndex).toBe('7');

    const active = links.find((el) => el.getAttribute('data-active') === 'true');
    expect(active).toBeDefined();
    expect(active?.getAttribute('data-url')).toBe(ROUTE.CHART);
    expect(active?.getAttribute('data-title')).toBe(NAV_TITLE.CHART);
  });

  test('renders bottom nav links without logo and filters disabled routes', (): void => {
    __setDisabledRoutes([ROUTE.ISSUE]);
    (usePathname as unknown as vi.Mock).mockReturnValue(ROUTE.FEEDBACK);

    render(<Navbar linksGroup="bottom" />);

    const logo = screen.queryByTestId('logo');
    expect(logo).toBeNull();

    const links = screen.getAllByTestId('nav-link');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('data-title')).toBe(NAV_TITLE.FEEDBACK);
    expect(links[0].getAttribute('data-url')).toBe(ROUTE.FEEDBACK);
    expect(links[0].getAttribute('data-active')).toBe('true');
  });

  test('sets logo size to xxs on small screens (md false)', (): void => {
    (useMedia as unknown as vi.Mock).mockReturnValue(false);

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('xxs');
  });

  test('renders no links when all routes are disabled for top group', (): void => {
    const allRoutes = Object.values(ROUTE);
    __setDisabledRoutes(allRoutes);

    render(<Navbar linksGroup="top" />);

    const links = screen.queryAllByTestId('nav-link');
    expect(links.length).toBe(0);
  });

  test('handles undefined pathname without active links', (): void => {
    (usePathname as unknown as vi.Mock).mockReturnValue(undefined as unknown as string);

    render(<Navbar linksGroup="top" />);

    const links = screen.getAllByTestId('nav-link');
    const active = links.find((el) => el.getAttribute('data-active') === 'true');
    expect(active).toBeUndefined();
  });

  test('orders top links correctly (first is Home)', (): void => {
    render(<Navbar linksGroup="top" />);

    const links = screen.getAllByTestId('nav-link');
    expect(links[0].getAttribute('data-title')).toBe(NAV_TITLE.HOME);
    expect(links[0].getAttribute('data-url')).toBe(ROUTE.HOME);
  });
});
