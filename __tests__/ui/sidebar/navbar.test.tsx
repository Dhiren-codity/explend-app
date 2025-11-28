import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { useMedia } from 'react-use';
import { usePathname } from 'next/navigation';
import Navbar from './navbar';



vi.mock('react-icons/pi', () => {
  const Icon = (_props: Record<string, unknown>): React.ReactElement => React.createElement('span');
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

vi.mock('react-use', () => {
  return {
    useMedia: vi.fn(),
  };

vi.mock('next/navigation', () => {
  return {
    usePathname: vi.fn(),
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
  return {
    DISABLED_ROUTES: disabledRoutes,
    ROUTE: routeObject,
  };

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: vi.fn(() => '(min-width: 768px)'),
  };


vi.mock('../hoverables', () => {
  const HoverableNavLink = (props: {
    idx: number;
    link: MockNavLink;
    isActiveLink: boolean;
    withScale?: boolean;
  }): React.ReactElement => {
    const { idx, link, isActiveLink, withScale } = props;
    return (
      
      >
        {link.title}
      </li>
    );
  };
  return { HoverableNavLink };
});

vi.mock('../logo', () => {
  const Logo = (props: { size: unknown }): React.ReactElement => {
    return <div data-testid="logo" data-size={String(props.size)} />;
  };
  return { default: Logo };
});


  afterEach((): void => {
    vi.clearAllMocks();
  });

    useMediaMock.mockReturnValue(true);
    const usePathnameMock = usePathname as unknown as { mockReturnValue: (_v: unknown) => unknown };
    usePathnameMock.mockReturnValue(routeObject.MONTHLY_REPORT);

    disabledRoutes.push(routeObject.EXPORT);

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('sm');

    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Monthly Report')).toBeDefined();
    expect(screen.getByText('Chart')).toBeDefined();
    expect(screen.getByText('Limits')).toBeDefined();
    expect(screen.getByText('Subscriptions')).toBeDefined();
    expect(screen.getByText('Categories')).toBeDefined();
    expect(screen.getByText('Settings')).toBeDefined();
    expect(screen.queryByText('Export')).toBeNull();

    const list = screen.getByRole('list');
    const items = within(list).getAllByTestId('hoverable-item');
    const active = items.find((el) => el.getAttribute('data-active') === 'true');
    expect(active).toBeDefined();
    expect(active?.textContent).toContain('Monthly Report');
  });

    useMediaMock.mockReturnValue(false);
    const usePathnameMock = usePathname as unknown as { mockReturnValue: (_v: unknown) => unknown };
    usePathnameMock.mockReturnValue(routeObject.FEEDBACK);

    render(<Navbar linksGroup="bottom" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('xxs');

    expect(screen.getByText('Feedback')).toBeDefined();
    expect(screen.getByText('Issue')).toBeDefined();

    const list = screen.getByRole('list');
    const items = within(list).getAllByTestId('hoverable-item');
    const active = items.find((el) => el.getAttribute('data-active') === 'true');
    expect(active).toBeDefined();
    expect(active?.textContent).toContain('Feedback');

    expect(items[0].getAttribute('data-idx')).toBe('0');
    expect(items[1].getAttribute('data-idx')).toBe('1');
    expect(items[0].getAttribute('data-scale')).toBe('true');
    expect(items[1].getAttribute('data-scale')).toBe('true');
  });

    usePathnameMock.mockReturnValue(null as unknown as string);

    render(<Navbar linksGroup="top" />);

    const list = screen.getByRole('list');
    const items = within(list).queryAllByTestId('hoverable-item');
    expect(items.length).toBe(0);
  });

  test('does not render logo when withLogo is false (or omitted)', (): void => {
    render(<Navbar linksGroup="bottom" />);

    expect(screen.queryByTestId('logo')).toBeNull();
  });
