import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

let mediaQueryMatch: boolean = true;
let mockedPathname: string = '/';
const disabledRoutes: string[] = [];

vi.mock('react-icons/pi', (): Record<string, unknown> => {
  const MockIcon = (_props: Record<string, unknown>): JSX.Element | null => null;
  return {
    PiBugBeetle: MockIcon,
    PiBugBeetleFill: MockIcon,
    PiChatText: MockIcon,
    PiChatTextFill: MockIcon,
    PiDownloadSimple: MockIcon,
    PiDownloadSimpleFill: MockIcon,
    PiEscalatorUp: MockIcon,
    PiEscalatorUpFill: MockIcon,
    PiGearSix: MockIcon,
    PiGearSixFill: MockIcon,
    PiHouse: MockIcon,
    PiHouseFill: MockIcon,
    PiPolygon: MockIcon,
    PiPolygonFill: MockIcon,
    PiPresentationChart: MockIcon,
    PiPresentationChartFill: MockIcon,
    PiRepeat: MockIcon,
    PiRepeatFill: MockIcon,
    PiStack: MockIcon,
    PiStackFill: MockIcon,
  };
});

vi.mock('react-use', (): Record<string, unknown> => {
  return {
    useMedia: vi.fn((_query: string, _defaultState?: boolean): boolean => mediaQueryMatch),
  };
});

vi.mock('next/navigation', (): Record<string, unknown> => {
  return {
    usePathname: vi.fn((): string => mockedPathname),
  };
});

vi.mock('@/app/lib/helpers', (): Record<string, unknown> => {
  return {
    getBreakpointWidth: (bp: string): string => `(min-width: ${bp})`,
  };
});

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
});

vi.mock('@/config/constants/routes', (): Record<string, unknown> => {
  return {
    ROUTE: {
      HOME: '/',
      MONTHLY_REPORT: '/report',
      CHART: '/chart',
      LIMITS: '/limits',
      SUBSCRIPTIONS: '/subscriptions',
      CATEGORIES: '/categories',
      EXPORT: '/export',
      SETTINGS: '/settings',
      FEEDBACK: '/feedback',
      ISSUE: '/issue',
    },
    DISABLED_ROUTES: disabledRoutes,
  };
});

vi.mock('../hoverables', (): Record<string, unknown> => {
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
      <li
        data-testid={`navlink-${idx}`}
        data-title={link.title}
        data-url={link.url}
        data-active={isActiveLink ? 'true' : 'false'}
        data-with-scale={withScale ? 'true' : 'false'}
      >
        {link.title}
      </li>
    );
  };
  return { HoverableNavLink };
});

vi.mock('../logo', (): Record<string, unknown> => {
  const Logo = ({ size }: { size: 'sm' | 'xxs' }): JSX.Element => (
    <div data-testid="logo" data-size={size} />
  );
  return { __esModule: true, default: Logo };
});

describe('Navbar', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks();
    // Reset dynamic values for each test
    mediaQueryMatch = true;
    mockedPathname = '/';
    disabledRoutes.splice(0, disabledRoutes.length);
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });


    render(<Navbar linksGroup="top" withLogo />);

    const list = screen.getByRole('list');
    const items = screen.getAllByRole('listitem');
    expect(list).toBeDefined();
    expect(items.length).toBe(7);

    const urls = items.map((el) => el.getAttribute('data-url'));
    expect(urls).not.toContain('/report');

    const subsEl = items.find((el) => el.getAttribute('data-url') === '/subscriptions');
    expect(subsEl?.getAttribute('data-active')).toBe('true');

    const homeEl = items.find((el) => el.getAttribute('data-url') === '/');
    expect(homeEl?.getAttribute('data-active')).toBe('false');

    for (const el of items) {
      expect(el.getAttribute('data-with-scale')).toBe('true');
    }

    const logo = screen.getByTestId('logo');
    expect(logo.getAttribute('data-size')).toBe('sm');
  });


    render(<Navbar linksGroup="bottom" />);

    const list = screen.getByRole('list');
    expect(list).toBeDefined();

    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(1);

    const onlyItem = items[0];
    expect(onlyItem.getAttribute('data-url')).toBe('/feedback');
    expect(onlyItem.getAttribute('data-active')).toBe('true');

    const logo = screen.queryByTestId('logo');
    expect(logo).toBeNull();
  });


    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo.getAttribute('data-size')).toBe('xxs');
  });


    render(<Navbar linksGroup="top" withLogo />);

    const list = screen.getByRole('list');
    expect(list).toBeDefined();
    const items = screen.queryAllByRole('listitem');
    expect(items.length).toBe(0);
  });


    vi.doMock('react-use', (): Record<string, unknown> => {
      return {
        useMedia: vi.fn((_query: string, _defaultState?: boolean): boolean => true),
      };
    });

    vi.doMock('next/navigation', (): Record<string, unknown> => {
      return {
        usePathname: vi.fn((): string => '/'),
      };
    });

    vi.doMock('@/config/constants/navigation', (): Record<string, unknown> => {
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
    });

    vi.doMock('@/config/constants/routes', (): Record<string, unknown> => {
      return {
        ROUTE: {
          HOME: '/',
          MONTHLY_REPORT: '/report',
          CHART: '/chart',
          LIMITS: '/limits',
          SUBSCRIPTIONS: '/subscriptions',
          CATEGORIES: '/categories',
          EXPORT: '/export',
          SETTINGS: '/settings',
          FEEDBACK: '/feedback',
          ISSUE: '/issue',
        },
        DISABLED_ROUTES: [],
      };
    });

    vi.doMock('@/app/lib/helpers', (): Record<string, unknown> => {
      return {
        getBreakpointWidth: (_bp: string): string => {
          throw new Error('bad breakpoint');
        },
      };
    });

    vi.doMock('../hoverables', (): Record<string, unknown> => {
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
          <li
            data-testid={`navlink-${idx}`}
            data-title={link.title}
            data-url={link.url}
            data-active={isActiveLink ? 'true' : 'false'}
            data-with-scale={withScale ? 'true' : 'false'}
          >
            {link.title}
          </li>
        );
      };
      return { HoverableNavLink };
    });

    vi.doMock('../logo', (): Record<string, unknown> => {
      const Logo = ({ size }: { size: 'sm' | 'xxs' }): JSX.Element => (
        <div data-testid="logo" data-size={size} />
      );
      return { __esModule: true, default: Logo };
    });

    const { default: Navbar } = (await import('./navbar')) as {
      default: (_props: Record<string, unknown>) => JSX.Element;
    };

    expect((): void => {
      render(<Navbar linksGroup="top" withLogo />);
    }).toThrow('bad breakpoint');
  });
});
