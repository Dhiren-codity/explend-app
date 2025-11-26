import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Navbar from '@/app/ui/sidebar/navbar';

let mediaReturnValue = true;
let mockedPathnameValue = '/';
const disabledRoutesMock: string[] = ['/limits', '/issue'];

vi.mock('react-icons/pi', (): Record<string, unknown> => {
  const Stub = (): null => null;
  return {
    PiBugBeetle: Stub,
    PiBugBeetleFill: Stub,
    PiChatText: Stub,
    PiChatTextFill: Stub,
    PiDownloadSimple: Stub,
    PiDownloadSimpleFill: Stub,
    PiEscalatorUp: Stub,
    PiEscalatorUpFill: Stub,
    PiGearSix: Stub,
    PiGearSixFill: Stub,
    PiHouse: Stub,
    PiHouseFill: Stub,
    PiPolygon: Stub,
    PiPolygonFill: Stub,
    PiPresentationChart: Stub,
    PiPresentationChartFill: Stub,
    PiRepeat: Stub,
    PiRepeatFill: Stub,
    PiStack: Stub,
    PiStackFill: Stub,
  };
});

vi.mock('react-use', (): Record<string, unknown> => {
  return {
    useMedia: vi.fn((): boolean => mediaReturnValue),
  };
});

vi.mock('next/navigation', (): Record<string, unknown> => {
  return {
    usePathname: vi.fn((): string => mockedPathnameValue),
  };
});

vi.mock('@/config/constants/navigation', (): Record<string, unknown> => {
  return {
    NAV_ICON_SIZE: 16,
    NAV_TITLE: {
      HOME: 'Home',
      MONTHLY_REPORT: 'Monthly',
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
      MONTHLY_REPORT: '/monthly',
      CHART: '/chart',
      LIMITS: '/limits',
      SUBSCRIPTIONS: '/subs',
      CATEGORIES: '/categories',
      EXPORT: '/export',
      SETTINGS: '/settings',
      FEEDBACK: '/feedback',
      ISSUE: '/issue',
    },
    DISABLED_ROUTES: disabledRoutesMock,
  };
});

vi.mock('@/app/lib/helpers', (): Record<string, unknown> => {
  return {
    getBreakpointWidth: (bp: string): string => `(min-width:${bp})`,
  };
});

vi.mock('../hoverables', (): Record<string, unknown> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const HoverableNavLink = (props: unknown): JSX.Element => {
    const p = props as {
      idx: number;
      link: { title: string; url: string };
      isActiveLink: boolean;
      withScale?: boolean;
    };
    return (
      <li
        data-testid="hoverable-nav-link"
        data-idx={String(p.idx)}
        data-url={p.link.url}
        data-title={p.link.title}
        data-active={p.isActiveLink ? 'true' : 'false'}
        data-with-scale={p.withScale ? 'true' : 'false'}
      >
        {p.link.title}
      </li>
    );
  };
  return { HoverableNavLink };
});

vi.mock('../logo', (): Record<string, unknown> => {
  const Logo = (props: unknown): JSX.Element => {
    const { size } = props as { size: string };
    return <div data-testid="logo" data-size={size} />;
  };
  return { default: Logo };
});

describe('Navbar', (): void => {
  beforeEach((): void => {
    mediaReturnValue = true;
    mockedPathnameValue = '/';
    disabledRoutesMock.length = 0;
    disabledRoutesMock.push('/limits', '/issue');
  });

  afterEach((): void => {
    cleanup();
    vi.clearAllMocks();
  });

  test('should render logo with size "sm" on md screens when withLogo is true', (): void => {
    mediaReturnValue = true;
    render(<Navbar linksGroup="top" withLogo />);
    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('sm');
  });

  test('should render logo with size "xxs" on small screens when withLogo is true', (): void => {
    mediaReturnValue = false;
    render(<Navbar linksGroup="top" withLogo />);
    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('xxs');
  });

    const logo = screen.queryByTestId('logo');
    expect(logo).toBeNull();
  });


    const list = screen.getByRole('list');
    expect(list).toBeDefined();

    const links = screen.queryAllByTestId('hoverable-nav-link');
    // Top links total: 8, but '/limits' is disabled => 7
    expect(links.length).toBe(7);

    const disabled = links.find((el) => el.getAttribute('data-url') === '/limits');
    expect(disabled).toBeUndefined();

    const active = links.find((el) => el.getAttribute('data-url') === '/settings');
    expect(active).toBeDefined();
    expect(active?.getAttribute('data-active')).toBe('true');

    const nonActiveAllFalse = links
      .filter((el) => el.getAttribute('data-url') !== '/settings')
      .every((el) => el.getAttribute('data-active') === 'false');
    expect(nonActiveAllFalse).toBe(true);

    // idx should be sequential starting at 0
    const indices = links.map((el) => Number(el.getAttribute('data-idx')));
    const isSequential = indices.every((v, i) => v === i);
    expect(isSequential).toBe(true);
  });


    const list = screen.getByRole('list');
    expect(list).toBeDefined();

    const links = screen.queryAllByTestId('hoverable-nav-link');
    // Bottom links total: 2, but '/issue' is disabled => 1
    expect(links.length).toBe(1);

    const only = links[0];
    expect(only.getAttribute('data-url')).toBe('/feedback');
    expect(only.getAttribute('data-active')).toBe('true');
  });


    const links = screen.queryAllByTestId('hoverable-nav-link');
    expect(links.length).toBe(0);
  });

    const list = await screen.findByRole('list');
    expect(list).toBeDefined();
  });
});
