import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navbar from '@/app/ui/sidebar/navbar';
import { DISABLED_ROUTES, ROUTE } from '@/config/constants/routes';

const usePathnameMock = vi.fn<[], string | null>();
const useMediaMock = vi.fn<[string, boolean?], boolean>();

vi.mock('next/navigation', () => {
  return {
    usePathname: usePathnameMock,
  };

vi.mock('react-use', () => {
  return {
    useMedia: useMediaMock,
  };

vi.mock('@/config/constants/navigation', () => {
  const NAV_ICON_SIZE = 20;
  const NAV_TITLE = {
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
  };
  return {
    NAV_ICON_SIZE,
    NAV_TITLE,
  };

vi.mock('@/config/constants/routes', () => {
  const DISABLED_ROUTES: string[] = [];
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
    DISABLED_ROUTES,
    ROUTE,
  };

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: (bp: string): string => `(min-width: ${bp})`,
  };

vi.mock('../hoverables', () => {
  const HoverableNavLink = ({
    idx,
    link,
    isActiveLink,
    withScale,
  }: {
    idx: number;
    link: { title: string; url: string };
    isActiveLink: boolean;
    withScale?: boolean;
  }): JSX.Element => {
    return (
      
      />
    );
  };
  return { HoverableNavLink };
});

vi.mock('../logo', () => {
  const Logo = ({ size }: { size: string }): JSX.Element => {
    return <div data-testid="logo" data-size={size} />;
  };
  return { default: Logo };
});

vi.mock('react-icons/pi', () => {
  const Stub = (): JSX.Element => <span />;
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


  afterEach((): void => {
    vi.clearAllMocks();
  });

  test('renders logo with sm size when isMd is true', (): void => {
    useMediaMock.mockReturnValue(true);

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('sm');
  });

  test('renders logo with xxs size when isMd is false', (): void => {
    useMediaMock.mockReturnValue(false);

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('xxs');
  });

  test('renders top nav links and marks active link based on pathname', (): void => {
    // Disable one top route to verify filtering
    DISABLED_ROUTES.push(ROUTE.EXPORT);
    usePathnameMock.mockReturnValue(ROUTE.CHART);

    render(<Navbar linksGroup="top" withLogo />);

    const items = screen.getAllByTestId('nav-item');
    // Top links total: 8; one disabled: 7 rendered
    expect(items.length).toBe(7);

    const actives = items.filter((el) => el.getAttribute('data-active') === 'true');
    expect(actives.length).toBe(1);
    expect(actives[0]?.getAttribute('data-title')).toBe('Chart');

    // withScale is always passed
    items.forEach((el) => {
      expect(el.getAttribute('data-with-scale')).toBe('true');
    });

    // Indexing starts at 0 and increments
    expect(items[0]?.getAttribute('data-idx')).toBe('0');
    expect(items[items.length - 1]?.getAttribute('data-idx')).toBe(String(items.length - 1));
  });

  test('renders bottom nav links and filters disabled ones', (): void => {
    // Disable ISSUE; only FEEDBACK should render
    DISABLED_ROUTES.push(ROUTE.ISSUE);
    usePathnameMock.mockReturnValue(ROUTE.ISSUE);

    render(<Navbar linksGroup="bottom" />);

    const items = screen.getAllByTestId('nav-item');
    expect(items.length).toBe(1);
    expect(items[0]?.getAttribute('data-title')).toBe('Feedback');

    // No active item because the active route is disabled and not present
    const actives = items.filter((el) => el.getAttribute('data-active') === 'true');
    expect(actives.length).toBe(0);
  });

  test('handles null pathname by not marking any link as active', (): void => {
    usePathnameMock.mockReturnValue(null);
    DISABLED_ROUTES.length = 0;

    render(<Navbar linksGroup="top" />);

    const items = screen.getAllByTestId('nav-item');
    const actives = items.filter((el) => el.getAttribute('data-active') === 'true');
    expect(items.length).toBeGreaterThan(0);
    expect(actives.length).toBe(0);
  });

  test('renders no items when all top routes are disabled', (): void => {
    DISABLED_ROUTES.length = 0;
    DISABLED_ROUTES.push(
      ROUTE.HOME,
      ROUTE.MONTHLY_REPORT,
      ROUTE.CHART,
      ROUTE.LIMITS,
      ROUTE.SUBSCRIPTIONS,
      ROUTE.CATEGORIES,
      ROUTE.EXPORT,
      ROUTE.SETTINGS
    );

    render(<Navbar linksGroup="top" />);

    const items = screen.queryAllByTestId('nav-item');
    expect(items.length).toBe(0);
  });


    const logo = screen.queryByTestId('logo');
    expect(logo).toBeNull();
  });
