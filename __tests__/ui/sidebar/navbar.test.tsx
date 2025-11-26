import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import Navbar from '@/app/ui/sidebar/navbar';

vi.mock('next/navigation', () => {
  const mockUsePathname = vi.fn((): string => {
    const pathname = (globalThis as Record<string, unknown>).__pathname as string | undefined;
    return pathname ?? '/';
  });
  return {
    usePathname: mockUsePathname,
  };

vi.mock('react-use', () => {
  const mockUseMedia = vi.fn((_query?: unknown, _defaultState?: unknown): boolean => {
    const val = (globalThis as Record<string, unknown>).__useMediaReturn as boolean | undefined;
    return val ?? true;
  });
  return {
    useMedia: mockUseMedia,
  };

vi.mock('react-icons/pi', () => {
  const StubIcon = (_props: unknown): JSX.Element => {
    return <span data-testid="icon" />;
  };
  return {
    PiBugBeetle: StubIcon,
    PiBugBeetleFill: StubIcon,
    PiChatText: StubIcon,
    PiChatTextFill: StubIcon,
    PiDownloadSimple: StubIcon,
    PiDownloadSimpleFill: StubIcon,
    PiEscalatorUp: StubIcon,
    PiEscalatorUpFill: StubIcon,
    PiGearSix: StubIcon,
    PiGearSixFill: StubIcon,
    PiHouse: StubIcon,
    PiHouseFill: StubIcon,
    PiPolygon: StubIcon,
    PiPolygonFill: StubIcon,
    PiPresentationChart: StubIcon,
    PiPresentationChartFill: StubIcon,
    PiRepeat: StubIcon,
    PiRepeatFill: StubIcon,
    PiStack: StubIcon,
    PiStackFill: StubIcon,
  };

vi.mock('@/config/constants/navigation', () => {
  return {
    NAV_ICON_SIZE: 20,
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

vi.mock('@/config/constants/routes', () => {
  const disabledRoutes = (globalThis as Record<string, unknown>).__disabledRoutes as string[] | undefined;
  const sharedDisabledRoutes: string[] = Array.isArray(disabledRoutes) ? disabledRoutes : [];
  (globalThis as Record<string, unknown>).__disabledRoutes = sharedDisabledRoutes;
  return {
    DISABLED_ROUTES: sharedDisabledRoutes,
    ROUTE: {
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
    },
  };

vi.mock('@/app/lib/helpers', () => {
  const calls: unknown[][] = [];
  (globalThis as Record<string, unknown>).__bpCalls = calls;
  const mockGetBreakpointWidth = vi.fn((bp: unknown): string => {
    calls.push([bp]);
    return `(min-width: ${String(bp)})`;
  });
  return {
    getBreakpointWidth: mockGetBreakpointWidth,
  };

vi.mock('../hoverables', () => {
  type Link = { title: string; url: string };
  type Props = { idx: number; link: Link; isActiveLink: boolean; withScale?: boolean };
  const HoverableNavLink = (props: Props): JSX.Element => {
    const shouldThrow = Boolean((globalThis as Record<string, unknown>).__hoverableThrow);
    if (shouldThrow) {
      throw new Error('HoverableNavLink mock error');
    }
    const { idx, link, isActiveLink, withScale } = props;
    return (
      <li
        data-testid={`navlink-${idx}`}
        data-url={link.url}
        data-title={link.title}
        data-active={isActiveLink ? 'true' : 'false'}
        data-scale={withScale ? 'true' : 'false'}
      >
        {link.title}
      </li>
    );
  };
  return {
    HoverableNavLink,
  };

vi.mock('../logo', () => {
  type LogoProps = { size?: 'sm' | 'xxs' | string };
  const Logo = ({ size }: LogoProps): JSX.Element => {
    return <div data-testid="logo" data-size={size ?? ''} />;
  };
  return { default: Logo };
});


  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  test('renders top nav with logo and marks active link based on pathname', (): void => {
    (globalThis as Record<string, unknown>).__useMediaReturn = true;
    (globalThis as Record<string, unknown>).__pathname = '/chart';

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo.getAttribute('data-size')).toBe('sm');

    const navItems = screen.getAllByTestId(/^navlink-/);
    expect(navItems.length).toBe(8);

    const active = navItems.find((el) => el.getAttribute('data-url') === '/chart');
    expect(Boolean(active)).toBe(true);
    expect(active?.getAttribute('data-active')).toBe('true');

    const allScaled = navItems.every((el) => el.getAttribute('data-scale') === 'true');
    expect(allScaled).toBe(true);
  });

  test('filters disabled routes in the top nav', (): void => {
    const disabled = (globalThis as Record<string, unknown>).__disabledRoutes as string[];
    disabled.push('/export');

    render(<Navbar linksGroup="top" />);

    const navItems = screen.getAllByTestId(/^navlink-/);
    expect(navItems.length).toBe(7);

    const hasExport = navItems.some((el) => el.getAttribute('data-url') === '/export');
    expect(hasExport).toBe(false);
  });

  test('renders only bottom nav links and computes active correctly', (): void => {
    (globalThis as Record<string, unknown>).__pathname = '/feedback';

    render(<Navbar linksGroup="bottom" />);

    const navItems = screen.getAllByTestId(/^navlink-/);
    expect(navItems.length).toBe(2);

    const active = navItems.find((el) => el.getAttribute('data-url') === '/feedback');
    expect(Boolean(active)).toBe(true);
    expect(active?.getAttribute('data-active')).toBe('true');
  });

  test('does not render logo when withLogo is false', (): void => {
    render(<Navbar linksGroup="top" withLogo={false} />);
    const logoQuery = screen.queryByTestId('logo');
    expect(logoQuery).toBeNull();
  });

  test('renders compact logo on small screens', (): void => {
    (globalThis as Record<string, unknown>).__useMediaReturn = false;

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo.getAttribute('data-size')).toBe('xxs');
  });

  test('calls getBreakpointWidth with md breakpoint', (): void => {
    render(<Navbar linksGroup="top" />);
    const calls = (globalThis as Record<string, unknown>).__bpCalls as unknown[][];
    const wasCalledWithMd = calls.some((entry) => entry[0] === 'md');
    expect(wasCalledWithMd).toBe(true);
  });

  test('throws error when HoverableNavLink fails to render', (): void => {
    (globalThis as Record<string, unknown>).__hoverableThrow = true;

    expect(() => render(<Navbar linksGroup="top" />)).toThrow('HoverableNavLink mock error');
  });

  test('handles async operations by waiting for nav items', async (): Promise<void> => {
    render(<Navbar linksGroup="top" />);
    await waitFor(() => {
      const navItems = screen.getAllByTestId(/^navlink-/);
      expect(navItems.length).toBe(8);
    });