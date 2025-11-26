import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Navbar from '@/app/ui/sidebar/navbar';

vi.mock('react-icons/pi', (): Record<string, unknown> => {
  const stub = (): null => null;
  return {
    PiBugBeetle: stub,
    PiBugBeetleFill: stub,
    PiChatText: stub,
    PiChatTextFill: stub,
    PiDownloadSimple: stub,
    PiDownloadSimpleFill: stub,
    PiEscalatorUp: stub,
    PiEscalatorUpFill: stub,
    PiGearSix: stub,
    PiGearSixFill: stub,
    PiHouse: stub,
    PiHouseFill: stub,
    PiPolygon: stub,
    PiPolygonFill: stub,
    PiPresentationChart: stub,
    PiPresentationChartFill: stub,
    PiRepeat: stub,
    PiRepeatFill: stub,
    PiStack: stub,
    PiStackFill: stub,
  };
});

vi.mock('react-use', (): Record<string, unknown> => {
  return {
    useMedia: vi.fn(),
  };
});

vi.mock('next/navigation', (): Record<string, unknown> => {
  return {
    usePathname: vi.fn(),
  };
});

vi.mock('@/config/constants/navigation', (): Record<string, unknown> => {
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
  // mutable array so tests can modify
  const DISABLED_ROUTES: string[] = [];
  return { ROUTE, DISABLED_ROUTES };
});

vi.mock('@/app/lib/helpers', (): Record<string, unknown> => {
  return {
    getBreakpointWidth: vi.fn((_bp: string): string => '(min-width: 768px)'),
  };
});

// Mock HoverableNavLink both by alias and relative path resolution
vi.mock('@/app/ui/hoverables', (): Record<string, unknown> => {
  return {
    HoverableNavLink: ({
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
        <li
          role="listitem"
          data-idx={String(idx)}
          data-title={link.title}
          data-url={link.url}
          data-active={isActiveLink ? 'true' : 'false'}
          data-scale={withScale ? 'true' : 'false'}
        >
          {link.title}
        </li>
      );
    },
  };
});

vi.mock('../hoverables', (): Record<string, unknown> => {
  return {
    HoverableNavLink: ({
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
        <li
          role="listitem"
          data-idx={String(idx)}
          data-title={link.title}
          data-url={link.url}
          data-active={isActiveLink ? 'true' : 'false'}
          data-scale={withScale ? 'true' : 'false'}
        >
          {link.title}
        </li>
      );
    },
  };
});

// Mock Logo both by alias and relative path resolution
vi.mock('@/app/ui/logo', (): Record<string, unknown> => {
  return {
    default: ({ size }: { size: string }): JSX.Element => {
      return <div data-logo-size={size}>Logo</div>;
    },
  };
});

vi.mock('../logo', (): Record<string, unknown> => {
  return {
    default: ({ size }: { size: string }): JSX.Element => {
      return <div data-logo-size={size}>Logo</div>;
    },
  };
});

