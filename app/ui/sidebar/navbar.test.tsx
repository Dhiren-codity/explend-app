import React from 'react';
import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, within, waitFor } from '@testing-library/react';

// Mocks
vi.mock('react-use', () => {
  return {
    useMedia: vi.fn(() => true),
  };
});

vi.mock('next/navigation', () => {
  return {
    usePathname: vi.fn(() => '/'),
  };
});

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: vi.fn(() => '(min-width: 768px)'),
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
  const DISABLED_ROUTES: string[] = [];
  return {
    ROUTE,
    DISABLED_ROUTES,
  };
});

vi.mock('../hoverables', () => {
  const HoverableNavLink = ({ idx, link, isActiveLink, withScale }: any) => {
    return (
      
      >
        {link?.title}
      </li>
    );
  };
  return { HoverableNavLink };
});

vi.mock('../logo', () => {
  const Logo = ({ size }: any) => {
    return (
      <div data-testid="logo" data-size={size}>
      </div>
    );
  };
  return { default: Logo };
});

vi.mock('react-icons/pi', () => {
  // Provide simple intrinsic elements so JSX like <PiHouse /> renders as <i />
  const i = 'i';
  return {
    PiBugBeetle: i,
    PiBugBeetleFill: i,
    PiChatText: i,
    PiChatTextFill: i,
    PiDownloadSimple: i,
    PiDownloadSimpleFill: i,
    PiEscalatorUp: i,
    PiEscalatorUpFill: i,
    PiGearSix: i,
    PiGearSixFill: i,
    PiHouse: i,
    PiHouseFill: i,
    PiPolygon: i,
    PiPolygonFill: i,
    PiPresentationChart: i,
    PiPresentationChartFill: i,
    PiRepeat: i,
    PiRepeatFill: i,
    PiStack: i,
    PiStackFill: i,
  };
});

// Import after mocks
import Navbar from '../navbar';
import { useMedia } from 'react-use';
import { usePathname } from 'next/navigation';
import { ROUTE as MOCK_ROUTE, DISABLED_ROUTES as MOCK_DISABLED_ROUTES } from '@/config/constants/routes';
import { NAV_TITLE as MOCK_NAV_TITLE } from '@/config/constants/navigation';

describe('Navbar', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    // reset disabled routes
    (MOCK_DISABLED_ROUTES as string[]).splice(0, (MOCK_DISABLED_ROUTES as string[]).length);
    (usePathname as unknown as vi.Mock).mockReturnValue('/');
    (useMedia as unknown as vi.Mock).mockReturnValue(true);
  });

  test('renders top links, filters disabled, and marks active link', async () => {
    (MOCK_DISABLED_ROUTES as string[]).push(MOCK_ROUTE.EXPORT);
    (usePathname as unknown as vi.Mock).mockReturnValue(MOCK_ROUTE.SETTINGS);

    render(<Navbar linksGroup="top" />);

    // no logo by default
    expect(screen.queryByTestId('logo')).toBeNull();

    const list = screen.getByRole('list');
    await waitFor(() => {
      const items = within(list).getAllByRole('listitem');
      // 8 top links minus 1 disabled
      expect(items).toHaveLength(7);
    });

    const items = within(list).getAllByRole('listitem');
    const titles = items.map((li) => li.getAttribute('data-title'));
    expect(titles).toContain(MOCK_NAV_TITLE.SETTINGS);
    expect(titles).not.toContain(MOCK_NAV_TITLE.EXPORT);

    const activeItem = items.find((li) => li.getAttribute('data-active') === 'true');
    expect(activeItem?.getAttribute('data-title')).toBe(MOCK_NAV_TITLE.SETTINGS);
  });

  test('renders bottom links and excludes disabled route', () => {
    (MOCK_DISABLED_ROUTES as string[]).push(MOCK_ROUTE.ISSUE);
    (usePathname as unknown as vi.Mock).mockReturnValue(MOCK_ROUTE.FEEDBACK);

    render(<Navbar linksGroup="bottom" />);

    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');

    // 2 bottom links minus 1 disabled
    expect(items).toHaveLength(1);
    expect(items[0].getAttribute('data-title')).toBe(MOCK_NAV_TITLE.FEEDBACK);
    expect(items[0].getAttribute('data-active')).toBe('true');
  });

  test('renders Logo when withLogo=true and uses sm size on md screens', () => {
    (useMedia as unknown as vi.Mock).mockReturnValue(true);

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeTruthy();
    expect(logo.getAttribute('data-size')).toBe('sm');
  });

  test('uses xxs Logo size when md is false', () => {
    (useMedia as unknown as vi.Mock).mockReturnValue(false);

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo.getAttribute('data-size')).toBe('xxs');
  });

  test('renders empty list when all top routes are disabled', () => {
    const allTopRoutes = [
      MOCK_ROUTE.HOME,
      MOCK_ROUTE.MONTHLY_REPORT,
      MOCK_ROUTE.CHART,
      MOCK_ROUTE.LIMITS,
      MOCK_ROUTE.SUBSCRIPTIONS,
      MOCK_ROUTE.CATEGORIES,
      MOCK_ROUTE.EXPORT,
      MOCK_ROUTE.SETTINGS,
    ];
    (MOCK_DISABLED_ROUTES as string[]).push(...allTopRoutes);

    render(<Navbar linksGroup="top" />);

    const list = screen.getByRole('list');
    const items = within(list).queryAllByRole('listitem');
    expect(items).toHaveLength(0);
  });
});
