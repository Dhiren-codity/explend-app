import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mocks
vi.mock('react-icons/pi', () => {
  const Icon = (props: any) => <i data-testid="icon" {...props} />;
  return {
    PiBugBeetle: Icon,
    PiBugBeetleFill: Icon,
    PiChatText: Icon,
    PiChatTextFill: Icon,
    PiDownloadSimple: Icon,
    PiDownloadSimpleFill: Icon,
    PiEscalatorUp: Icon,
    PiEscalatorUpFill: Icon,
    PiGearSix: Icon,
    PiGearSixFill: Icon,
    PiHouse: Icon,
    PiHouseFill: Icon,
    PiPolygon: Icon,
    PiPolygonFill: Icon,
    PiPresentationChart: Icon,
    PiPresentationChartFill: Icon,
    PiRepeat: Icon,
    PiRepeatFill: Icon,
    PiStack: Icon,
    PiStackFill: Icon,
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

const disabledRoutesRef: string[] = [];
const ROUTE_OBJ = {
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

vi.mock('@/config/constants/routes', () => {
  return {
    DISABLED_ROUTES: disabledRoutesRef,
    ROUTE: ROUTE_OBJ,
  };
});

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: vi.fn().mockReturnValue('(min-width: 768px)'),
  };
});

vi.mock('../hoverables', () => {
  return {
    HoverableNavLink: (props: {
      idx: number;
      link: { title: string; url: string; icon?: any; hoverIcon?: any };
      isActiveLink: boolean;
      withScale?: boolean;
    }) => {
      const { idx, link, isActiveLink, withScale } = props;
      return (
        
        />
      );
    },
  };
});

vi.mock('../logo', () => {
  return {
    default: (props: { size?: string }) => (
      <div data-testid="logo" data-size={props.size || ''} />
    ),
  };
});

// Imports after mocks
import Navbar from './navbar';
import { usePathname } from 'next/navigation';
import { useMedia } from 'react-use';
import { DISABLED_ROUTES, ROUTE } from '@/config/constants/routes';
import { getBreakpointWidth } from '@/app/lib/helpers';

describe('Navbar', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    // Reset disabled routes
    DISABLED_ROUTES.splice(0, DISABLED_ROUTES.length);
    // Default mocks
    (usePathname as unknown as vi.Mock).mockReturnValue('/');
    (useMedia as unknown as vi.Mock).mockReturnValue(true);
    (getBreakpointWidth as unknown as vi.Mock).mockReturnValue('(min-width: 768px)');
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test(async () => {
    render(<Navbar linksGroup="top" />);

    // getBreakpointWidth called with md
    expect((getBreakpointWidth as unknown as vi.Mock).mock.calls[0]?.[0]).toBe('md');

    const list = screen.getByRole('list');
    const items = within(list).getAllByTestId('nav-item');
    expect(items.length).toBe(8);

    // First and last idx
    expect(items[0]).toHaveAttribute('data-idx', '0');
    expect(items[items.length - 1]).toHaveAttribute('data-idx', '7');

    // Ensure withScale passed to all
    for (const li of items) {
      expect(li).toHaveAttribute('data-scale', 'true');
    }

    // Titles and URLs present in order
    const expectedTopUrls = [
      ROUTE.HOME,
      ROUTE.MONTHLY_REPORT,
      ROUTE.CHART,
      ROUTE.LIMITS,
      ROUTE.SUBSCRIPTIONS,
      ROUTE.CATEGORIES,
      ROUTE.EXPORT,
      ROUTE.SETTINGS,
    ];
    const gotUrls = items.map((el) => el.getAttribute('data-url'));
    expect(gotUrls).toEqual(expectedTopUrls);
  });

  test(async () => {
    (usePathname as unknown as vi.Mock).mockReturnValue(ROUTE.LIMITS);
    render(<Navbar linksGroup="top" />);

    const list = screen.getByRole('list');
    const items = within(list).getAllByTestId('nav-item');

    for (const li of items) {
      const isActive = li.getAttribute('data-url') === ROUTE.LIMITS;
      expect(li).toHaveAttribute('data-active', isActive ? 'true' : 'false');
    }
  });

  test(async () => {
    DISABLED_ROUTES.push(ROUTE.EXPORT);
    render(<Navbar linksGroup="top" />);

    const list = screen.getByRole('list');
    const items = within(list).getAllByTestId('nav-item');
    const urls = items.map((el) => el.getAttribute('data-url'));

    expect(urls).not.toContain(ROUTE.EXPORT);
    expect(items.length).toBe(7);
  });

  test(async () => {
    DISABLED_ROUTES.push(ROUTE.ISSUE);
    render(<Navbar linksGroup="bottom" />);

    const list = screen.getByRole('list');
    const items = within(list).getAllByTestId('nav-item');
    expect(items.length).toBe(1);
    expect(items[0]).toHaveAttribute('data-url', ROUTE.FEEDBACK);
  });

  test(async () => {
    (useMedia as unknown as vi.Mock).mockReturnValue(true);
    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toHaveAttribute('data-size', 'sm');
  });

  test(async () => {
    (useMedia as unknown as vi.Mock).mockReturnValue(false);
    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toHaveAttribute('data-size', 'xxs');
  });

  test(async () => {
    (usePathname as unknown as vi.Mock).mockReturnValue(undefined);
    render(<Navbar linksGroup="top" />);

    const list = screen.getByRole('list');
    const items = within(list).getAllByTestId('nav-item');

    for (const li of items) {
      expect(li).toHaveAttribute('data-active', 'false');
    }
  });

  test('renders empty list when all routes are disabled', async () => {
    DISABLED_ROUTES.splice(0, DISABLED_ROUTES.length);
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

    const list = screen.getByRole('list');
    const items = within(list).queryAllByTestId('nav-item');
    expect(items.length).toBe(0);
  });


    const list = screen.getByRole('list');
    const items = within(list).getAllByTestId('nav-item');
    // Bottom links count is 2 by default (no disabled)
    expect(items.length).toBe(2);
    const urls = items.map((el) => el.getAttribute('data-url'));
    expect(urls).toEqual([ROUTE.FEEDBACK, ROUTE.ISSUE]);
  });
});