describe('Navbar', (): void => {
  beforeEach((): void => {
    // no-op, tests will configure mocks per-case
  });

  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  test('renders top nav links and marks the active link based on pathname', async (): Promise<void> => {
    const reactUse = (await import('react-use')) as unknown as {
      useMedia: { mockReturnValue: (value: boolean) => void; mockReset: () => void };
    };
    const nextNavigation = (await import('next/navigation')) as unknown as {
      usePathname: { mockReturnValue: (value: string) => void; mockReset: () => void };
    };
    const routesMod = (await import('@/config/constants/routes')) as unknown as {
      ROUTE: Record<string, string>;
      DISABLED_ROUTES: string[];
    };

    // Set media to md and pathname to SETTINGS
    reactUse.useMedia.mockReturnValue(true);
    nextNavigation.usePathname.mockReturnValue(routesMod.ROUTE.SETTINGS);

    render(<Navbar linksGroup="top" withLogo />);

    const list = screen.getByRole('list');
    expect(list).toBeTruthy();

    const items = screen.getAllByRole('listitem');
    expect(items.length > 0).toBe(true);

    // Verify indices are sequential
    items.forEach((el, idx): void => {
      expect(el.getAttribute('data-idx')).toBe(String(idx));
      // All items should be scaled
      expect(el.getAttribute('data-scale')).toBe('true');
    });

    // Active item is the one matching pathname
    const activeByUrl = items.find((el): boolean => el.getAttribute('data-url') === routesMod.ROUTE.SETTINGS) ?? null;
    expect(activeByUrl).not.toBeNull();
    if (activeByUrl) {
      expect(activeByUrl.getAttribute('data-active')).toBe('true');
    }

    // Non-active items should be false
    const nonActiveAllFalse = items
      .filter((el): boolean => el !== activeByUrl)
      .every((el): boolean => el.getAttribute('data-active') === 'false');
    expect(nonActiveAllFalse).toBe(true);
  });

  test('filters out disabled routes at render time', async (): Promise<void> => {
    const reactUse = (await import('react-use')) as unknown as {
      useMedia: { mockReturnValue: (value: boolean) => void; mockReset: () => void };
    };
    const nextNavigation = (await import('next/navigation')) as unknown as {
      usePathname: { mockReturnValue: (value: string) => void; mockReset: () => void };
    };
    const routesMod = (await import('@/config/constants/routes')) as unknown as {
      ROUTE: Record<string, string>;
      DISABLED_ROUTES: string[];
    };

    reactUse.useMedia.mockReturnValue(true);
    nextNavigation.usePathname.mockReturnValue(routesMod.ROUTE.HOME);

    // Baseline render
    render(<Navbar linksGroup="top" />);
    const baselineCount = screen.getAllByRole('listitem').length;

    // Clean up and disable one known top link route
    cleanup();
    routesMod.DISABLED_ROUTES.length = 0;
    routesMod.DISABLED_ROUTES.push(routesMod.ROUTE.EXPORT);

    render(<Navbar linksGroup="top" />);
    const filteredCount = screen.getAllByRole('listitem').length;

    expect(filteredCount).toBe(baselineCount - 1);
  });

  test('renders bottom link group when linksGroup is "bottom"', async (): Promise<void> => {
    const reactUse = (await import('react-use')) as unknown as {
      useMedia: { mockReturnValue: (value: boolean) => void; mockReset: () => void };
    };
    const nextNavigation = (await import('next/navigation')) as unknown as {
      usePathname: { mockReturnValue: (value: string) => void; mockReset: () => void };
    };

    reactUse.useMedia.mockReturnValue(false);
    nextNavigation.usePathname.mockReturnValue('/not-matching');

    render(<Navbar linksGroup="bottom" />);

    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(2);

    const titles = items.map((el): string => el.getAttribute('data-title') ?? '');
    expect(titles).toEqual(['Feedback', 'Issue']);
  });

  test('falls back to bottom links when an invalid linksGroup is passed', async (): Promise<void> => {
    const reactUse = (await import('react-use')) as unknown as {
      useMedia: { mockReturnValue: (value: boolean) => void; mockReset: () => void };
    };
    const nextNavigation = (await import('next/navigation')) as unknown as {
      usePathname: { mockReturnValue: (value: string) => void; mockReset: () => void };
    };

    reactUse.useMedia.mockReturnValue(true);
    nextNavigation.usePathname.mockReturnValue('/');

    // @ts-expect-error intentional invalid value to test runtime fallback
    render(<Navbar linksGroup={'invalid' as unknown as 'top'} />);

    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(2);

    const titles = items.map((el): string => el.getAttribute('data-title') ?? '');
    expect(titles).toEqual(['Feedback', 'Issue']);
  });

  test('renders Logo with correct size depending on media query', async (): Promise<void> => {
    const reactUse = (await import('react-use')) as unknown as {
      useMedia: { mockReturnValue: (value: boolean) => void; mockReset: () => void };
    };
    const nextNavigation = (await import('next/navigation')) as unknown as {
      usePathname: { mockReturnValue: (value: string) => void; mockReset: () => void };
    };

    nextNavigation.usePathname.mockReturnValue('/');

    // md true -> sm
    reactUse.useMedia.mockReturnValue(true);
    render(<Navbar linksGroup="top" withLogo />);
    const logoSm = screen.getByText('Logo');
    expect(logoSm.getAttribute('data-logo-size')).toBe('sm');

    cleanup();

    // md false -> xxs
    reactUse.useMedia.mockReturnValue(false);
    render(<Navbar linksGroup="top" withLogo />);
    const logoXxs = screen.getByText('Logo');
    expect(logoXxs.getAttribute('data-logo-size')).toBe('xxs');
  });

  test('does not render Logo when withLogo is false', async (): Promise<void> => {
    const reactUse = (await import('react-use')) as unknown as {
      useMedia: { mockReturnValue: (value: boolean) => void; mockReset: () => void };
    };
    const nextNavigation = (await import('next/navigation')) as unknown as {
      usePathname: { mockReturnValue: (value: string) => void; mockReset: () => void };
    };

    reactUse.useMedia.mockReturnValue(true);
    nextNavigation.usePathname.mockReturnValue('/');

    render(<Navbar linksGroup="top" withLogo={false} />);

    const logoQuery = screen.queryByText('Logo');
    expect(logoQuery).toBeNull();
  });
});