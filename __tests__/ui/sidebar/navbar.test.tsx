import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

vi.mock('react-icons/pi', () => {
  const NullComp = (_props: unknown): null => null;
  return {
    PiBugBeetle: NullComp,
    PiBugBeetleFill: NullComp,
    PiChatText: NullComp,
    PiChatTextFill: NullComp,
    PiDownloadSimple: NullComp,
    PiDownloadSimpleFill: NullComp,
    PiEscalatorUp: NullComp,
    PiEscalatorUpFill: NullComp,
    PiGearSix: NullComp,
    PiGearSixFill: NullComp,
    PiHouse: NullComp,
    PiHouseFill: NullComp,
    PiPolygon: NullComp,
    PiPolygonFill: NullComp,
    PiPresentationChart: NullComp,
    PiPresentationChartFill: NullComp,
    PiRepeat: NullComp,
    PiRepeatFill: NullComp,
    PiStack: NullComp,
    PiStackFill: NullComp,
  };
});

vi.mock('react-use', () => {
  const g = globalThis as unknown as { __useMediaReturn?: boolean };
  if (typeof g.__useMediaReturn === 'undefined') g.__useMediaReturn = true;
  return {
    useMedia: (_query?: unknown, _defaultState?: unknown): boolean => {
      return Boolean(g.__useMediaReturn);
    },
  };
});

vi.mock('next/navigation', () => {
  const g = globalThis as unknown as { __pathname?: unknown };
  if (typeof g.__pathname === 'undefined') g.__pathname = '/home';
  return {
    usePathname: (): string | undefined => g.__pathname as string | undefined,
  };
});

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: (_name: unknown): string => '(min-width: 768px)',
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
  const g = globalThis as unknown as { __disabledRoutes?: string[] };
  if (!g.__disabledRoutes) g.__disabledRoutes = [];
  return {
    ROUTE: {
      HOME: '/home',
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
    DISABLED_ROUTES: g.__disabledRoutes,
  };
});

vi.mock('../hoverables', () => {
  return {
    HoverableNavLink: ({
      link,
      isActiveLink,
    }: {
      idx: number;
      link: { title: string; url: string };
      isActiveLink: boolean;
      withScale?: boolean;
    }): JSX.Element => {
      return (
        <li data-testid="nav-link" data-active={isActiveLink ? 'true' : 'false'}>
          {link.title}
        </li>
      );
    },
  };
});

vi.mock('../logo', () => {
  return {
    default: ({ size }: { size?: string }): JSX.Element => {
      return <div data-testid="logo" data-size={size ?? ''} />;
    },
  };
});

import Navbar from './navbar';

describe('Navbar', (): void => {
  beforeEach((): void => {
    const g = globalThis as unknown as {
      __useMediaReturn?: boolean;
      __pathname?: unknown;
      __disabledRoutes?: string[];
    };
    g.__useMediaReturn = true;
    g.__pathname = '/home';
    if (!g.__disabledRoutes) {
      g.__disabledRoutes = [];
    } else {
      g.__disabledRoutes.length = 0;
    }
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

    g.__pathname = '/settings';

    render(<Navbar linksGroup="top" />);

    const list = screen.getByRole('list');
    expect(list).toBeDefined();

    const items = screen.getAllByTestId('nav-link');
    expect(items.length).toBe(8);

    const active = screen.getByText('Settings');
    expect(active.getAttribute('data-active')).toBe('true');

    const inactive = screen.getByText('Home');
    expect(inactive.getAttribute('data-active')).toBe('false');
  });

    g.__disabledRoutes?.push('/issue');
    g.__pathname = '/feedback';

    render(<Navbar linksGroup="bottom" />);

    expect(screen.getByText('Feedback')).toBeDefined();
    expect(screen.queryByText('Issue')).toBeNull();

    const items = screen.getAllByTestId('nav-link');
    expect(items.length).toBe(1);
  });

    g.__disabledRoutes?.push('/export');

    render(<Navbar linksGroup="top" />);

    expect(screen.queryByText('Export')).toBeNull();

    const items = screen.getAllByTestId('nav-link');
    expect(items.length).toBe(7);
  });

    g.__useMediaReturn = true;

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('sm');
  });

    g.__useMediaReturn = false;

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('xxs');
  });

  test('does not render Logo when withLogo is not provided', (): void => {
    render(<Navbar linksGroup="top" />);

    expect(screen.queryByTestId('logo')).toBeNull();
  });

    g.__pathname = undefined;

    render(<Navbar linksGroup="top" />);

    const items = screen.getAllByTestId('nav-link');
    for (const el of items) {
      expect(el.getAttribute('data-active')).toBe('false');
    }
  });

  test('supports async queries for nav links', async (): Promise<void> => {
    render(<Navbar linksGroup="top" />);

    const items = await screen.findAllByTestId('nav-link');
    expect(items.length).toBe(8);
  });
});
