import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Navbar from './navbar';
import { DISABLED_ROUTES, ROUTE } from '@/config/constants/routes';
import { useMedia } from 'react-use';
import { usePathname } from 'next/navigation';
import { getBreakpointWidth } from '@/app/lib/helpers';

vi.mock('react-icons/pi', (): Record<string, unknown> => {
  const makeIcon = (): unknown =>
    function Icon(): unknown {
      return null;
    };
  return {
    PiBugBeetle: makeIcon(),
    PiBugBeetleFill: makeIcon(),
    PiChatText: makeIcon(),
    PiChatTextFill: makeIcon(),
    PiDownloadSimple: makeIcon(),
    PiDownloadSimpleFill: makeIcon(),
    PiEscalatorUp: makeIcon(),
    PiEscalatorUpFill: makeIcon(),
    PiGearSix: makeIcon(),
    PiGearSixFill: makeIcon(),
    PiHouse: makeIcon(),
    PiHouseFill: makeIcon(),
    PiPolygon: makeIcon(),
    PiPolygonFill: makeIcon(),
    PiPresentationChart: makeIcon(),
    PiPresentationChartFill: makeIcon(),
    PiRepeat: makeIcon(),
    PiRepeatFill: makeIcon(),
    PiStack: makeIcon(),
    PiStackFill: makeIcon(),
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
  const DISABLED_ROUTES: string[] = [];
  return { ROUTE, DISABLED_ROUTES };
});

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: vi.fn(() => '(min-width: 768px)'),
  };
});

vi.mock('../hoverables', () => {
  return {
    HoverableNavLink: (props: {
      idx: number;
      link: { title: string; url: string };
      isActiveLink: boolean;
      withScale?: boolean;
    }): unknown => {
      const { idx, link, isActiveLink } = props;
      return (
        <li
          data-testid="nav-item"
          data-idx={`${idx}`}
          data-title={link.title}
          data-url={link.url}
          data-active={isActiveLink ? 'true' : 'false'}
        />
      );
    },
  };
});

vi.mock('../logo', () => {
  return {
    default: (props: { size: string }): unknown => (
      <div data-testid="logo" data-size={props.size} />
    ),
  };
});

describe('Navbar', (): void => {
  beforeEach((): void => {
    (useMedia as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue('/');
    (getBreakpointWidth as unknown as ReturnType<typeof vi.fn>).mockReset();
    (getBreakpointWidth as unknown as ReturnType<typeof vi.fn>).mockReturnValue('(min-width: 768px)');
    DISABLED_ROUTES.length = 0;
  });

  afterEach((): void => {
    vi.clearAllMocks();
    cleanup();
  });

  test('renders top links and logo with sm size when isMd = true', (): void => {
    (useMedia as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('sm');

    const items = screen.getAllByTestId('nav-item');
    // Top group has 8 links in source, zero disabled
    expect(items.length).toBe(8);
  });

  test('sets active state based on pathname equality', (): void => {
    (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue(ROUTE.LIMITS);
    render(<Navbar linksGroup="top" />);

    const items = screen.getAllByTestId('nav-item');
    const activeItems = items.filter((el) => el.getAttribute('data-active') === 'true');
    expect(activeItems.length).toBe(1);
    const active = activeItems[0];
    expect(active.getAttribute('data-url')).toBe(ROUTE.LIMITS);
  });

  test('uses getBreakpointWidth("md") and renders logo with xxs when isMd = false', (): void => {
    (getBreakpointWidth as unknown as ReturnType<typeof vi.fn>).mockReturnValue('(min-width: 900px)');
    (useMedia as unknown as ReturnType<typeof vi.fn>).mockImplementation((_query: unknown, _def: unknown) => false);

    render(<Navbar linksGroup="top" withLogo />);

    expect((getBreakpointWidth as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1);
    expect((getBreakpointWidth as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith('md');

    const logo = screen.getByTestId('logo');
    expect(logo.getAttribute('data-size')).toBe('xxs');
  });

  test('filters out disabled routes in top group', (): void => {
    DISABLED_ROUTES.push(ROUTE.EXPORT, ROUTE.CHART);
    render(<Navbar linksGroup="top" />);

    const items = screen.getAllByTestId('nav-item');
    // 8 total top links - 2 disabled = 6
    expect(items.length).toBe(6);
    const urls = items.map((el) => el.getAttribute('data-url'));
    expect(urls).not.toContain(ROUTE.EXPORT);
    expect(urls).not.toContain(ROUTE.CHART);
  });

  test('renders bottom group and filters disabled routes', (): void => {
    // Bottom group has 2 items: FEEDBACK and ISSUE
    DISABLED_ROUTES.push(ROUTE.ISSUE);
    render(<Navbar linksGroup="bottom" />);
    const items = screen.getAllByTestId('nav-item');
    expect(items.length).toBe(1);
    expect(items[0].getAttribute('data-url')).toBe(ROUTE.FEEDBACK);
  });

  test('handles case when all routes are disabled (renders empty list)', (): void => {
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

  test('handles null pathname (no active links)', (): void => {
    (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue(null);
    render(<Navbar linksGroup="top" />);

    const items = screen.getAllByTestId('nav-item');
    const activeItems = items.filter((el) => el.getAttribute('data-active') === 'true');
    expect(activeItems.length).toBe(0);
  });

  test('does not render logo when withLogo is false', (): void => {
    render(<Navbar linksGroup="top" withLogo={false} />);
    const logo = screen.queryByTestId('logo');
    expect(logo).toBeNull();
  });
});
