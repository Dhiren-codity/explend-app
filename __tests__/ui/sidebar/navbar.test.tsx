import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

let mockUseMediaReturn: boolean;
let mockPathnameReturn: string | undefined;
let mockDisabledRoutes: string[];
let shouldThrowBreakpoint: boolean;

vi.mock('react-use', () => {
  return {
    useMedia: vi.fn((_query: unknown, _defaultState?: unknown) => mockUseMediaReturn),
  };
});

vi.mock('next/navigation', () => {
  return {
    usePathname: vi.fn(() => mockPathnameReturn as unknown as string),
  };
});

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
  return { NAV_ICON_SIZE, NAV_TITLE };
});

vi.mock('@/config/constants/routes', () => {
  const ROUTE = {
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
  };
  const mod: Record<string, unknown> = { ROUTE };
  Object.defineProperty(mod, 'DISABLED_ROUTES', {
    get(): string[] {
      return mockDisabledRoutes;
    },
    enumerable: true,
  });
  return mod;
});

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: vi.fn((_bp: unknown): string => {
      if (shouldThrowBreakpoint) {
        throw new Error('getBreakpointWidth error');
      }
      return '(min-width: 768px)';
    }),
  };
});

// Mock internal components relative to navbar.tsx import specifiers
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
  }): React.ReactElement => {
    return (
      <li
        data-testid="nav-item"
        data-idx={String(idx)}
        data-active={String(isActiveLink)}
        data-title={link.title}
        data-url={link.url}
        data-scale={String(Boolean(withScale))}
      />
    );
  };
  return { HoverableNavLink };
});

vi.mock('../logo', () => {
  const Logo = ({ size }: { size: string }): React.ReactElement => {
    return <div data-testid="logo" data-size={size} />;
  };
  return { default: Logo };
});

describe('Navbar', (): void => {
  beforeEach((): void => {
    vi.resetModules();
    vi.clearAllMocks();
    cleanup();
    mockUseMediaReturn = true;
    mockPathnameReturn = '/home';
    mockDisabledRoutes = [];
    shouldThrowBreakpoint = false;
  });

  afterEach((): void => {
    vi.clearAllMocks();
    cleanup();
  });


    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('sm');

    const list = screen.getByRole('list');
    expect(list).toBeDefined();
  });


    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('xxs');
  });


    render(<Navbar linksGroup="top" />);

    const items = screen.queryAllByTestId('nav-item');
    // top has 8 links; disabled 2 => 6
    expect(items.length).toBe(6);

    // Verify index ordering and active state for '/chart'
    items.forEach((item, index) => {
      expect(item.getAttribute('data-idx')).toBe(String(index));
      const url = item.getAttribute('data-url');
      const isActive = item.getAttribute('data-active') === 'true';
      expect(isActive).toBe(url === '/chart');
      // withScale is always true in component
      expect(item.getAttribute('data-scale')).toBe('true');
    });
  });


    render(<Navbar linksGroup="bottom" />);

    const items = screen.queryAllByTestId('nav-item');
    // bottom has 2; disabled 1 => 1
    expect(items.length).toBe(1);

    const item = items[0];
    expect(item.getAttribute('data-url')).toBe('/feedback');
    expect(item.getAttribute('data-active')).toBe('true');
  });


    render(<Navbar linksGroup="top" />);

    const items = screen.queryAllByTestId('nav-item');
    expect(items.length).toBe(0);
  });


    render(<Navbar linksGroup="bottom" />);

    const items = screen.queryAllByTestId('nav-item');
    // bottom has 2 links by default
    expect(items.length).toBe(2);
    items.forEach((item) => {
      expect(item.getAttribute('data-active')).toBe('false');
    });
  });

  test('throws when getBreakpointWidth errors (error case)', async (): Promise<void> => {
    shouldThrowBreakpoint = true;
    const importNavbar = async (): Promise<unknown> =>
      import('@/app/ui/sidebar/navbar');

    await expect(importNavbar()).rejects.toThrow('getBreakpointWidth error');
  });
});
