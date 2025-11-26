import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import Navbar from '@/app/ui/sidebar/navbar';

vi.mock('react-icons/pi', (): Record<string, unknown> => {
  const Comp = (props: Record<string, unknown>): React.ReactElement => React.createElement('span', { 'data-testid': 'icon', ...props });
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

vi.mock('react-use', (): Record<string, unknown> => {
  return {
    useMedia: (query: string, defaultState?: boolean): boolean => {
      const g = globalThis as unknown as Record<string, unknown>;
      const calls = (g.__USE_MEDIA_CALLS__ as Array<[string, boolean | undefined]>) ?? [];
      calls.push([query, defaultState]);
      g.__USE_MEDIA_CALLS__ = calls;
      const result = (g.__USE_MEDIA_RESULT__ as boolean | undefined);
      return typeof result === 'boolean' ? result : true;
    },
  };

vi.mock('next/navigation', (): Record<string, unknown> => {
  return {
    usePathname: (): string => {
      const g = globalThis as unknown as Record<string, unknown>;
      const value = g.__PATHNAME__ as unknown;
      return (value as string) ?? '/';
    },
  };

vi.mock('@/config/constants/navigation', (): Record<string, unknown> => {
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

vi.mock('@/config/constants/routes', (): Record<string, unknown> => {
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
  const DISABLED_ROUTES = [
    ROUTE.CHART,
    ROUTE.EXPORT,
    ROUTE.FEEDBACK,
    ROUTE.ISSUE,
  ];
  return { ROUTE, DISABLED_ROUTES };
});

vi.mock('@/app/lib/helpers', (): Record<string, unknown> => {
  return {
    getBreakpointWidth: (bp: string): string => {
      const g = globalThis as unknown as Record<string, unknown>;
      const calls = (g.__BREAKPOINT_CALLS__ as Array<[string]>) ?? [];
      calls.push([bp]);
      g.__BREAKPOINT_CALLS__ = calls;
      const ret = (g.__BREAKPOINT_MD__ as string | undefined) ?? '(min-width: 768px)';
      return ret;
    },
  };

vi.mock('@/app/ui/hoverables', (): Record<string, unknown> => {
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
  }): React.ReactElement => {
    return React.createElement('li', {
      'data-testid': 'nav-item',
      'data-idx': String(idx),
      'data-title': link.title,
      'data-url': link.url,
      'data-active': isActiveLink ? 'true' : 'false',
      'data-scale': withScale ? 'true' : 'false',
    });
  return { HoverableNavLink };
});

vi.mock('@/app/ui/logo', (): Record<string, unknown> => {
  const Logo = ({ size }: { size: string }): React.ReactElement => {
    return React.createElement('div', { 'data-testid': 'logo', 'data-size': size });
  };
  return { default: Logo };
});


  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  test('renders Logo with sm size when isMd is true and calls media query helpers', (): void => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.__USE_MEDIA_RESULT__ = true;
    g.__BREAKPOINT_MD__ = '(min-width: 900px)';

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('sm');

    const bpCalls = (g.__BREAKPOINT_CALLS__ as Array<[string]>);
    expect(Array.isArray(bpCalls)).toBe(true);
    expect(bpCalls.length).toBe(1);
    expect(bpCalls[0][0]).toBe('md');

    const mediaCalls = (g.__USE_MEDIA_CALLS__ as Array<[string, boolean | undefined]>);
    expect(Array.isArray(mediaCalls)).toBe(true);
    expect(mediaCalls.length).toBe(1);
    expect(mediaCalls[0][0]).toBe('(min-width: 900px)');
    expect(mediaCalls[0][1]).toBe(true);
  });

  test('renders Logo with xxs size when isMd is false', (): void => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.__USE_MEDIA_RESULT__ = false;

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('xxs');
  });

  test('renders top links excluding disabled routes and marks active by pathname', (): void => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.__PATHNAME__ = '/limits';

    render(<Navbar linksGroup="top" />);

    const list = screen.getByRole('list');
    expect(list).toBeDefined();

    const items = screen.queryAllByTestId('nav-item');
    // Top links total: 8, disabled: '/chart', '/export' -> 6 remain
    expect(items.length).toBe(6);

    // Ensure one active item for '/limits'
    const activeItems = items.filter((el) => el.getAttribute('data-active') === 'true');
    expect(activeItems.length).toBe(1);
    expect(activeItems[0]?.getAttribute('data-url')).toBe('/limits');

    // Ensure withScale is true for all
    const allScaled = items.every((el) => el.getAttribute('data-scale') === 'true');
    expect(allScaled).toBe(true);
  });

  test('renders bottom links and filters all when disabled, resulting in empty list', (): void => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.__PATHNAME__ = '/feedback';

    render(<Navbar linksGroup="bottom" />);

    const list = screen.getByRole('list');
    expect(list).toBeDefined();

    const items = screen.queryAllByTestId('nav-item');
    // Bottom links total: 2, disabled both -> 0 remain
    expect(items.length).toBe(0);
  });

  test('handles null pathname without marking any active link', (): void => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.__PATHNAME__ = null as unknown as string;

    render(<Navbar linksGroup="top" />);

    const items = screen.queryAllByTestId('nav-item');
    const activeItems = items.filter((el) => el.getAttribute('data-active') === 'true');
    expect(activeItems.length).toBe(0);
  });

  test('assigns sequential idx values after filtering disabled routes', (): void => {
    render(<Navbar linksGroup="top" />);

    const items = screen.queryAllByTestId('nav-item');
    // Should be 6 items (after filtering)
    items.forEach((el, index) => {
      expect(el.getAttribute('data-idx')).toBe(String(index));
    });
