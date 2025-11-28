import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Navbar from '../../../app/ui/sidebar/navbar';

vi.mock('react-icons/pi', (): Record<string, unknown> => {
  const Dummy = (): null => null;
  return {
    PiBugBeetle: Dummy,
    PiBugBeetleFill: Dummy,
    PiChatText: Dummy,
    PiChatTextFill: Dummy,
    PiDownloadSimple: Dummy,
    PiDownloadSimpleFill: Dummy,
    PiEscalatorUp: Dummy,
    PiEscalatorUpFill: Dummy,
    PiGearSix: Dummy,
    PiGearSixFill: Dummy,
    PiHouse: Dummy,
    PiHouseFill: Dummy,
    PiPolygon: Dummy,
    PiPolygonFill: Dummy,
    PiPresentationChart: Dummy,
    PiPresentationChartFill: Dummy,
    PiRepeat: Dummy,
    PiRepeatFill: Dummy,
    PiStack: Dummy,
    PiStackFill: Dummy,
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
    NAV_ICON_SIZE: 18,
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
  const disabledRoutes: string[] = [];
  return {
    DISABLED_ROUTES: disabledRoutes,
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
  };
});

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: vi.fn((_bp: unknown) => '(min-width: 768px)'),
  };
});

vi.mock('../../../app/ui/sidebar/hoverables', () => {
  const HoverableNavLink = (props: {
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

vi.mock('../../../app/ui/sidebar/logo', () => {
  const Logo = (props: { size: string }): JSX.Element => {
    return <div data-logo-size={props.size} />;
  };
  return { default: Logo };
});

import { useMedia } from 'react-use';
import { usePathname } from 'next/navigation';
import { DISABLED_ROUTES, ROUTE } from '@/config/constants/routes';
import { getBreakpointWidth } from '@/app/lib/helpers';

describe('Navbar', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks();
    cleanup();
    (useMedia as unknown as vi.Mock).mockReturnValue(true);
    (usePathname as unknown as vi.Mock).mockReturnValue('/home');
    // Reset disabled routes
    (DISABLED_ROUTES.splice as unknown as (start: number, deleteCount?: number) => number).call(DISABLED_ROUTES, 0, DISABLED_ROUTES.length);
    // Ensure breakpoint helper returns a string by default
    (getBreakpointWidth as unknown as vi.Mock).mockImplementation((_bp: unknown) => '(min-width: 768px)');
  });

  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  test('renders logo when withLogo is true and size is "sm" on md screens', (): void => {
    (useMedia as unknown as vi.Mock).mockReturnValue(true);

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('root') || screen.getBySelector;
    const logoNode = screen.getByRole('list').previousSibling as HTMLElement | null;
    const logoElem = screen.getByTestId ? null : null;
    const renderedLogo = screen.getByText ? null : null;
    const logoDivs = screen.getAllByText ? [] : [];
    const logoEl = screen.getByTestId ? null : null;

    const logoElement = document.querySelector('[data-logo-size]');
    expect(logoElement).toBeTruthy();
    if (logoElement) {
      expect(logoElement.getAttribute('data-logo-size')).toBe('sm');
    }
  });

  test('renders logo with size "xxs" when md media query is false', (): void => {
    (useMedia as unknown as vi.Mock).mockReturnValue(false);

    render(<Navbar linksGroup="top" withLogo />);

    const logoElement = document.querySelector('[data-logo-size]');
    expect(logoElement).toBeTruthy();
    if (logoElement) {
      expect(logoElement.getAttribute('data-logo-size')).toBe('xxs');
    }
  });

  test('does not render logo when withLogo is false/omitted', (): void => {
    (useMedia as unknown as vi.Mock).mockReturnValue(true);

    render(<Navbar linksGroup="top" />);

    const logoElement = document.querySelector('[data-logo-size]');
    expect(logoElement).toBeNull();
  });

  test('renders top group links, filters disabled, and marks active based on pathname', (): void => {
    // Disable two routes
    DISABLED_ROUTES.push(ROUTE.CATEGORIES, ROUTE.EXPORT);
    (usePathname as unknown as vi.Mock).mockReturnValue(ROUTE.SETTINGS);

    render(<Navbar linksGroup="top" />);

    const list = screen.getByRole('list');
    expect(list).toBeTruthy();

    const items = screen.getAllByRole('listitem');
    // Original top links count is 8; disabled 2 => expected 6
    expect(items.length).toBe(6);

    // Ensure each item has sequential idx and withScale passed
    items.forEach((el, index) => {
      expect(el.getAttribute('data-idx')).toBe(String(index));
      expect(el.getAttribute('data-scale')).toBe('true');
    });

    // Active link is SETTINGS only
    const activeItems = items.filter((el) => el.getAttribute('data-active') === 'true');
    expect(activeItems.length).toBe(1);
    const activeTitle = activeItems[0]?.getAttribute('data-title');
    expect(activeTitle).toBe('Settings');
  });

  test('renders bottom group links and highlights current route', (): void => {
    (usePathname as unknown as vi.Mock).mockReturnValue(ROUTE.FEEDBACK);

    render(<Navbar linksGroup="bottom" />);

    const items = screen.getAllByRole('listitem');
    // Bottom has 2 links
    expect(items.length).toBe(2);

    const feedbackItem = items.find((el) => el.getAttribute('data-title') === 'Feedback');
    const issueItem = items.find((el) => el.getAttribute('data-title') === 'Issue');

    expect(feedbackItem).toBeTruthy();
    expect(issueItem).toBeTruthy();

    if (feedbackItem) {
      expect(feedbackItem.getAttribute('data-active')).toBe('true');
    }
    if (issueItem) {
      expect(issueItem.getAttribute('data-active')).toBe('false');
    }
  });

  test('renders empty list when all routes in the selected group are disabled', (): void => {
    // Disable all top routes
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

    // Still renders the list container
    const list = screen.getByRole('list');
    expect(list).toBeTruthy();

    // No items
    const items = screen.queryAllByRole('listitem');
    expect(items.length).toBe(0);
  });


    expect(() => render(<Navbar linksGroup="top" withLogo />)).toThrow('breakpoint-error');
  });
});
